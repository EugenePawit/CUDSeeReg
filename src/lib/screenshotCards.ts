export interface ImageRegion { left: number; top: number; width: number; height: number }
// Detect repeated pink course logos, then crop only the text to their right.
// The full-image scanner remains available for screenshots with other layouts.
export function detectCourseCards(data: Uint8ClampedArray, width: number, height: number): ImageRegion[] {
    const mask=new Uint8Array(width*height);
    for(let i=0;i<mask.length;i++) {
        const k=i*4, red=data[k], green=data[k+1], blue=data[k+2];
        mask[i]=red>175 && green<165 && red-green>65 && blue>65 && blue<210 ? 1:0;
    }
    const queue=new Int32Array(width*height);
    const logos: {x:number;y:number;right:number;bottom:number}[]=[];
    for(let start=0;start<mask.length;start++) {
        if(!mask[start])continue;
        let head=0,tail=1;queue[0]=start;mask[start]=0;
        let x=width,y=height,right=0,bottom=0;
        while(head<tail) {
            const i=queue[head++], xx=i%width, yy=Math.floor(i/width);
            x=Math.min(x,xx);y=Math.min(y,yy);right=Math.max(right,xx);bottom=Math.max(bottom,yy);
            for(const n of [xx>0?i-1:-1,xx<width-1?i+1:-1,yy>0?i-width:-1,yy<height-1?i+width:-1]) {
                if(n>=0 && mask[n]) {mask[n]=0;queue[tail++]=n;}
            }
        }
        const w=right-x+1,h=bottom-y+1;
        if(tail>=35 && w>=12 && w<=180 && h>=12 && h<=180 && w/h>0.4 && w/h<2.2)logos.push({x,y,right,bottom});
    }
    const repeated=logos.filter(a=>logos.filter(b=>Math.abs(a.x-b.x)<Math.max(a.right-a.x, b.right-b.x)*0.65).length>=2);
    const sorted=repeated.sort((a,b)=>a.y-b.y||a.x-b.x);
    const regions: ImageRegion[]=[];
    for(const logo of sorted) {
        const w=logo.right-logo.x+1,h=logo.bottom-logo.y+1;
        const next=sorted.filter(b=>Math.abs(b.x-logo.x)<w && b.y>logo.bottom+h*0.3).sort((a,b)=>a.y-b.y)[0];
        const neighbor=sorted.filter(b=>b.x>logo.right+w && Math.abs(b.y-logo.y)<h).sort((a,b)=>a.x-b.x)[0];
        const columnXs=[...new Set(sorted.filter(b=>b.x>logo.right+w).map(b=>b.x))];
        const spacing=neighbor ? neighbor.x-logo.x : columnXs.length ? Math.min(...columnXs)-logo.x :
            sorted.some(b=>b.x<logo.x-w*2) ? Math.min(...sorted.filter(b=>b.x<logo.x-w*2).map(b=>logo.x-b.x)) : width-logo.x;
        const left=Math.round(logo.right+w*0.2);
        const right=Math.min(width-1,Math.round(logo.x+spacing-w*0.4));
        const top=Math.max(0,Math.round(logo.y-h*0.45));
        const bottom=Math.min(height,Math.round(next ? Math.min(logo.bottom+h*0.9,next.y-h*0.4) : logo.bottom+h*0.9));
        if(right-left>w && bottom>top)regions.push({left,top,width:right-left,height:bottom-top});
    }
    // A logo can contain disconnected pink strokes. Merge overlapping detections.
    const merged: ImageRegion[]=[];
    for(const region of regions) {
        const existing=merged.find(other=>Math.abs(other.left-region.left)<Math.min(other.width,region.width)*0.3
            && Math.abs(other.top-region.top)<Math.min(other.height,region.height)*0.3);
        if(existing) {
            const right=Math.max(existing.left+existing.width,region.left+region.width);
            const bottom=Math.max(existing.top+existing.height,region.top+region.height);
            existing.left=Math.min(existing.left,region.left);existing.top=Math.min(existing.top,region.top);
            existing.width=right-existing.left;existing.height=bottom-existing.top;
        } else merged.push({...region});
    }
    return merged.length>=2 ? merged : [];
}
