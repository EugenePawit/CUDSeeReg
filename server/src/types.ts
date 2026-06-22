// Shared shapes between the API and the frontend. Kept intentionally loose:
// subjects are stored as JSON so the structure can evolve without migrations.

export interface Term {
    id: string;
    label: string;
    year: number;
    semester: number;
    isDefault?: boolean;
    order?: number;
}

export interface TimetableEntry {
    code: string;
    name: string;
    type: 'core' | 'elective' | 'break';
}

export interface Timetable {
    id: string;
    label: string;
    grade: number;
    term_id: string;
    schedule: Record<string, Record<string, TimetableEntry>>;
}

// Subject payload is opaque JSON to the API; the frontend owns its shape.
export type SubjectData = Record<string, unknown>;

export interface SubjectRow {
    id: number;
    termId: string;
    grade: string;
    data: SubjectData;
}
