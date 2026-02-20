'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger';
import TiltCard from '../components/motion/TiltCard';

export default function PresentationPage() {
    return (
        <div className="min-h-screen flex flex-col pt-32 pb-12">
            <main className="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
                <div className="flex flex-col mb-16 max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="text-5xl md:text-7xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-6 drop-shadow-sm leading-tight pb-2"
                    >
                        โครงงาน CUDSeeReg
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                        className="text-slate-600 font-medium text-lg leading-relaxed"
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
