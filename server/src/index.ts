import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sql, connectWithRetry } from './db.ts';
import { seed } from './seed.ts';
import type { SubjectData } from './types.ts';

const app = new Hono();

app.use('/api/*', cors());

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', async (c) => {
    try {
        await sql`SELECT 1`;
        return c.json({ ok: true, db: 'up' });
    } catch {
        return c.json({ ok: false, db: 'down' }, 503);
    }
});

// ─── Terms ───────────────────────────────────────────────────────────────────
app.get('/api/terms', async (c) => {
    const rows = await sql`
        SELECT id, label, year, semester, is_default AS "isDefault"
        FROM terms ORDER BY year, semester
    `;
    return c.json(rows);
});

app.post('/api/terms', async (c) => {
    const b = await c.req.json();
    if (!b?.id || typeof b.year !== 'number' || typeof b.semester !== 'number') {
        return c.json({ error: 'id, year and semester are required' }, 400);
    }
    const existing = await sql`SELECT 1 FROM terms WHERE id = ${b.id}`;
    if (existing.length > 0) return c.json({ error: 'Term already exists' }, 409);
    await sql`
        INSERT INTO terms (id, label, year, semester, is_default)
        VALUES (${b.id}, ${b.label ?? b.id}, ${b.year}, ${b.semester}, ${b.isDefault ?? false})
    `;
    return c.json({ ok: true }, 201);
});

app.put('/api/terms/:id', async (c) => {
    const id = c.req.param('id');
    const b = await c.req.json();
    await sql`
        UPDATE terms SET
            label = COALESCE(${b.label ?? null}, label),
            year = COALESCE(${b.year ?? null}, year),
            semester = COALESCE(${b.semester ?? null}, semester),
            "order" = COALESCE(${b.order ?? null}, "order")
        WHERE id = ${id}
    `;
    return c.json({ ok: true });
});

app.delete('/api/terms/:id', async (c) => {
    const id = c.req.param('id');
    await sql`DELETE FROM subjects WHERE term_id = ${id}`;
    await sql`DELETE FROM terms WHERE id = ${id}`;
    return c.json({ ok: true });
});

// Rename a term (change ID) - migrates all associated subjects
app.put('/api/terms/:id/rename', async (c) => {
    const oldId = c.req.param('id');
    const b = await c.req.json();
    const { newId, newLabel } = b;
    if (!newId || !newLabel) {
        return c.json({ error: 'newId and newLabel are required' }, 400);
    }
    // Check if new ID already exists
    const existing = await sql`SELECT 1 FROM terms WHERE id = ${newId}`;
    if (existing.length > 0) return c.json({ error: 'Term ID already exists' }, 409);
    // Get the original term
    const [term] = await sql`SELECT * FROM terms WHERE id = ${oldId}`;
    if (!term) return c.json({ error: 'Term not found' }, 404);
    // Create new term with new ID
    await sql`
        INSERT INTO terms (id, label, year, semester, is_default, "order")
        VALUES (${newId}, ${newLabel}, ${term.year}, ${term.semester}, ${term.is_default}, ${term.order})
    `;
    // Migrate subjects to new term ID
    await sql`UPDATE subjects SET term_id = ${newId} WHERE term_id = ${oldId}`;
    // Delete old term
    await sql`DELETE FROM terms WHERE id = ${oldId}`;
    return c.json({ ok: true });
});

// ─── Timetables ──────────────────────────────────────────────────────────────
app.get('/api/timetables', async (c) => {
    const rows = await sql`SELECT id, label, grade, schedule FROM timetables ORDER BY grade, id`;
    return c.json(rows);
});

app.put('/api/timetables/:id', async (c) => {
    const id = c.req.param('id');
    const b = await c.req.json();
    if (!b?.label || typeof b.grade !== 'number' || !b.schedule) {
        return c.json({ error: 'label, grade and schedule are required' }, 400);
    }
    await sql`
        INSERT INTO timetables (id, label, grade, schedule)
        VALUES (${id}, ${b.label}, ${b.grade}, ${sql.json(b.schedule as never)})
        ON CONFLICT (id) DO UPDATE
            SET label = EXCLUDED.label,
                grade = EXCLUDED.grade,
                schedule = EXCLUDED.schedule
    `;
    return c.json({ ok: true });
});

app.delete('/api/timetables/:id', async (c) => {
    await sql`DELETE FROM timetables WHERE id = ${c.req.param('id')}`;
    return c.json({ ok: true });
});

// ─── Subjects ────────────────────────────────────────────────────────────────
// Stored data is returned merged with the row id so the client can edit/delete.
app.get('/api/subjects', async (c) => {
    const term = c.req.query('term');
    const grade = c.req.query('grade');
    if (!term || !grade) return c.json({ error: 'term and grade are required' }, 400);
    const rows = await sql<{ id: number; data: SubjectData }[]>`
        SELECT id, data FROM subjects
        WHERE term_id = ${term} AND grade = ${grade}
        ORDER BY id
    `;
    return c.json(rows.map((r) => ({ ...r.data, id: Number(r.id) })));
});

app.post('/api/subjects', async (c) => {
    const b = await c.req.json();
    if (!b?.termId || !b?.grade || !b?.data) {
        return c.json({ error: 'termId, grade and data are required' }, 400);
    }
    const [row] = await sql<{ id: number }[]>`
        INSERT INTO subjects (term_id, grade, data)
        VALUES (${b.termId}, ${b.grade}, ${sql.json(b.data as never)})
        RETURNING id
    `;
    return c.json({ ...b.data, id: Number(row.id) }, 201);
});

app.put('/api/subjects/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const b = await c.req.json();
    if (!b?.data) return c.json({ error: 'data is required' }, 400);
    await sql`UPDATE subjects SET data = ${sql.json(b.data as never)} WHERE id = ${id}`;
    return c.json({ ok: true });
});

app.delete('/api/subjects/:id', async (c) => {
    await sql`DELETE FROM subjects WHERE id = ${Number(c.req.param('id'))}`;
    return c.json({ ok: true });
});

// Surface DB errors as 503 rather than crashing the request.
app.onError((err, c) => {
    console.error('[api] error:', err);
    return c.json({ error: 'Internal error' }, 500);
});

const port = Number(process.env.PORT ?? 3001);

// Start listening immediately; connect to the DB in the background with retry
// so the container is healthy even if Postgres is still booting.
connectWithRetry()
    .then(() => seed())
    .then(() => console.log('[db] ready and seeded'))
    .catch((err) => {
        console.error('[db] failed to initialize:', err);
        process.exit(1);
    });

console.log(`[api] listening on :${port}`);

export default { port, fetch: app.fetch };
