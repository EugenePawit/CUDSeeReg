import { sql } from './db.ts';
import type { Timetable } from './types.ts';
import baseTimetables from './seed-timetables.json' with { type: 'json' };

// Idempotently load the existing in-code data into the database. Base
// timetables and the default term (2568/1) are inserted only when missing,
// so restarts and manual edits are preserved.
export async function seed(): Promise<void> {
    const [{ count: termCount }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM terms
    `;
    if (termCount === 0) {
        await sql`
            INSERT INTO terms (id, label, year, semester, is_default, "order")
            VALUES ('2568/1', '2568/1', 2568, 1, true, 0)
        `;
        console.log('[seed] inserted default term 2568/1');
    }

    const [{ count: ttCount }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM timetables
    `;
    if (ttCount === 0) {
        const timetables = Object.values(baseTimetables as Record<string, Timetable>);
        for (const tt of timetables) {
            await sql`
                INSERT INTO timetables (id, label, grade, schedule)
                VALUES (${tt.id}, ${tt.label}, ${tt.grade}, ${sql.json(tt.schedule as never)})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`[seed] inserted ${timetables.length} base timetables`);
    }
}
