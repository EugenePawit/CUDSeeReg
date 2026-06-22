import postgres from 'postgres';

const DATABASE_URL =
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/cudseereg';

export const sql = postgres(DATABASE_URL, {
    max: 10,
    onnotice: () => {}, // silence NOTICE noise from CREATE TABLE IF NOT EXISTS
});

export async function migrate(): Promise<void> {
    await sql`
        CREATE TABLE IF NOT EXISTS terms (
            id         text PRIMARY KEY,
            label      text NOT NULL,
            year       integer NOT NULL,
            semester   integer NOT NULL,
            is_default boolean NOT NULL DEFAULT false,
            "order"    integer NOT NULL DEFAULT 0
        )
    `;
    await sql`
        ALTER TABLE terms ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS timetables (
            id       text PRIMARY KEY,
            label    text NOT NULL,
            grade    integer NOT NULL,
            term_id  text NOT NULL,
            schedule jsonb NOT NULL
        )
    `;
    await sql`
        ALTER TABLE timetables ADD COLUMN IF NOT EXISTS term_id text
    `;
    await sql`
        UPDATE timetables SET term_id = '2569/1' WHERE term_id IS NULL
    `;
    await sql`
        ALTER TABLE timetables ALTER COLUMN term_id SET NOT NULL
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS timetables_term_grade_idx
        ON timetables (term_id, grade)
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS subjects (
            id         bigserial PRIMARY KEY,
            term_id    text NOT NULL,
            grade      text NOT NULL,
            data       jsonb NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        )
    `;
    await sql`
        CREATE INDEX IF NOT EXISTS subjects_term_grade_idx
        ON subjects (term_id, grade)
    `;
}

// Wait for Postgres to accept connections (the db container may still be
// starting), then run migrations. Retries with backoff before giving up.
export async function connectWithRetry(maxAttempts = 30): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await sql`SELECT 1`;
            await migrate();
            return;
        } catch (err) {
            lastError = err;
            const delay = Math.min(1000 * attempt, 5000);
            console.warn(`[db] not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw lastError;
}
