import { expect, test } from 'bun:test';
import { decodeTimetableShare, encodeTimetableShare, extractSharedSubjects, resolveSharedSubjects } from '../src/lib/shareTimetable';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects } from '../src/lib/bundledSubjects';

// Frozen tokens from each previously supported wire format. Do not regenerate
// them with the current encoder: these protect links already in circulation.
test('existing v1, v2, packed, extended, catalog-index and JSON links still decode', () => {
    expect(decodeTimetableShare('AQpNNS1TY2llbmNlAQRDMTAxATIFV2VkIDc')).toEqual({
        v: 1, b: 'M5-Science', s: [{ c: 'C101', g: '2', t: 'Wed 7' }], n: undefined,
    });
    for (const token of ['AggBBEMxMDEBMgVBbGljZQ', 'wQRDMTAxggVBbGljZQ', 'OAEEQzEwMQEyBUFsaWNl']) {
        expect(decodeTimetableShare(token)).toEqual({
            v: 1, b: 'M5-Science', s: [{ c: 'C101', g: '2', t: '' }], n: 'Alice',
        });
    }
    expect(decodeTimetableShare('GAIAgQEFQWxpY2U')).toEqual({
        v: 1, b: 'M5-Science', s: [{ c: '', g: '', t: '', i: 0 }, { c: '', g: '', t: '', i: 129 }], n: 'Alice',
    });
    expect(decodeTimetableShare('eyJ2IjozLCJiIjoiTTUtU2NpZW5jZS0yNTY5LTIiLCJzIjpbeyJjIjoiQzEwMSIsImciOiIyIiwidCI6IldlZCA3In1dLCJuIjoiQWxpY2UiLCJ0ZXJtIjoiMjU2OS8yIiwibWlsaXRhcnkiOnRydWV9')).toEqual({
        v: 1, b: 'M5-Science-2569-2', s: [{ c: 'C101', g: '2', t: 'Wed 7' }], n: 'Alice', term: '2569/2', military: true,
    });
});

test('compact links preserve Thai identities and names, and are shorter than JSON links', () => {
    const catalog = flattenSubjects(getBundledSubjects('2569/2', '5'));
    const selected = { Monday: { 1: catalog[0], 2: catalog[1], 3: catalog[2] }, Friday: { 1: catalog[0] } };
    const refs = extractSharedSubjects(selected);
    const name = 'นักเรียนทดสอบ 🎓';
    const token = encodeTimetableShare('M5-Science-2569-2', selected, name, catalog)!;
    const oldToken = Buffer.from(JSON.stringify({ v: 3, b: 'M5-Science-2569-2', s: refs, n: name, term: '2569/2', military: false })).toString('base64url');
    expect(token.length).toBeLessThan(oldToken.length * 0.7);
    const payload = decodeTimetableShare(token)!;
    expect(payload).toEqual({ v: 1, b: 'M5-Science-2569-2', s: refs, n: name, term: '2569/2', military: false });
    expect(resolveSharedSubjects(payload.s, [...catalog].reverse()).resolved).toEqual(catalog.slice(0, 3));
});

test('compact links cover every base, empty schedules and long UTF-8 strings', () => {
    const bases = ['M1-EP', 'M1-Normal', 'M2-EP', 'M2-Normal', 'M3-EP', 'M3-Normal', 'M4-Science', 'M4-Arts', 'M5-Science', 'M5-Arts', 'M6-Science', 'M6-Arts'];
    for (const base of bases) {
        const token = encodeTimetableShare(`${base}-2569-2`, {})!;
        expect(token.length).toBe(6);
        expect(decodeTimetableShare(token)).toEqual({ v: 1, b: `${base}-2569-2`, s: [], n: undefined, term: '2569/2', military: false });
    }
    const catalog = flattenSubjects(getBundledSubjects('2569/2', '1'));
    const custom = { ...catalog[0], code: 'custom'.repeat(60), group: 'กลุ่มพิเศษ', classtime: 'พุธ 7'.repeat(60) };
    const name = 'ชื่อ'.repeat(100);
    const token = encodeTimetableShare('M1-EP-2569-2', { Monday: { 1: custom } }, ` ${name} `)!;
    expect(decodeTimetableShare(token)?.n).toBe(name);
    expect(decodeTimetableShare(token)?.s).toEqual([{ c: custom.code, g: custom.group, t: custom.classtime }]);
});

test('incomplete, unknown and malformed compact links are rejected', () => {
    const catalog = flattenSubjects(getBundledSubjects('2569/2', '1'));
    const token = encodeTimetableShare('M1-EP-2569-2', { Monday: { 1: catalog[0] } }, 'Name')!;
    const bytes = Buffer.from(token, 'base64url');
    for (let end = 1; end < bytes.length; end++) {
        expect(decodeTimetableShare(bytes.subarray(0, end).toString('base64url'))).toBeNull();
    }
    for (const bytes of [[4, 12, 0, 0], [4, 0, 4, 0], [4, 0, 0, 0, 99], [4, 0, 0, 1, 1, 255, 0, 0]]) {
        expect(decodeTimetableShare(Buffer.from(bytes).toString('base64url'))).toBeNull();
    }
});
