'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger';
import TiltCard from '../components/motion/TiltCard';

export default function PresentationPage() {
    return (
        <div className="min-h-screen flex flex-col pt-32 pb-12">
            <main className="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
                <div className="flex flex-col mb-16 w-full">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="text-5xl md:text-7xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-6 drop-shadow-sm leading-normal pb-4"
                    >
                        โครงงาน CUDSeeReg
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                        className="text-slate-600 font-medium text-lg md:text-xl leading-relaxed w-full"
                    >
                        ระบบช่วยจัดการและวางแผนการลงทะเบียนวิชาเลือกสำหรับนักเรียนโรงเรียนสาธิตจุฬาลงกรณ์มหาวิทยาลัย ฝ่ายมัธยม
                    </motion.p>
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* The Problem */}
                    <StaggerItem className="w-full h-full relative z-10 md:col-span-2">
                        <TiltCard className="w-full h-full glass-card hover:border-pink-300 transition-colors">
                            <div className="p-8 md:p-10 flex flex-col h-full">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 9-6 6" /><path d="M9 9h.01" /><path d="M15 15h.01" /><path d="M12 2A10 10 0 0 0 2 12c0 2.2.8 4.2 2 5.8s2.8 3 4.8 3.8L12 22l3.2-1.4c2-.8 3.6-2.2 4.8-3.8s2-3.6 2-5.8A10 10 0 0 0 12 2z" /></svg>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">ปัญหาที่พบ</h2>
                                </div>
                                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                                    <p>
                                        เนื่องด้วยในปัจจุบัน ช่วงก่อนเปิดเทอมใหม่นักเรียนโรงเรียนสาธิตจุฬาลงกรณ์ มหาวิทยาลัย ฝ่ายมัธยม จะต้องทำการลงทะเบียนเพื่อเรียนวิชาเลือกเสรีและหนึ่งในกระบวนการ
                                        ที่นักเรียนทุกคนจะต้องทำคือการดูรายวิชาต่าง ๆ ที่เปิดเพื่อทำการวางแผนตารางเรียนโดยใน
                                        ปัจจุบันนักเรียนจะต้องทำการเข้าระบบ <strong>Google Sheets</strong> ที่ฝ่ายวิชาการของโรงเรียนจัดเตรียม
                                        ไว้ให้พร้อมทั้งเปิดตารางเรียนจากไฟล์ในรูปแบบของ <strong>PDF</strong> ซึ่งสร้างความลำบากและสับสนในการ
                                        ดูและวางแผน
                                    </p>
                                    <p>
                                        อีกทั้งเนื่องจากระบบ Google Sheets นั่นถูกออกแบบมาเพื่อให้สามารถดูและ
                                        ใช้งานได้อย่างสะดวกในรูปแบบโปรแกรมคอมพิวเตอร์จึงทำให้รูปแบบไฟล์บางอย่างมีความลำบากในการเปิดใช้งานและวางแผนตารางเรียนบนโทรศัพท์มือถือและแท็บเล็ต
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    </StaggerItem>

                    {/* The Solution / Goal */}
                    <StaggerItem className="w-full h-full relative z-10 md:col-span-1">
                        <TiltCard className="w-full h-full glass-card hover:border-pink-300 transition-colors">
                            <div className="p-8 flex flex-col h-full">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">การแก้ปัญหา</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    CUDSeeReg ถูกพัฒนาขึ้นเพื่อเปลี่ยนประสบการณ์การวางแผนตารางเรียนให้เป็นเรื่องง่ายและไร้รอยต่อ
                                    ด้วยระบบที่ออกแบบมาให้ใช้งานง่าย (User-friendly) รองรับทุกอุปกรณ์ผ่านดีไซน์แบบ Responsive
                                    และสามารถจัดการตารางเรียนทั้งหมดได้ในตัวเดียว (All-in-one Platform)
                                </p>
                            </div>
                        </TiltCard>
                    </StaggerItem>

                    {/* Tech Stack */}
                    <StaggerItem className="w-full h-full relative z-10 md:col-span-1">
                        <TiltCard className="w-full h-full glass-card hover:border-indigo-300 transition-colors">
                            <div className="p-8 flex flex-col h-full">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">เทคโนโลยีที่ใช้</h2>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">Frontend</span>
                                        <span className="text-slate-600 font-medium">Next.js 15 (React), Tailwind CSS, Framer Motion สำหรับ Animations เคลื่อนไหว</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">State</span>
                                        <span className="text-slate-600 font-medium">Zustand สำหรับจัดการข้อมูลตารางเรียน, LocalStorage</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">Design</span>
                                        <span className="text-slate-600 font-medium">UX/UI แบบ Bento Grid และ Light Glassmorphism</span>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    </StaggerItem>
                </StaggerContainer>

                <div className="flex flex-col mb-10 mt-8 w-full">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="text-3xl md:text-5xl font-sans font-black tracking-tight text-slate-800 mb-4 drop-shadow-sm"
                    >
                        ฟีเจอร์หลัก (Key Features)
                    </motion.h2>
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {/* Feature 1: Search */}
                    <StaggerItem className="w-full h-full relative z-10">
                        <TiltCard className="w-full h-full glass-card hover:border-pink-300 transition-colors">
                            <div className="p-6 flex flex-col h-full">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">ค้นหารายวิชาอัจฉริยะ</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    สามารถค้นหาวิชาได้จากทั้ง รหัสวิชา, ชื่อวิชา, และชื่ออาจารย์ผู้สอน พร้อมด้วยตัวกรองระดับชั้นที่ให้ผลลัพธ์แบบเรียลไทม์
                                </p>
                            </div>
                        </TiltCard>
                    </StaggerItem>

                    {/* Feature 2: Planner */}
                    <StaggerItem className="w-full h-full relative z-10">
                        <TiltCard className="w-full h-full glass-card hover:border-amber-300 transition-colors">
                            <div className="p-6 flex flex-col h-full">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">ระบบจัดตารางเรียน</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    จัดตารางเรียนที่คุณออกแบบเองได้ (Visual Timetable) โดยมีตารางพื้นฐานของแต่ละสายการเรียนเตรียมไว้ให้ เลือกเพิ่มวิชาผ่านระบบที่ตรวจสอบเวลาเรียนให้โดยอัตโนมัติ
                                </p>
                            </div>
                        </TiltCard>
                    </StaggerItem>

                    {/* Feature 3: Export & Save */}
                    <StaggerItem className="w-full h-full relative z-10">
                        <TiltCard className="w-full h-full glass-card hover:border-blue-300 transition-colors">
                            <div className="p-6 flex flex-col h-full">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">บันทึกและส่งต่อ</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    บันทึกตารางเรียนเป็นรูปภาพเข้าสู่อุปกรณ์โดยตรงอย่างสวยงามด้วยคุณภาพความคมชัดสูง เพื่อง่ายต่อการนำไปตั้งเป็นหน้าจอ หรือส่งแชร์ให้เพื่อน
                                </p>
                            </div>
                        </TiltCard>
                    </StaggerItem>

                    {/* Explaining Subject Cards */}
                    <StaggerItem className="w-full h-full relative z-10 lg:col-span-3">
                        <TiltCard className="w-full h-full glass-card hover:border-purple-300 transition-colors">
                            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10 items-center">
                                <div className="flex-1">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /></svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">ทำความรู้จักกับ การ์ดรายวิชา</h2>
                                    </div>
                                    <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium mb-6">
                                        <p>
                                            ทุกรายละเอียดถูกออกแบบมาให้อ่านง่ายและสามารถเข้าใจได้ทันที ประกอบไปด้วยข้อมูลทุกอย่างที่นักเรียนต้องรู้ก่อนการตัดสินใจลงทะเบียน:
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">รหัสและอักษรย่อ</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">ชื่อวิชาเต็ม</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">หน่วยกิต</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">กลุ่มเรียน (ก.)</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">วันและเวลาที่เรียน</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">จำนวนที่รับเข้าศึกษา</span>
                                        </div>
                                        <div className="flex items-start gap-3 col-span-2">
                                            <span className="mt-1 px-2.5 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg text-xs font-bold whitespace-nowrap">อาจารย์ผู้สอน และคำอธิบายภาพรวมของรายวิชาเมื่อกดดู</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-glass-sm shrink-0">
                                    <div className="flex justify-between items-start gap-4 h-full">
                                        <div className="flex flex-col justify-between h-full">
                                            <div>
                                                <div className="text-xs font-mono tracking-wider text-pink-600 mb-1">ง30263</div>
                                                <div className="font-bold text-slate-800 text-lg md:text-xl tracking-tight leading-tight mb-2 line-clamp-2 pr-2">การเขียนโปรแกรม<br />สร้างสรรค์</div>
                                                <div className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1.5 flex-wrap">
                                                    <span>อ.พิมพ์กมล</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-semibold bg-green-100 text-green-700">พ. 10:20-12:50</span>
                                            <div className="mt-auto pt-2 text-[10px] md:text-xs text-slate-400 font-medium tracking-wide flex flex-col items-end gap-0.5 whitespace-nowrap">
                                                <span className="flex items-center gap-1 relative pl-3">
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                                                    0.5 หน่วยกิต
                                                </span>
                                                <span className="flex items-center gap-1 relative pl-3">
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300"></span>รับ 30</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full mt-4 bg-pink-50 text-pink-600 hover:bg-pink-100 py-2 rounded-xl text-sm font-bold text-center border-b-[3px] border-pink-200 hover:border-pink-300 transition-all active:translate-y-[2px] active:border-b-[1px] cursor-pointer">
                                        ก.1 — รายละเอียด
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    </StaggerItem>
                </StaggerContainer>

                <div className="flex flex-col mb-10 mt-8 w-full">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="text-3xl md:text-5xl font-sans font-black tracking-tight text-slate-800 mb-4 drop-shadow-sm"
                    >
                        คณะผู้จัดทำ (Members)
                    </motion.h2>
                </div>

                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { name: "ภาวิต โกวิทานุพงศ์ 5/4", photo: "eugene.jpg" },
                        { name: "รณภัทร ศรีวรวิไล 5/4", photo: "pie.jpg" },
                        { name: "ธันวิน จินตนาภักดี 5/4", photo: "bob.jpg" },
                        { name: "ฐสุ มีลาภอุดมชัย 5/4", photo: "leo.jpg" }
                    ].map((member, index) => (
                        <StaggerItem key={index} className="w-full h-full relative z-10">
                            <TiltCard className="w-full h-full glass-card hover:border-pink-300 transition-colors overflow-hidden flex flex-col">
                                <div className="aspect-[3/4] w-full overflow-hidden">
                                    <img
                                        src={`/photos/${member.photo}`}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-all duration-500"
                                    />
                                </div>
                                <div className="p-5 text-center mt-auto">
                                    <p className="text-slate-800 font-bold leading-tight">{member.name}</p>
                                </div>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                {/* Footer Component reuse */}
                <footer className="w-full border-t border-slate-200 py-6 mt-12 z-20 relative">
                    <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                        <p className="mt-1">CUDSeeReg © 2026 - ระบบช่วยจัดการวิชาเลือกโรงเรียนสาธิตจุฬาลงกรณ์มหาวิทยาลัย</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
