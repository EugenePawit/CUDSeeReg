import { Subject, FlattenedSubject, GroupedSubject } from '../types/subject';
import { parseThaiTime } from './thaiTimeParser';

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/ronnapatp/cudElective/main/data/json';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchSubjects(grade: number): Promise<Subject[]> {
    const cacheKey = `cudseereg_subjects_m${grade}_v2`;

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
            const updatedQuantities = Array.isArray(subject.updatedElectiveQuantity)
                ? subject.updatedElectiveQuantity
                : [subject.updatedElectiveQuantity];

            for (let i = 0; i < groups.length; i++) {
                const classtime = classtimes[i] || classtimes[0] || '';
                flattened.push({
                    ...subject,
                    group: groups[i] || '',
                    instructor: instructors[i] || instructors[0] || '',
                    classtime,
                    classroom: classrooms[i] || classrooms[0] || '',
                    updatedElectiveQuantity: updatedQuantities[i] || '0',
                    parsedTimeSlots: parseThaiTime(classtime),
                    availableSeats: parseInt(updatedQuantities[i] || '0', 10),
                });
            }
        } else {
            const classtime = subject.classtime as string;
            flattened.push({
                ...subject,
                group: subject.group as string,
                instructor: subject.instructor as string,
                classtime,
                classroom: subject.classroom as string,
                updatedElectiveQuantity: subject.updatedElectiveQuantity as string,
                parsedTimeSlots: parseThaiTime(classtime),
                availableSeats: parseInt(subject.updatedElectiveQuantity as string, 10),
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
