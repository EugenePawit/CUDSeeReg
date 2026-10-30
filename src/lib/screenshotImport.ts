import type { FlattenedSubject, BaseTimetable, UserTimetable } from '@/types/subject';
import { fitsTimetable } from './timetables2569_2';

export interface OcrWord { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }
export interface ScannedCourse { code: string; text: string; group?: string }
const digits = (text: string) => text.replace(/[๐-๙]/g, c => String(c.charCodeAt(0) - 0x0e50));
const normalize = (text: string) => digits(text).replace(/[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/g, '').replace(/[^a-zA-Zก-ฮ0-9]/g, '').toLowerCase();
export const offeringId = (s: FlattenedSubject) => JSON.stringify([s.code, s.group, s.classtime]);

// Codes anchor each card. Keep neighboring columns and lower cards out of its name/group text.
export function coursesFromWords(words: OcrWord[]): ScannedCourse[] {
    const anchors = words.flatMap(word => {
        const match = digits(word.text).replace(/\s/g, '').match(/^([ก-ฮa-zA-Z0-9]?)(\d{5})$/);
        return match ? [{ word, code: match[1] + match[2] }] : [];
    });
    const columns: number[] = [];
    for (const { word } of [...anchors].sort((a,b) => a.word.bbox.x0-b.word.bbox.x0)) {
        if (!columns.some(x => Math.abs(x-word.bbox.x0) < Math.max(30, (word.bbox.y1-word.bbox.y0)*5))) columns.push(word.bbox.x0);
    }
    return anchors.map(({ word, code }) => {
        const h = Math.max(8, word.bbox.y1-word.bbox.y0);
        const col = columns.reduce((best, x) => Math.abs(x-word.bbox.x0)<Math.abs(best-word.bbox.x0)?x:best, columns[0]);
        const right = columns.find(x => x>col+h*5) ?? Infinity;
        const previous = anchors.filter(a => Math.abs(a.word.bbox.x0-col)<h*5 && a.word.bbox.y0<word.bbox.y0-h)
            .reduce((y,a) => Math.max(y,a.word.bbox.y1), -Infinity);
        const top = Math.max(word.bbox.y0-h*6, previous+h*0.5);
        const nameWords = words.filter(w => w !== word && w.bbox.x0>=col-h && w.bbox.x0<right-h*2
            && w.bbox.y0>=top && w.bbox.y1<=word.bbox.y0+h*0.3).sort((a,b)=>a.bbox.y0-b.bbox.y0);
        const lines: { top: number; words: OcrWord[] }[]=[];
        for (const w of nameWords) {
            const line=lines.find(l=>Math.abs(l.top-w.bbox.y0)<h*1.4);
            if(line)line.words.push(w);else lines.push({top:w.bbox.y0,words:[w]});
        }
        const text=lines.map(l=>l.words.sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ')).join(' ');
        const group = normalize(text).match(/กลม(\d{1,2})(?!\d)/)?.[1];
        return { code, text, group };
    });
}
export function courseFromText(text: string): ScannedCourse | null {
    const lines=digits(text).split('\n').map(line=>line.trim()).filter(Boolean);
    // Codes are printed below the course title; prefer the last code-shaped token.
    for(let i=lines.length-1;i>=0;i--) {
        const code=lines[i].replace(/\s/g,'').match(/^([ก-ฮa-zA-Z0-9]?)(\d{5})$/);
        if(!code)continue;
        const name=lines.slice(0,i).join(' ');
        return {code:code[1]+code[2],text:name,group:normalize(name).match(/กลม(\d{1,2})(?!\d)/)?.[1]};
    }
    return null;
}
export function mergeCourseReads(focused: ScannedCourse[], fallback: ScannedCourse[]) {
    return [...focused,...fallback.filter(course=>!focused.some(read=>read.code.slice(-5)===course.code.slice(-5)
        && (read.group===course.group || (!!read.group && !course.group))))];
}
function similarity(a: string, b: string) {
    a=normalize(a).replace(/กลม\d+/g,''); b=normalize(b);
    if (a.length<4 || b.length<4) return 0;
    if (a.includes(b) || b.includes(a)) return Math.min(a.length,b.length)/Math.max(a.length,b.length);
    const pairs=(s:string) => new Set(Array.from({length:s.length-1},(_,i)=>s.slice(i,i+2)));
    const x=pairs(a),y=pairs(b); return 2*[...x].filter(p=>y.has(p)).length/(x.size+y.size);
}
export function matchScannedCourses(courses: ScannedCourse[], catalog: FlattenedSubject[]) {
    const seen = new Set<string>(); let duplicates=0; const ignoredSeen=new Set<string>();
    const matches: { source: ScannedCourse; candidates: FlattenedSubject[]; selected: string; recovered: boolean }[]=[];
    const ignored: ScannedCourse[]=[];
    for (const source of courses) {
        let candidates=catalog.filter(s=>normalize(s.code)===normalize(source.code));
        let recovered=false;
        if (!candidates.length) {
            // A misread Thai prefix is accepted for review only with matching numeric code AND some name evidence; matched subjects with only one offering can use that group automatically.
            candidates=catalog.filter(s=>s.code.slice(-5)===source.code.slice(-5) && similarity(source.text,s.name)>=0.25);
            recovered=candidates.length>0;
        }
        if (!candidates.length) { const key=JSON.stringify([source.code.slice(-5),source.group ?? '']); if(ignoredSeen.has(key))duplicates++;else {ignoredSeen.add(key);ignored.push(source);} continue; }
        const dedup=JSON.stringify([candidates[0].code,source.group ?? '']);
        if (seen.has(dedup)) { duplicates++; continue; } seen.add(dedup);
        const unique=[...new Map(candidates.map(s=>[offeringId(s),s])).values()];
        const explicit=source.group ? unique.filter(s=>normalize(s.group)===source.group) : unique;
        const selected=unique.length===1 ? offeringId(unique[0])
            : explicit.length===1 && (!recovered || similarity(source.text,explicit[0].name)>=0.7) ? offeringId(explicit[0]) : '';
        matches.push({source,candidates:unique,selected,recovered});
    }
    return {matches,ignored,duplicates};
}
export function planScreenshotImport(incoming: FlattenedSubject[], existing: UserTimetable, timetable: BaseTimetable) {
    const occupied=new Map<string,string>(); const seen=new Set<string>();
    for(const s of Object.values(existing).flatMap(day=>Object.values(day))) {
        seen.add(offeringId(s)); for(const slot of s.parsedTimeSlots) for(const p of slot.periods) occupied.set(`${slot.day}:${p}`,s.name);
    }
    const additions: FlattenedSubject[]=[]; const conflicts: string[]=[]; let duplicates=0;
    for(const s of incoming) {
        if(seen.has(offeringId(s))) { duplicates++; continue; }
        if(!fitsTimetable(s,timetable)) { conflicts.push(`${s.code} กลุ่ม ${s.group}: ไม่ตรงกับคาบวิชาเลือกของห้องนี้`); continue; }
        if(s.parsedTimeSlots.some(slot=>slot.periods.some(p=>occupied.has(`${slot.day}:${p}`)))) {
            conflicts.push(`${s.code} กลุ่ม ${s.group}: เวลาเรียนทับกับวิชาอื่น`); continue;
        }
        additions.push(s);seen.add(offeringId(s));
        for(const slot of s.parsedTimeSlots) for(const p of slot.periods) occupied.set(`${slot.day}:${p}`,s.name);
    }
    return { additions, conflicts, duplicates };
}
