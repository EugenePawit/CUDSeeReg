import { Subject, FlattenedSubject, GroupedSubject } from '../types/subject';
import { parseThaiTime } from './thaiTimeParser';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/json';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchSubjects(grade: number): Promise<Subject[]> {
    const cacheKey = `cudseereg_subjects_m${grade}_json_v3`;

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

    const url = `${GITHUB_BASE_URL}/m${grade}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

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
