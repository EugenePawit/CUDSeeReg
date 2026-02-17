import { Subject, FlattenedSubject, GroupedSubject } from '../types/subject';
import { parseThaiTime } from './thaiTimeParser';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/csv';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Day name mapping for period columns
const DAY_MAP: Record<string, string> = {
    'จันทร์': 'จ',
    'อังคาร': 'อ',
    'พุธ': 'พ',
    'พฤหัสบดี': 'พฤ',
    'ศุกร์': 'ศ',
};

function parseCSV(text: string): Subject[] {
    const lines = text.trim().split('\n');
    if (lines.length < 5) return [];

    // Find the header row with column names
    let headerLineIdx = -1;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('รหัสวิชา') && lines[i].includes('ชื่อรายวิชา')) {
            headerLineIdx = i;
            break;
        }
    }

    if (headerLineIdx === -1) return [];

    // Parse header to get column positions
    const headerCells = parseCSVLine(lines[headerLineIdx]);
    const codeIdx = headerCells.findIndex(h => h.includes('รหัสวิชา'));
    const nameIdx = headerCells.findIndex(h => h.includes('ชื่อรายวิชา') || h.includes('ชื่อวิชา'));
    const creditIdx = headerCells.findIndex(h => h.includes('นก'));
    const classPerWeekIdx = headerCells.findIndex(h => h.includes('คาบ/สัปดาห์'));
    const descIdx = headerCells.findIndex(h => h.includes('คำแนะนำรายวิชา'));
    const instructorIdx = headerCells.findIndex(h => h.includes('อ.ผู้สอน') || h.includes('ผู้สอน'));
    const groupIdx = headerCells.findIndex(h => h.includes('กลุ่ม / ตอนเรียน') || h.includes('กลุ่ม'));
    const programIdx = headerCells.findIndex(h => h.includes('กลุ่มการเรียนที่ลงทะเบียนได้'));
    const enrollmentIdx = headerCells.findIndex(h => h.includes('จำนวนรับ'));
    const conditionIdx = headerCells.findIndex(h => h.includes('เงื่อนไขรายวิชา'));

    // Find where period columns start (after condition column or enrollment)
    const periodStartIdx = Math.max(conditionIdx, enrollmentIdx) + 1;

    const subjects: Subject[] = [];
    let currentSubject: Partial<Subject> | null = null;
    let subjectGroups: Array<{
        group: string;
        instructor: string;
        enrollment: string;
        periods: string[];
    }> = [];

    for (let i = headerLineIdx + 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('กลุ่มสาระ')) continue;

        const cells = parseCSVLine(line);
        const code = cells[codeIdx]?.trim() || '';

        // New subject starts
        if (code) {
            // Save previous subject
            if (currentSubject && subjectGroups.length > 0) {
                saveSubject(currentSubject, subjectGroups, subjects);
            }

            // Start new subject
            currentSubject = {
                order: subjects.length + 1,
                code,
                name: cells[nameIdx]?.trim() || '',
                credit: cells[creditIdx]?.trim() || '',
                classPerWeek: cells[classPerWeekIdx]?.trim() || '',
                note: cells[descIdx]?.trim() || '',
            };
            subjectGroups = [];
        }

        // Parse group data
        if (currentSubject) {
            const group = cells[groupIdx]?.trim() || '';
            const instructor = cells[instructorIdx]?.trim() || '';
            const enrollment = cells[enrollmentIdx]?.trim() || '';

            // Extract periods from checkmarks
            const periods: string[] = [];
            for (let j = periodStartIdx; j < cells.length; j++) {
                if (cells[j]?.includes('✔')) {
                    periods.push(String(j - periodStartIdx));
                }
            }

            if (group || instructor) {
                subjectGroups.push({ group, instructor, enrollment, periods });
            }
        }
    }

    // Save last subject
    if (currentSubject && subjectGroups.length > 0) {
        saveSubject(currentSubject, subjectGroups, subjects);
    }

    return subjects;
}

function parseCSVLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            cells.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    cells.push(current);

    return cells;
}

function saveSubject(
    baseSubject: Partial<Subject>,
    groups: Array<{ group: string; instructor: string; enrollment: string; periods: string[] }>,
    subjects: Subject[]
) {
    const noteText = baseSubject.note || '';

    if (groups.length === 1) {
        // Single group
        const g = groups[0];
        subjects.push({
            order: baseSubject.order || 0,
            code: baseSubject.code || '',
            name: baseSubject.name || '',
            credit: baseSubject.credit || '',
            classPerWeek: baseSubject.classPerWeek || '',
            group: g.group,
            instructor: g.instructor,
            enrollment: g.enrollment,
            electiveQuantity: g.enrollment,
            updatedElectiveQuantity: g.enrollment,
            classtime: '', // Period data available in periods array but hard to convert back to Thai format
            classroom: '',
            note: noteText,
        });
    } else {
        // Multiple groups - all fields must be arrays
        const multiGroupSubject: Subject = {
            order: baseSubject.order || 0,
            code: baseSubject.code || '',
            name: baseSubject.name || '',
            credit: baseSubject.credit || '',
            classPerWeek: baseSubject.classPerWeek || '',
            group: groups.map(g => g.group),
            instructor: groups.map(g => g.instructor),
            enrollment: groups.map(g => g.enrollment),
            electiveQuantity: groups.map(g => g.enrollment),
            updatedElectiveQuantity: groups.map(g => g.enrollment),
            classtime: groups.map(() => ''),
            classroom: groups.map(() => ''),
            note: groups.map(() => noteText) as string[],
        };
        subjects.push(multiGroupSubject);
    }
}

export async function fetchSubjects(grade: number): Promise<Subject[]> {
    const cacheKey = `cudseereg_subjects_m${grade}_csv_v2`;

    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
                    return parsedCache.data;
                }
            } catch (error) {
                console.warn('Failed to parse cached data:', error);
            }
        }
    }

    const url = `${GITHUB_BASE_URL}/m${grade}.csv`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const csvText = await response.text();
    const data = parseCSV(csvText);

    if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    }

    return data;
}

export function flattenSubjects(subjects: Subject[]): FlattenedSubject[] {
    const flattened: FlattenedSubject[] = [];

    for (const subject of subjects) {
        const hasMultipleGroups = Array.isArray(subject.group);

        if (hasMultipleGroups) {
            const groups = subject.group as string[];
            const instructors = Array.isArray(subject.instructor) ? subject.instructor : [subject.instructor];
            const classtimes = Array.isArray(subject.classtime) ? subject.classtime : [subject.classtime];
            const classrooms = Array.isArray(subject.classroom) ? subject.classroom : [subject.classroom];
            const enrollments = Array.isArray(subject.enrollment) ? subject.enrollment : [subject.enrollment];
            const updatedQuantities = Array.isArray(subject.updatedElectiveQuantity)
                ? subject.updatedElectiveQuantity
                : [subject.updatedElectiveQuantity];
            const notes = Array.isArray(subject.note) ? subject.note : [subject.note];

            for (let i = 0; i < groups.length; i++) {
                const classtime = classtimes[i] || classtimes[0] || '';
                const enrollment = enrollments[i] || enrollments[0] || '0';
                const updatedQty = updatedQuantities[i] || updatedQuantities[0] || enrollment;

                flattened.push({
                    ...subject,
                    group: groups[i] || '',
                    instructor: instructors[i] || instructors[0] || '',
                    classtime,
                    classroom: classrooms[i] || classrooms[0] || '',
                    enrollment,
                    electiveQuantity: enrollment,
                    updatedElectiveQuantity: updatedQty,
                    note: notes[i] || notes[0] || '',
                    parsedTimeSlots: parseThaiTime(classtime),
                    availableSeats: parseInt(updatedQty || enrollment || '0', 10),
                });
            }
        } else {
            const classtime = subject.classtime as string;
            const enrollment = subject.enrollment as string;
            const updatedQty = subject.updatedElectiveQuantity as string || enrollment;

            flattened.push({
                ...subject,
                group: subject.group as string,
                instructor: subject.instructor as string,
                classtime,
                classroom: subject.classroom as string,
                enrollment,
                electiveQuantity: enrollment,
                updatedElectiveQuantity: updatedQty,
                note: subject.note as string,
                parsedTimeSlots: parseThaiTime(classtime),
                availableSeats: parseInt(updatedQty || enrollment || '0', 10),
            });
        }
    }

    return flattened;
}

export function groupSubjectsByCode(flattened: FlattenedSubject[]): GroupedSubject[] {
    const grouped = new Map<string, FlattenedSubject[]>();

    for (const subject of flattened) {
        if (!grouped.has(subject.code)) {
            grouped.set(subject.code, []);
        }
        grouped.get(subject.code)!.push(subject);
    }

    return Array.from(grouped.entries()).map(([code, groups]) => ({
        code,
        name: groups[0].name,
        credit: groups[0].credit,
        groups,
    }));
}
