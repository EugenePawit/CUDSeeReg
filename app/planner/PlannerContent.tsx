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
        <div className="min-h-screen">
            <header className="glass-card sticky top-0 z-40 border-b border-white/20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">CUDSeeReg</h1>
                        <p className="text-xs text-slate-600">ระบบช่วยเลือกวิชาเลือก</p>
                    </div>
                    <nav className="flex gap-2">
                        <Link href="/" className="px-4 py-2 rounded-lg text-slate-600 hover:bg-pink-100 font-medium interactive-press">รายวิชา</Link>
                        <Link href="/planner" className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium interactive-press">วางแผนตาราง</Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">วางแผนตารางเรียน</h1>

                <div className="glass-card p-4 rounded-xl mb-6">
                    <h2 className="text-lg font-semibold mb-4">เลือกตารางพื้นฐาน</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">ระดับชั้น</label>
                            <div className="relative">
                                <select
                                    value={parsedFromStore.grade}
                                    onChange={(e) => handleGradeChange(e.target.value)}
                                    className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500 interactive-press"
                                >
                                    {GRADES.map((grade) => (
                                        <option key={grade} value={grade}>ม.{grade}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">แผนการเรียน</label>
                            <div className="relative">
                                <select
                                    value={parsedFromStore.program}
                                    onChange={(e) => handleProgramChange(e.target.value)}
                                    className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500 interactive-press"
                                >
                                    {programs.map((program) => (
                                        <option key={program.value} value={program.value}>{program.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {!baseTimetable ? (
                    <div className="glass-card p-12 rounded-xl text-center">
                        <p className="text-slate-600 text-lg">กรุณาเลือกตารางพื้นฐานด้านบน</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                            <div>
                                <p className="text-sm text-slate-600">คลิกที่ช่อง <span className="text-purple-600 font-medium">วิชาเลือก</span> เพื่อเพิ่มวิชา</p>
                                {feedback && <p className="text-xs text-emerald-700 mt-1">{feedback}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleCopyShareLink} className="btn-secondary flex items-center gap-2 interactive-press">
                                    {didCopyShareLink ? <Check size={18} /> : <Share2 size={18} />}
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

                        <div ref={timetableRef} className="glass-card p-6 rounded-xl overflow-x-auto">
                            <table className="w-full border-collapse min-w-[1200px] table-fixed">
                                <thead>
                                    <tr>
                                        <th className="border border-slate-200 bg-slate-100 p-2 w-24 min-w-[6rem]">วัน</th>
                                        {PERIODS.map((period) => (
                                            <React.Fragment key={period}>
                                                <th className="border border-slate-200 bg-slate-100 p-2 text-center">
                                                    <div className="font-medium">{period}</div>
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
                                                    if (!entry) return <td key={period} className="border border-slate-200 p-2 bg-slate-50" />;

                                                    if (entry.type === 'break') {
                                                        return (
                                                            <td key={period} className="border border-slate-200 cell-break p-2 text-center text-sm h-24 align-middle">
                                                                {period === 5 ? 'พักเที่ยง' : 'พัก'}
                                                            </td>
                                                        );
                                                    }

                                                    if (entry.type === 'core') {
                                                        return (
                                                            <td key={period} className="border border-slate-200 bg-slate-50 p-2 text-center text-sm h-24 align-middle whitespace-normal">
                                                                {entry.code !== entry.name && <div>{entry.code}</div>}
                                                                <div className="font-medium text-slate-700">{entry.name}</div>
                                                            </td>
                                                        );
                                                    }

                                                    if (elective) {
                                                        return (
                                                            <td key={period} className="border border-slate-200 cell-selected p-2 relative group h-24 align-middle interactive-press">
                                                                <div className="text-[10px] font-mono text-emerald-600 whitespace-nowrap">{elective.code} {elective.group && `กลุ่ม ${elective.group}`}</div>
                                                                <div className="text-xs font-medium text-emerald-900">{elective.name}</div>
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
                                                            className="border border-slate-200 cell-elective p-2 hover:bg-purple-50 cursor-pointer transition-colors group relative h-24 align-middle interactive-press"
                                                        >
                                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-purple-500">
                                                                <Plus size={20} />
                                                                <span className="text-xs mt-1">วิชาเลือก</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })();

                                                return (
                                                    <React.Fragment key={period}>
                                                        {cellContent}
                                                        {period === 2 && (
                                                            <td className="border border-slate-200 bg-slate-100 call-break text-center text-xs text-slate-400 h-24 align-middle">
                                                                พัก
                                                            </td>
                                                        )}
                                                        {period === 6 && (
                                                            <td className="border border-slate-200 bg-slate-100 call-break text-center text-xs text-slate-400 h-24 align-middle">
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

            <footer className="glass-card border-t border-white/20 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>
        </div>
    );
}
