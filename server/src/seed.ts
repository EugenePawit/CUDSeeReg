import { sql } from './db.ts';
import baseTimetables from './seed-timetables.json' with { type: 'json' };
import subjects2569_2 from './subjects-2569-2.json' with { type: 'json' };

// Idempotently load the existing in-code data into the database. Base
// timetables and the default term (2569/1) are inserted only when missing,
// so restarts and manual edits are preserved.
export async function seed(): Promise<void> {
    const [{ count: termCount }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM terms
    `;
    if (termCount === 0) {
        await sql`
            INSERT INTO terms (id, label, year, semester, is_default, "order")
            VALUES ('2569/1', '2569/1', 2569, 1, true, 0)
        `;
        console.log('[seed] inserted default term 2569/1');
    }

    const [{ count: ttCount }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM timetables
    `;
    if (ttCount === 0) {
        const timetables = Object.values(baseTimetables).filter(tt => tt.termId === '2569/1');
        for (const tt of timetables) {
            await sql`
                INSERT INTO timetables (id, label, grade, term_id, schedule)
                VALUES (${tt.id}, ${tt.label}, ${tt.grade}, '2569/1', ${sql.json(tt.schedule as never)})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        console.log(`[seed] inserted ${timetables.length} base timetables`);
    }

    // Record this import once so restarts preserve subsequent admin edits/deletes.
    await sql`CREATE TABLE IF NOT EXISTS seed_imports (id text PRIMARY KEY)`;
    await sql.begin(async (tx) => {
        const imported = await tx`
            INSERT INTO seed_imports (id) VALUES ('timetables-2569-2-v1')
            ON CONFLICT DO NOTHING RETURNING id
        `;
        if (!imported.length) return;
        for (const timetable of Object.values(baseTimetables).filter(tt => tt.termId === '2569/2')) {
            await tx`
                INSERT INTO timetables (id, label, grade, term_id, schedule)
                VALUES (${timetable.id}, ${timetable.label}, ${timetable.grade}, '2569/2', ${tx.json(timetable.schedule as never)})
                ON CONFLICT (id) DO NOTHING
            `;
        }
    });
    await sql.begin(async (tx) => {
        const imported = await tx`
            INSERT INTO seed_imports (id) VALUES ('subjects-2569-2-v1')
            ON CONFLICT DO NOTHING RETURNING id
        `;
        if (!imported.length) return;
        await tx`
            INSERT INTO terms (id, label, year, semester, is_default, "order")
            VALUES ('2569/2', '2569/2', 2569, 2, false,
                    (SELECT COALESCE(MAX("order"), -1) + 1 FROM terms))
            ON CONFLICT (id) DO NOTHING
        `;
        for (const [grade, subjects] of Object.entries(subjects2569_2)) {
            for (const subject of subjects) {
                // Preserve any pre-existing course group imported by an admin.
                await tx`
                    INSERT INTO subjects (term_id, grade, data)
                    SELECT '2569/2', ${grade}, ${tx.json(subject as never)}
                    WHERE NOT EXISTS (
                        SELECT 1 FROM subjects WHERE term_id = '2569/2' AND grade = ${grade}
                        AND data->>'code' = ${subject.code}
                        AND data->>'group' = ${subject.group}
                        AND data->>'classtime' = ${subject.classtime}
                    )
                `;
            }
        }
        console.log('[seed] imported subjects for 2569/2');
    });
}
