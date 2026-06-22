import type { Subject } from '@/types/subject';

// Column headers used in the import/template files (order matters for templates).
export const IMPORT_COLUMNS = [
    'code',
    'name',
    'credit',
    'group',
    'instructor',
    'classtime',
    'classroom',
    'enrollment',
    'electiveQuantity',
] as const;

type ImportColumn = (typeof IMPORT_COLUMNS)[number];

// Human-friendly hints shown to the admin and used as the example row.
const EXAMPLE_ROW: Record<ImportColumn, string> = {
    code: 'W20202',
    name: 'Thai Art',
    credit: '1.0',
    group: '1',
    instructor: 'A. Somchai',
    classtime: 'จ.7-8',
    classroom: 'Room 101',
    enrollment: '30',
    electiveQuantity: '30',
};

function rowToSubject(row: Record<string, unknown>): Subject | null {
    const get = (key: ImportColumn): string => {
        const value = row[key];
        return value === undefined || value === null ? '' : String(value).trim();
    };

    const code = get('code');
    const name = get('name');
    // Skip blank/example-less rows entirely.
    if (!code && !name) return null;

    const electiveQuantity = get('electiveQuantity') || get('enrollment') || '30';

    return {
        order: Date.now() + Math.floor(Math.random() * 1000),
        code,
        name,
        credit: get('credit') || '1.0',
        classPerWeek: '2',
        group: get('group') || '1',
        instructor: get('instructor'),
        enrollment: get('enrollment') || electiveQuantity,
        electiveQuantity,
        updatedElectiveQuantity: electiveQuantity,
        classtime: get('classtime'),
        classroom: get('classroom'),
        note: '',
    };
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
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

function parseCSV(text: string): Subject[] {
    const lines = text.replace(/\r/g, '').trim().split('\n').filter((l) => l.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map((h) => h.trim());
    const subjects: Subject[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cells = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
            row[header] = cells[idx] ?? '';
        });
        const subject = rowToSubject(row);
        if (subject) subjects.push(subject);
    }
    return subjects;
}

// ─── Parse uploaded file (csv or xlsx) ─────────────────────────────────────────
export async function parseSubjectFile(file: File): Promise<Subject[]> {
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';

    if (isCsv) {
        const text = await file.text();
        return parseCSV(text);
    }

    // xlsx / xls — parse with SheetJS (loaded lazily to keep the main bundle small).
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    return rows.map(rowToSubject).filter((s): s is Subject => s !== null);
}

// ─── Template downloads ────────────────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadCsvTemplate() {
    const header = IMPORT_COLUMNS.join(',');
    const example = IMPORT_COLUMNS.map((col) => {
        const value = EXAMPLE_ROW[col];
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(',');
    const csv = `${header}\n${example}\n`;
    triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'subjects-template.csv');
}

export async function downloadXlsxTemplate() {
    const XLSX = await import('xlsx');
    const data: string[][] = [
        [...IMPORT_COLUMNS],
        IMPORT_COLUMNS.map((col) => EXAMPLE_ROW[col]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Subjects');
    XLSX.writeFile(workbook, 'subjects-template.xlsx');
}
