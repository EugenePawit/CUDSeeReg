import { expect, test } from 'bun:test';
import { coursesFromWords, matchScannedCourses, offeringId, planScreenshotImport, type OcrWord } from '../src/lib/screenshotImport';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects } from '../src/lib/bundledSubjects';
import { M6_DEMO_TIMETABLES } from '../src/lib/m6Demo';
const catalog=flattenSubjects(getBundledSubjects('2569/2','6'));
const word=(text:string,x:number,y:number):OcrWord=>({text,bbox:{x0:x,y0:y,x1:x+70,y1:y+10}});

test('card anchors separate columns and attach the right group across wrapped names',()=>{
 const cards=coursesFromWords([
  word('กราฟิกสร้างอาชีพ',100,30),word('กลุ่ม ๑',100,50),word('ง30270',100,70),
  word('พื้นฐานคณิตศาสตร์',400,30),word('กลุ่ม ๒',400,50),word('ค33221',400,70),
  word('วิชาถัดไป',100,110),word('กลุ่ม 3',100,130),word('ค33221',100,150),
 ]);
 expect(cards.map(c=>[c.code,c.group])).toEqual([['ง30270','1'],['ค33221','2'],['ค33221','3']]);
 expect(cards[0].text).not.toContain('คณิตศาสตร์');
});
test('overlapping screenshots deduplicate while keeping distinct groups; core subjects are excluded',()=>{
 const course={code:'ง30270',text:'กราฟิกสร้างอาชีพ กลุ่ม 1',group:'1'};
 const r=matchScannedCourses([course,course,{...course,group:'2'},{code:'ท33102',text:'ภาษาไทย 12'}],catalog);
 expect(r.matches).toHaveLength(2);expect(r.duplicates).toBe(1);expect(r.ignored).toHaveLength(1);
 expect(r.matches.map(m=>m.candidates.find(s=>offeringId(s)===m.selected)?.group)).toEqual(['1','2']);
});
test('ambiguous or invalid groups stay unresolved and incorrect numeric codes need name evidence',()=>{
 const r=matchScannedCourses([{code:'ง30270',text:'กราฟิกสร้างอาชีพ'},{code:'ค33221',text:'กลุ่ม 9',group:'9'},{code:'x30270',text:'Homeroom'}],catalog);
 expect(r.matches.map(m=>m.selected)).toEqual(['','']);expect(r.ignored).toHaveLength(1);
 const recovered=matchScannedCourses([{code:'030274',text:'นวัตกรรมการแปรรูปผลผลิตทางการเกษตร กลุ่ม 1',group:'1'}],catalog);
 expect(recovered.matches[0].recovered).toBe(true);expect(recovered.matches[0].selected).not.toBe('');
});
test('import planning preserves existing choices, skips duplicates, and blocks overlapping or incompatible slots',()=>{
 const tt=M6_DEMO_TIMETABLES['M6-Room4-BC-2569-2'];
 const first={...catalog[0],classtime:'จันทร์ 1',parsedTimeSlots:[{day:'Monday',dayAbbrev:'จ',dayIndex:0,periods:[1],startPeriod:1,endPeriod:1,timeRange:'1'}]};
 const second={...first,code:'test'};
 expect(planScreenshotImport([first,first],{},tt).additions).toHaveLength(1);
 expect(planScreenshotImport([first],{Monday:{1:first}},tt).duplicates).toBe(1);
 expect(planScreenshotImport([second],{Monday:{1:first}},tt).conflicts).toHaveLength(1);
 expect(planScreenshotImport([{...first,parsedTimeSlots:[{...first.parsedTimeSlots[0],periods:[6]}]}],{},tt).conflicts).toHaveLength(1);
});


test('a matched subject with one offering selects its existing group despite uncertain OCR',()=>{
 const subject=catalog[0];
 const weakName=subject.name+'x'.repeat(subject.name.length);
 const r=matchScannedCourses([
  {code:'x'+subject.code.slice(-5),text:weakName},
  {code:subject.code,text:subject.name,group:'9'},
 ],[subject]);
 expect(r.matches).toHaveLength(2);
 expect(r.matches[0].recovered).toBe(true);
 expect(r.matches.map(m=>m.selected)).toEqual([offeringId(subject),offeringId(subject)]);
 // One group with multiple schedules still needs a schedule selection.
 const anotherTime={...subject,classtime:'ศุกร์ 1'};
 expect(matchScannedCourses([{code:subject.code,text:subject.name}],[subject,anotherTime]).matches[0].selected).toBe('');
});
