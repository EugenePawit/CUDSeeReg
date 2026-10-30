import { expect, test } from 'bun:test';
import { detectCourseCards } from '../src/lib/screenshotCards';

function picture(width:number,height:number,logos: [number,number][], size=22) {
 const data=new Uint8ClampedArray(width*height*4).fill(255);
 for(const [x,y] of logos)for(let yy=y;yy<y+size;yy++)for(let xx=x;xx<x+size;xx++) {
  const i=(yy*width+xx)*4;data[i]=235;data[i+1]=60;data[i+2]=140;
 }
 return data;
}
test('detects desktop card columns and phone card stacks without including the logo',()=>{
 const logos: [number,number][]=[[20,40],[220,40],[420,40],[20,140],[220,140],[420,140]];
 const desktop=detectCourseCards(picture(640,240,logos),640,240);
 expect(desktop).toHaveLength(6);
 expect(desktop.every((r,i)=>r.left>logos[i][0]+22 && r.width>0 && r.top>=0 && r.top+r.height<=240)).toBe(true);
 const phone=detectCourseCards(picture(320,340,[[20,40],[20,140],[20,240]]),320,340);
 expect(phone).toHaveLength(3);
 expect(phone.every(r=>r.left+r.width<320)).toBe(true);
});
test('unrecognized layouts use the full-image fallback instead of invented cards',()=>{
 expect(detectCourseCards(picture(320,240,[]),320,240)).toEqual([]);
 expect(detectCourseCards(picture(320,240,[[20,40]]),320,240)).toEqual([]);
});


test('large logos in high-resolution phone screenshots still produce focused cards',()=>{
 const regions=detectCourseCards(picture(400,700,[[20,40],[20,260]],100),400,700);
 expect(regions).toHaveLength(2);
});
