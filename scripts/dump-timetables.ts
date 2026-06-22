// One-off generator: dumps the in-code BASE_TIMETABLES into a JSON file the
// API server seeds from, so the database starts with the exact same data.
// Run with: bun run scripts/dump-timetables.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { BASE_TIMETABLES } from '../src/lib/baseTimetables';

mkdirSync('server/src', { recursive: true });
writeFileSync('server/src/seed-timetables.json', JSON.stringify(BASE_TIMETABLES, null, 2) + '\n');
console.log(`Wrote ${Object.keys(BASE_TIMETABLES).length} timetables to server/src/seed-timetables.json`);
