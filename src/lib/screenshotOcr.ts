import { PSM, type Worker } from 'tesseract.js';
import { detectCourseCards, type ImageRegion } from './screenshotCards';
import { courseFromText, coursesFromWords, mergeCourseReads, type ScannedCourse } from './screenshotImport';

function cardRegions(canvas: HTMLCanvasElement) {
    const scale=Math.min(1,1200/canvas.width,2000/canvas.height);
    const sample=document.createElement('canvas');sample.width=Math.round(canvas.width*scale);sample.height=Math.round(canvas.height*scale);
    const ctx=sample.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas unavailable');
    ctx.drawImage(canvas,0,0,sample.width,sample.height);
    const regions=detectCourseCards(ctx.getImageData(0,0,sample.width,sample.height).data,sample.width,sample.height);
    sample.width=sample.height=1;
    return regions.map(r=>({left:r.left/scale,top:r.top/scale,width:r.width/scale,height:r.height/scale}));
}
function cropCard(canvas: HTMLCanvasElement, region: ImageRegion) {
    const scale=Math.min(4,900/region.width), border=16;
    const crop=document.createElement('canvas');crop.width=Math.round(region.width*scale)+border*2;crop.height=Math.round(region.height*scale)+border*2;
    const ctx=crop.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,crop.width,crop.height);
    ctx.drawImage(canvas,region.left,region.top,region.width,region.height,border,border,crop.width-border*2,crop.height-border*2);
    return crop;
}
export async function scanScreenshot(canvas: HTMLCanvasElement, worker: Worker,
    progress: (fraction:number)=>void, cancelled: ()=>boolean) {
    const regions=cardRegions(canvas);
    const courses: ScannedCourse[]=[];
    if(regions.length) {
        await worker.setParameters({tessedit_pageseg_mode:PSM.SINGLE_BLOCK});
        for(let i=0;i<regions.length;i++) {
            if(cancelled())return [];
            const crop=cropCard(canvas,regions[i]);
            try {
                const {data}=await worker.recognize(crop);
                const course=courseFromText(data.text);if(course)courses.push(course);
            } finally {crop.width=crop.height=1;}
            // Reserve a final step for a fallback if any cards could not be read.
            progress((i+1)/(regions.length+1));
        }
    }
    if(cancelled())return [];
    if(!regions.length || courses.length<regions.length) {
        await worker.setParameters({tessedit_pageseg_mode:PSM.SPARSE_TEXT});
        const {data}=await worker.recognize(canvas,{}, {blocks:true});
        const fallback=coursesFromWords(data.blocks?.flatMap(b=>b.paragraphs.flatMap(p=>p.lines.flatMap(l=>l.words)))??[]);
        // Focused reads win; a fallback must not add an uncertain copy of a corrected group.
        const merged=mergeCourseReads(courses,fallback);
        courses.splice(0,courses.length,...merged);
    }
    progress(1);
    return courses;
}
