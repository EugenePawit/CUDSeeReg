import { Subject, FlattenedSubject, GroupedSubject } from '../types/subject';
import { parseThaiTime } from './thaiTimeParser';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/json';
const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/csv';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const memorySubjectCache = new Map<number, { data: Subject[]; timestamp: number }>();
const memoryDescriptionCache = new Map<number, { data: Record<string, string>; timestamp: number }>();

function isFresh(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
}

export async function fetchSubjects(grade: number): Promise<Subject[]> {
    const cacheKey = `cudseereg_subjects_m${grade}_json_v3`;
    const inMemory = memorySubjectCache.get(grade);
    if (inMemory && isFresh(inMemory.timestamp)) {
        return inMemory.data;
    }

    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                if (isFresh(parsedCache.timestamp)) {
                    memorySubjectCache.set(grade, parsedCache);
                    return parsedCache.data;
                }
            } catch (error) {
                console.warn('Failed to parse cached data:', error);
            }
        }
    }

    const url = `${GITHUB_BASE_URL}/m${grade}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    memorySubjectCache.set(grade, { data, timestamp: Date.now() });

    if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    }

    return data;
}

// Helper to parse a CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
                continue;
            }
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

// Fetch subject descriptions from CSV
export async function fetchSubjectDescriptions(grade: number): Promise<Record<string, string>> {
    const cacheKey = `cudseereg_descriptions_m${grade}_v2`;
    const inMemory = memoryDescriptionCache.get(grade);
    if (inMemory && isFresh(inMemory.timestamp)) {
        return inMemory.data;
    }

    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                if (isFresh(parsedCache.timestamp)) {
                    memoryDescriptionCache.set(grade, parsedCache);
                    return parsedCache.data;
                }
            } catch (error) {
                console.warn('Failed to parse cached descriptions:', error);
            }
        }
    }

    const url = `${GITHUB_CSV_URL}/m${grade}.csv`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const csvText = (await response.text()).replace(/\r/g, '');
    const lines = csvText.trim().split('\n');
    const descriptions: Record<string, string> = {};

    // Find header row
    let headerLineIdx = -1;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('รหัสวิชา') && lines[i].includes('ชื่อรายวิชา')) {
            headerLineIdx = i;
            break;
        }
    }

    if (headerLineIdx === -1) return descriptions;
    const headerCells = parseCSVLine(lines[headerLineIdx]).map((cell) => cell.trim());
    const codeIndex = headerCells.findIndex((header) => header.includes('รหัสวิชา'));
    const descriptionIndex = headerCells.findIndex((header) => header.includes('คำอธิบาย') || header.includes('แนะนำ'));

    // Parse data rows (skip header and the two rows after it)
    for (let i = headerLineIdx + 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('กลุ่มสาระ')) continue;

        const cells = parseCSVLine(line);
        const code = cells[Math.max(codeIndex, 0)]?.trim() || '';
        // Description is in the 5th column (index 4); use it as fallback if no explicit header match
        const descriptionCellIndex = descriptionIndex >= 0 ? descriptionIndex : 4;
        const description = cells[descriptionCellIndex]?.trim() || '';

        // Only store if we have a code (indicates new subject row)
        if (code && description) {
            descriptions[code] = description;
        }
    }
    memoryDescriptionCache.set(grade, { data: descriptions, timestamp: Date.now() });

    if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ data: descriptions, timestamp: Date.now() }));
    }

    return descriptions;
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
            const electiveQuantities = Array.isArray(subject.electiveQuantity) ? subject.electiveQuantity : [subject.electiveQuantity];
            const updatedQuantities = Array.isArray(subject.updatedElectiveQuantity)
                ? subject.updatedElectiveQuantity
                : [subject.updatedElectiveQuantity];
            const notes = Array.isArray(subject.note) ? subject.note : [subject.note];

            for (let i = 0; i < groups.length; i++) {
                const classtime = classtimes[i] || classtimes[0] || '';
                const enrollment = enrollments[i] || enrollments[0] || '';
                const electiveQty = electiveQuantities[i] || electiveQuantities[0] || '0';
                const updatedQty = updatedQuantities[i] || updatedQuantities[0] || electiveQty;

                flattened.push({
                    ...subject,
                    group: groups[i] || '',
                    instructor: instructors[i] || instructors[0] || '',
                    classtime,
                    classroom: classrooms[i] || classrooms[0] || '',
                    enrollment,
                    electiveQuantity: electiveQty,
                    updatedElectiveQuantity: updatedQty,
                    note: notes[i] || notes[0] || '',
                    parsedTimeSlots: parseThaiTime(classtime),
                    availableSeats: parseInt(updatedQty || electiveQty || '0', 10),
                });
            }
        } else {
            const classtime = subject.classtime as string;
            const enrollment = subject.enrollment as string;
            const electiveQty = subject.electiveQuantity as string;
            const updatedQty = subject.updatedElectiveQuantity as string || electiveQty;

            flattened.push({
                ...subject,
                group: subject.group as string,
                instructor: subject.instructor as string,
                classtime,
                classroom: subject.classroom as string,
                enrollment,
                electiveQuantity: electiveQty,
                updatedElectiveQuantity: updatedQty,
                note: subject.note as string,
                parsedTimeSlots: parseThaiTime(classtime),
                availableSeats: parseInt(updatedQty || electiveQty || '0', 10),
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
