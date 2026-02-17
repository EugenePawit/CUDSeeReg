import { Subject, FlattenedSubject, GroupedSubject } from '../types/subject';
import { parseThaiTime } from './thaiTimeParser';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/csv';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function parseCSV(text: string): Subject[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const subjects: Subject[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parse CSV with proper quote handling
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        // Map to subject object
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
        });

        // Parse arrays (fields that contain multiple values separated by |)
        const parseField = (val: string): string | string[] => {
            if (!val) return '';
            if (val.includes('|')) {
                return val.split('|').map(v => v.trim());
            }
            return val;
        };

        subjects.push({
            order: parseInt(row['ลำดับ'] || '0'),
            code: row['รหัสวิชา'] || '',
            name: row['ชื่อวิชา'] || '',
            credit: row['หน่วยกิต'] || '',
            classPerWeek: row['ชม./สัปดาห์'] || '',
            group: parseField(row['กลุ่ม']),
            instructor: parseField(row['ผู้สอน']),
            enrollment: parseField(row['รับ']),
            electiveQuantity: parseField(row['เลือก']),
            updatedElectiveQuantity: parseField(row['เลือก(update)']),
            classtime: parseField(row['เวลาเรียน']),
            classroom: parseField(row['ห้องเรียน']),
            note: parseField(row['หมายเหตุ']),
        });
    }

    return subjects;
}

export async function fetchSubjects(grade: number): Promise<Subject[]> {
    const cacheKey = `cudseereg_subjects_m${grade}_csv_v1`;

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

