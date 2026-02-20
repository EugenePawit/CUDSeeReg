'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plus, X, Download, Trash2, ChevronDown, Share2, Check } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTimetableStore } from '../store/useTimetable';
import { BASE_TIMETABLES, DAYS, DAY_NAMES_TH, PERIODS } from '../lib/baseTimetables';
import { PERIOD_TIMES } from '../lib/thaiTimeParser';
import { fetchSubjects, flattenSubjects } from '../lib/dataFetcher';
import { FlattenedSubject } from '../types/subject';
import {
    decodeTimetableShare,
    encodeTimetableShare,
    resolveSharedSubjects,
    SharedTimetablePayload,
} from '../lib/shareTimetable';
import PlannerModal from './PlannerModal';

const DAY_COLORS: Record<string, string> = {
    Monday: 'day-monday',
    Tuesday: 'day-tuesday',
    Wednesday: 'day-wednesday',
    Thursday: 'day-thursday',
    Friday: 'day-friday',
};

const GRADES = ['1', '2', '3', '4', '5', '6'];
const PROGRAMS: Record<string, { value: string; label: string }[]> = {
    '1': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '2': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '3': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '4': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
    '5': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
    '6': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
};

const FEEDBACK_TIMEOUT_MS = 2800;

function getDefaultProgram(grade: string): string {
    return ['1', '2', '3'].includes(grade) ? 'EP' : 'Science';
}

function normalizeProgram(grade: string, program: string): string {
    const options = PROGRAMS[grade] ?? [];
    if (options.some((item) => item.value === program)) {
        return program;
    }
    return getDefaultProgram(grade);
}

function parseBaseTimetableId(baseTimetableId: string): { grade: string; program: string } | null {
    const match = baseTimetableId.match(/^M([1-6])-(EP|Normal|Science|Arts)$/);
    if (!match) {
        return null;
    }
    return {
        grade: match[1],
        program: match[2],
    };
}

function makeSubjectIdentity(subject: FlattenedSubject): string {
    return `${subject.code}||${subject.group || ''}||${subject.classtime || ''}`;
}

export default function PlannerPage() {
    const {
        baseTimetableId,
        selectedElectives,
        setBaseTimetableId,
        addElective,
        removeElective,
        replaceTimetable,
        clearAllElectives,
    } = useTimetableStore(
        useShallow((state) => ({
            baseTimetableId: state.baseTimetableId,
            selectedElectives: state.selectedElectives,
            setBaseTimetableId: state.setBaseTimetableId,
            addElective: state.addElective,
            removeElective: state.removeElective,
            replaceTimetable: state.replaceTimetable,
            clearAllElectives: state.clearAllElectives,
        }))
    );

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const shareToken = searchParams.get('tt');

    const parsedFromStore = useMemo(
        () => parseBaseTimetableId(baseTimetableId) ?? { grade: '1', program: 'EP' },
        [baseTimetableId]
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string; period: number } | null>(null);
    const [subjects, setSubjects] = useState<FlattenedSubject[]>([]);
    const [subjectsGrade, setSubjectsGrade] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingSharedPayload, setPendingSharedPayload] = useState<SharedTimetablePayload | null>(null);
    const [feedback, setFeedback] = useState('');
    const [didCopyShareLink, setDidCopyShareLink] = useState(false);

    const timetableRef = useRef<HTMLDivElement>(null);
    const feedbackTimeoutRef = useRef<number | null>(null);
    const appliedShareTokenRef = useRef<string | null>(null);

    const programs = PROGRAMS[parsedFromStore.grade] ?? [];
    const baseTimetable = useMemo(
        () => (baseTimetableId ? BASE_TIMETABLES[baseTimetableId] ?? null : null),
        [baseTimetableId]
    );

    const decodedSharePayload = useMemo(() => decodeTimetableShare(shareToken), [shareToken]);

    const setTransientFeedback = useCallback((message: string) => {
        setFeedback(message);
        if (feedbackTimeoutRef.current !== null) {
            window.clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = window.setTimeout(() => {
            setFeedback('');
        }, FEEDBACK_TIMEOUT_MS);
    }, []);

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current !== null) {
                window.clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, []);



    useEffect(() => {
        if (!baseTimetable) {
            setSubjects([]);
            setSubjectsGrade(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setSubjectsGrade(null);

        fetchSubjects(baseTimetable.grade)
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setSubjects(flattenSubjects(data));
                setSubjectsGrade(baseTimetable.grade);
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) {
                    return;
                }
                console.error('Failed to fetch subjects:', err);
                setSubjects([]);
                setSubjectsGrade(baseTimetable.grade);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [baseTimetable]);

    useEffect(() => {
        if (!shareToken || !decodedSharePayload) {
            return;
        }
        if (appliedShareTokenRef.current === shareToken) {
            return;
        }

        const parsed = parseBaseTimetableId(decodedSharePayload.b);
        if (!parsed || !BASE_TIMETABLES[decodedSharePayload.b]) {
            setTransientFeedback('ลิงก์แชร์ไม่ถูกต้อง');
            return;
        }

        setPendingSharedPayload(decodedSharePayload);
        if (baseTimetableId !== decodedSharePayload.b) {
            setBaseTimetableId(decodedSharePayload.b);
        }
    }, [shareToken, decodedSharePayload, setTransientFeedback, baseTimetableId, setBaseTimetableId]);

    useEffect(() => {
        if (!pendingSharedPayload || !shareToken) {
            return;
        }
        if (pendingSharedPayload.b !== baseTimetableId) {
            return;
        }

        const expectedGrade = BASE_TIMETABLES[pendingSharedPayload.b]?.grade;
        if (typeof expectedGrade === 'number' && subjectsGrade !== expectedGrade) {
            return;
        }
        if (loading) {
            return;
        }

        const { resolved, missing } = resolveSharedSubjects(pendingSharedPayload.s, subjects);
        replaceTimetable(pendingSharedPayload.b, resolved);
        setPendingSharedPayload(null);
        appliedShareTokenRef.current = shareToken;

        if (missing.length > 0) {
            setTransientFeedback(`นำเข้าแล้ว ${resolved.length} วิชา (ไม่พบ ${missing.length} วิชา)`);
        } else {
            setTransientFeedback(`นำเข้าตารางแล้ว ${resolved.length} วิชา`);
        }
    }, [
        pendingSharedPayload,
        shareToken,
        baseTimetableId,
        subjects,
        subjectsGrade,
        loading,
        replaceTimetable,
        setTransientFeedback,
    ]);

    const occupiedSlots = useMemo(() => {
        const occupied = new Set<string>();
        for (const day of Object.keys(selectedElectives)) {
            for (const period of Object.keys(selectedElectives[day])) {
                occupied.add(`${day}:${period}`);
            }
        }
        return occupied;
    }, [selectedElectives]);

    const selectedSubjectKeys = useMemo(() => {
        const keys = new Set<string>();
        for (const day of Object.keys(selectedElectives)) {
            for (const periodKey of Object.keys(selectedElectives[day])) {
                const period = Number(periodKey);
                const subject = selectedElectives[day]?.[period];
                if (subject) {
                    keys.add(makeSubjectIdentity(subject));
                }
            }
        }
        return keys;
    }, [selectedElectives]);

    const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

    const filteredSubjects = useMemo(() => {
        if (!selectedSlot) {
            return [];
        }

        return subjects.filter((subject) => {
            const matchesSlot = subject.parsedTimeSlots.some(
                (slot) => slot.day === selectedSlot.day && slot.periods.includes(selectedSlot.period)
            );
            if (!matchesSlot) {
                return false;
            }

            const duplicateSelected = selectedSubjectKeys.has(makeSubjectIdentity(subject));
            if (duplicateSelected) {
                return false;
            }

            const hasOverlap = subject.parsedTimeSlots.some((slot) =>
                slot.periods.some((period) => occupiedSlots.has(`${slot.day}:${period}`))
            );
            if (hasOverlap) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchText = `${subject.name} ${subject.code} ${subject.instructor}`.toLowerCase();
            return searchText.includes(normalizedSearch);
        });
    }, [subjects, selectedSlot, selectedSubjectKeys, occupiedSlots, normalizedSearch]);

    const handleGradeChange = useCallback((nextGrade: string) => {
        const nextProgram = normalizeProgram(nextGrade, parsedFromStore.program);
        const nextBaseId = `M${nextGrade}-${nextProgram}`;
        setBaseTimetableId(nextBaseId);
    }, [parsedFromStore.program, setBaseTimetableId]);

    const handleProgramChange = useCallback((nextProgram: string) => {
        const nextBaseId = `M${parsedFromStore.grade}-${nextProgram}`;
        setBaseTimetableId(nextBaseId);
    }, [parsedFromStore.grade, setBaseTimetableId]);

    const handleSlotClick = useCallback((day: string, period: number) => {
        if (!baseTimetable) {
            return;
        }
        const entry = baseTimetable.schedule[day]?.[period];
        if (entry?.type === 'elective' && !selectedElectives[day]?.[period]) {
            setSelectedSlot({ day, period });
            setSearchQuery('');
            setModalOpen(true);
        }
    }, [baseTimetable, selectedElectives]);

    const handleSelectSubject = useCallback((subject: FlattenedSubject) => {
        const fallbackSlot = subject.parsedTimeSlots[0];
        if (!fallbackSlot) {
            return;
        }

        addElective(fallbackSlot.day, fallbackSlot.startPeriod, subject);
        setModalOpen(false);
        setSearchQuery('');
    }, [addElective]);

    const handleExport = useCallback(async () => {
        if (!timetableRef.current) {
            return;
        }
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(timetableRef.current, { scale: 2, backgroundColor: '#fff' });
        const link = document.createElement('a');
        link.download = `timetable-${baseTimetable?.label || 'cudseereg'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }, [baseTimetable?.label]);

    const handleCopyShareLink = useCallback(async () => {
        const token = encodeTimetableShare(baseTimetableId, selectedElectives);
        if (!token) {
            setTransientFeedback('ไม่สามารถสร้างลิงก์แชร์ได้');
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('tt', token);

        const url = `${window.location.origin}${pathname}?${params.toString()}`;

        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }

        setDidCopyShareLink(true);
        window.setTimeout(() => setDidCopyShareLink(false), 1800);
        setTransientFeedback('คัดลอกลิงก์แชร์แล้ว');
    }, [baseTimetableId, selectedElectives, pathname, searchParams, setTransientFeedback]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setModalOpen(false);
            }
        };
        if (modalOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [modalOpen]);

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-12">
            <main className="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
                <h1 className="text-5xl md:text-6xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-8 drop-shadow-sm">
                    วางแผนตารางเรียน
                </h1>

                <div className="glass-card shadow-glass p-6 rounded-bento backdrop-blur-2xl mb-8 relative z-20">
                    <h2 className="text-xl font-bold mb-5 text-slate-800 drop-shadow-sm">เลือกตารางพื้นฐาน</h2>
                    <div className="flex flex-wrap gap-6 items-end">
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <label className="text-sm text-slate-600 font-medium">ระดับชั้น</label>
                            <div className="relative">
                                <select
                                    value={parsedFromStore.grade}
                                    onChange={(e) => handleGradeChange(e.target.value)}
                                    className="appearance-none w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-5 py-3 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-md cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    {GRADES.map((grade) => (
                                        <option key={grade} value={grade} className="text-slate-900 bg-white">ม.{grade}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <label className="text-sm text-slate-600 font-medium">แผนการเรียน</label>
                            <div className="relative">
                                <select
                                    value={parsedFromStore.program}
                                    onChange={(e) => handleProgramChange(e.target.value)}
                                    className="appearance-none w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-5 py-3 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-md cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    {programs.map((program) => (
                                        <option key={program.value} value={program.value} className="text-slate-900 bg-white">{program.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {!baseTimetable ? (
                    <div className="glass-card p-12 shadow-glass backdrop-blur-2xl rounded-bento text-center border-slate-200 z-20">
                        <p className="text-slate-500 text-lg font-medium">กรุณาเลือกตารางพื้นฐานด้านบน</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4 z-20 relative">
                            <div>
                                <p className="text-slate-600 font-medium tracking-wide">
                                    คลิกที่ช่อง <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md mx-1 border border-pink-200">วิชาเลือก</span> เพื่อเพิ่มวิชา
                                </p>
                                {feedback && <p className="text-sm text-emerald-600 mt-2 font-medium bg-emerald-50 px-3 py-1 rounded-full">{feedback}</p>}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={handleCopyShareLink} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-all interactive-press flex items-center gap-2 shadow-sm">
                                    {didCopyShareLink ? <Check size={18} className="text-pink-600" /> : <Share2 size={18} />}
                                    {didCopyShareLink ? 'คัดลอกแล้ว' : 'แชร์ตาราง'}
                                </button>
                                <button onClick={clearAllElectives} className="btn-secondary flex items-center gap-2 interactive-press">
                                    <Trash2 size={18} /> ล้างทั้งหมด
                                </button>
                                <button onClick={handleExport} className="btn-primary flex items-center gap-2 interactive-press">
                                    <Download size={18} /> ดาวน์โหลด
                                </button>
                            </div>
                        </div>

                        <div ref={timetableRef} className="glass-card shadow-glass p-6 rounded-bento overflow-x-auto backdrop-blur-2xl border-slate-200 z-20 relative text-slate-800">
                            <table className="w-full border-collapse min-w-[1200px] table-fixed">
                                <thead>
                                    <tr>
                                        <th className="border border-slate-200 bg-slate-100 p-2 w-24 min-w-[6rem] text-slate-700">วัน</th>
                                        {PERIODS.map((period) => (
                                            <React.Fragment key={period}>
                                                <th className="border border-slate-200 bg-slate-100 p-2 text-center text-slate-700">
                                                    <div className="font-medium text-slate-800">{period}</div>
                                                    <div className="text-xs text-slate-500">{PERIOD_TIMES[period]}</div>
                                                </th>
                                                {period === 2 && (
                                                    <th className="border border-slate-200 bg-slate-100 p-2 text-center w-12 min-w-[3rem]">
                                                        <div className="text-xs text-slate-500">10:10-10:20</div>
                                                    </th>
                                                )}
                                                {period === 6 && (
                                                    <th className="border border-slate-200 bg-slate-100 p-2 text-center w-12 min-w-[3rem]">
                                                        <div className="text-xs text-slate-500">13:40-13:50</div>
                                                    </th>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map((day) => (
                                        <tr key={day}>
                                            <td className={`border border-slate-200 p-2 text-center font-medium ${DAY_COLORS[day]}`}>
                                                {DAY_NAMES_TH[day]}
                                            </td>
                                            {PERIODS.map((period) => {
                                                const entry = baseTimetable.schedule[day]?.[period];
                                                const elective = selectedElectives[day]?.[period];

                                                const cellContent = (() => {
                                                    if (!entry) return <td key={period} className="border border-slate-200 p-2 bg-slate-50 backdrop-blur-sm" />;

                                                    if (entry.type === 'break') {
                                                        return (
                                                            <td key={period} className="border border-slate-200 bg-amber-50 text-amber-700 p-2 text-center text-sm h-24 align-middle">
                                                                {period === 5 ? 'พักเที่ยง' : 'พัก'}
                                                            </td>
                                                        );
                                                    }

                                                    if (entry.type === 'core') {
                                                        return (
                                                            <td key={period} className="border border-slate-200 bg-white p-2 text-center text-sm h-24 align-middle whitespace-normal shadow-sm">
                                                                {entry.code !== entry.name && <div className="text-slate-500 font-mono text-xs mb-1">{entry.code}</div>}
                                                                <div className="font-semibold text-slate-800 tracking-wide">{entry.name}</div>
                                                            </td>
                                                        );
                                                    }

                                                    if (elective) {
                                                        return (
                                                            <td key={period} className="border border-slate-200 bg-emerald-100 text-emerald-800 p-2 relative group h-24 align-middle interactive-press backdrop-blur-md">
                                                                <div className="text-[10px] font-mono text-emerald-600 whitespace-nowrap">{elective.code} {elective.group && `กลุ่ม ${elective.group}`}</div>
                                                                <div className="text-xs font-semibold text-emerald-900 mt-1 leading-tight">{elective.name}</div>
                                                                <button
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        removeElective(day, period);
                                                                    }}
                                                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 interactive-press"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </td>
                                                        );
                                                    }

                                                    return (
                                                        <td
                                                            key={period}
                                                            onClick={() => handleSlotClick(day, period)}
                                                            className="border border-slate-200 bg-purple-50 text-purple-700 p-2 hover:bg-purple-100 cursor-pointer transition-colors group relative h-24 align-middle interactive-press backdrop-blur-md"
                                                        >
                                                            <div className="flex flex-col items-center justify-center h-full text-purple-400 group-hover:text-purple-600">
                                                                <Plus size={20} />
                                                                <span className="text-xs mt-1 font-medium tracking-wide">วิชาเลือก</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })();

                                                return (
                                                    <React.Fragment key={period}>
                                                        {cellContent}
                                                        {period === 2 && (
                                                            <td className="border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 h-24 align-middle">
                                                                พัก
                                                            </td>
                                                        )}
                                                        {period === 6 && (
                                                            <td className="border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 h-24 align-middle">
                                                                พัก
                                                            </td>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>

            <PlannerModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedSlot={selectedSlot}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                loading={loading}
                baseTimetable={baseTimetable}
                filteredSubjects={filteredSubjects}
                onSelectSubject={handleSelectSubject}
            />

            <footer className="w-full border-t border-slate-200 py-6 mt-12 z-20 relative">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>
        </div>
    );
}
