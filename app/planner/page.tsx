'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, X, Download, Trash2, ChevronDown } from 'lucide-react';
import { useTimetableStore } from '../store/useTimetable';
import { BASE_TIMETABLES, DAYS, DAY_NAMES_TH, PERIODS } from '../lib/baseTimetables';
import { PERIOD_TIMES } from '../lib/thaiTimeParser';
import { fetchSubjects, flattenSubjects } from '../lib/dataFetcher';
import { FlattenedSubject } from '../types/subject';

const DAY_COLORS: Record<string, string> = {
    Monday: 'day-monday',
    Tuesday: 'day-tuesday',
    Wednesday: 'day-wednesday',
    Thursday: 'day-thursday',
    Friday: 'day-friday',
};

const GRADES = ['1'];
const CLASSROOMS = ['1', '2', '3', '4', '5', '6', '7'];

const PLANS: Record<string, { value: string; label: string }[]> = {
    '1': [{ value: 'general', label: 'ทั่วไป' }],
    '2': [{ value: 'general', label: 'ทั่วไป' }],
    '3': [{ value: 'general', label: 'ทั่วไป' }],
    '4': [{ value: 'science', label: 'วิทย์-คณิต' }, { value: 'arts', label: 'ศิลป์-ภาษา' }, { value: 'ep', label: 'EP' }],
    '5': [{ value: 'science', label: 'วิทย์-คณิต' }, { value: 'arts', label: 'ศิลป์-ภาษา' }, { value: 'ep', label: 'EP' }],
    '6': [{ value: 'science', label: 'วิทย์-คณิต' }, { value: 'arts', label: 'ศิลป์-ภาษา' }, { value: 'ep', label: 'EP' }],
};

export default function PlannerPage() {
    const { baseTimetableId, selectedElectives, setBaseTimetableId, addElective, removeElective, clearAllElectives, hasConflict } = useTimetableStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string; period: number } | null>(null);
    const [subjects, setSubjects] = useState<FlattenedSubject[]>([]);
    const [loading, setLoading] = useState(false);
    const timetableRef = useRef<HTMLDivElement>(null);

    // Selector state
    const [selectedGrade, setSelectedGrade] = useState('1');
    const [selectedClassroom, setSelectedClassroom] = useState('1');
    const [selectedPlan, setSelectedPlan] = useState('science');
    const [rotcMode, setRotcMode] = useState(false);

    const isSenior = ['4', '5', '6'].includes(selectedGrade);
    const plans = PLANS[selectedGrade];

    // Build timetable ID from selections
    useEffect(() => {
        let id = '';
        if (selectedGrade === '1') {
            id = `M1-${selectedClassroom}`;
        } else if (['2', '3'].includes(selectedGrade)) {
            id = `M${selectedGrade}`;
        } else {
            const planMap: Record<string, string> = { science: 'Science', arts: 'Arts', ep: 'EP' };
            id = `M${selectedGrade}-${planMap[selectedPlan] || 'Science'}`;
            if (rotcMode) id += '-ROTC';
        }
        if (BASE_TIMETABLES[id]) {
            setBaseTimetableId(id);
        }
    }, [selectedGrade, selectedClassroom, selectedPlan, rotcMode, setBaseTimetableId]);

    // Reset plan when changing grade
    useEffect(() => {
        if (['1', '2', '3'].includes(selectedGrade)) {
            setSelectedPlan('general');
            setRotcMode(false);
        } else {
            setSelectedPlan('science');
        }
    }, [selectedGrade]);

    const baseTimetable = baseTimetableId ? BASE_TIMETABLES[baseTimetableId] : null;

    useEffect(() => {
        if (baseTimetable) {
            setLoading(true);
            fetchSubjects(baseTimetable.grade)
                .then(data => {
                    setSubjects(flattenSubjects(data));
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [baseTimetable?.grade]);

    const handleSlotClick = (day: string, period: number) => {
        if (!baseTimetable) return;
        const entry = baseTimetable.schedule[day]?.[period];
        if (entry?.type === 'elective' && !selectedElectives[day]?.[period]) {
            setSelectedSlot({ day, period });
            setModalOpen(true);
        }
    };

    const handleSelectSubject = (subject: FlattenedSubject) => {
        if (selectedSlot) {
            addElective(selectedSlot.day, selectedSlot.period, subject);
            setModalOpen(false);
        }
    };

    const handleExport = async () => {
        if (!timetableRef.current) return;
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(timetableRef.current, { scale: 2, backgroundColor: '#fff' });
        const link = document.createElement('a');
        link.download = `timetable-${baseTimetable?.label || 'cudseereg'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const filteredSubjects = selectedSlot
        ? subjects.filter(s => {
            const matchesSlot = s.parsedTimeSlots.some(
                slot => slot.day === selectedSlot.day && slot.periods.includes(selectedSlot.period)
            );
            return matchesSlot && !hasConflict(s);
        })
        : [];

    return (
        <div className="min-h-screen">
            <header className="glass-card sticky top-0 z-40 border-b border-white/20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">CUDSeeReg</h1>
                        <p className="text-xs text-slate-600">ระบบช่วยเลือกวิชาเลือก</p>
                    </div>
                    <nav className="flex gap-2">
                        <Link href="/" className="px-4 py-2 rounded-lg text-slate-600 hover:bg-pink-100 font-medium">รายวิชา</Link>
                        <Link href="/planner" className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium">วางแผนตาราง</Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">วางแผนตารางเรียน</h1>

                {/* Selector */}
                <div className="glass-card p-4 rounded-xl mb-6">
                    <h2 className="text-lg font-semibold mb-4">เลือกตารางพื้นฐาน</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Grade */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-slate-600">ระดับชั้น</label>
                            <div className="relative">
                                <select
                                    value={selectedGrade}
                                    onChange={e => setSelectedGrade(e.target.value)}
                                    className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    {GRADES.map(g => (
                                        <option key={g} value={g}>ม.{g}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        {/* Classroom Selector for M1 */}
                        {selectedGrade === '1' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-slate-600">ห้องเรียน</label>
                                <div className="relative">
                                    <select
                                        value={selectedClassroom}
                                        onChange={e => setSelectedClassroom(e.target.value)}
                                        className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        {CLASSROOMS.map(c => (
                                            <option key={c} value={c}>ม.1/{c}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        )}

                        {/* Study Plan - only for ม.4-6 */}
                        {isSenior && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-slate-600">แผนการเรียน</label>
                                <div className="relative">
                                    <select
                                        value={selectedPlan}
                                        onChange={e => setSelectedPlan(e.target.value)}
                                        className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        {plans.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        )}

                        {/* ROTC Toggle - only for ม.4-6 */}
                        {isSenior && (
                            <div className="flex items-center gap-2 ml-4">
                                <label className="text-sm text-slate-600">ตารางช่วง ร.ด.</label>
                                <button
                                    onClick={() => setRotcMode(!rotcMode)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${rotcMode ? 'bg-pink-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${rotcMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {!baseTimetable ? (
                    <div className="glass-card p-12 rounded-xl text-center">
                        <p className="text-slate-600 text-lg">กรุณาเลือกตารางพื้นฐานด้านบน</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-slate-600">คลิกที่ช่อง <span className="text-purple-600 font-medium">วิชาเลือก</span> เพื่อเพิ่มวิชา</p>
                            <div className="flex gap-2">
                                <button onClick={clearAllElectives} className="btn-secondary flex items-center gap-2">
                                    <Trash2 size={18} /> ล้างทั้งหมด
                                </button>
                                <button onClick={handleExport} className="btn-primary flex items-center gap-2">
                                    <Download size={18} /> ดาวน์โหลด
                                </button>
                            </div>
                        </div>

                        <div ref={timetableRef} className="glass-card p-6 rounded-xl overflow-x-auto">
                            <table className="w-full border-collapse min-w-[1200px] table-fixed">
                                <thead>
                                    <tr>
                                        <th className="border border-slate-200 bg-slate-100 p-2 w-24 min-w-[6rem]">วัน</th>
                                        {PERIODS.map(period => (
                                            <React.Fragment key={period}>
                                                <th className="border border-slate-200 bg-slate-100 p-2 text-center">
                                                    <div className="font-medium">{period}</div>
                                                    <div className="text-xs text-slate-500">{PERIOD_TIMES[period]}</div>
                                                </th>
                                                {/* Break after Period 2 */}
                                                {period === 2 && (
                                                    <th className="border border-slate-200 bg-slate-100 p-2 text-center w-12 min-w-[3rem]">
                                                        <div className="text-xs text-slate-500">10:10-10:20</div>
                                                    </th>
                                                )}
                                                {/* Break after Period 6 */}
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
                                    {DAYS.map(day => (
                                        <tr key={day}>
                                            <td className={`border border-slate-200 p-2 text-center font-medium ${DAY_COLORS[day]}`}>
                                                {DAY_NAMES_TH[day]}
                                            </td>
                                            {PERIODS.map(period => {
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

                                                    // Core subjects
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
                                                            <td key={period} className="border border-slate-200 cell-selected p-2 relative group h-24 align-middle">
                                                                <div className="text-xs font-mono text-emerald-600">{elective.code}</div>
                                                                <div className="text-xs font-medium text-emerald-900">{elective.name}</div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeElective(day, period);
                                                                    }}
                                                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
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
                                                            className="border border-slate-200 cell-elective p-2 hover:bg-purple-50 cursor-pointer transition-colors group relative h-24 align-middle"
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

            {/* Modal */}
            {modalOpen && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center bg-pink-50">
                            <h2 className="text-xl font-bold text-pink-900">
                                เลือกวิชา - {DAY_NAMES_TH[selectedSlot.day]} คาบ {selectedSlot.period}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-pink-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
                                </div>
                            ) : filteredSubjects.length === 0 ? (
                                <p className="text-center text-slate-500 py-12">ไม่พบวิชาที่เปิดสอนในคาบนี้</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredSubjects.map((s, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleSelectSubject(s)}
                                            className="p-4 border border-slate-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-mono text-pink-600">{s.code} {s.group && `กลุ่ม ${s.group}`}</div>
                                                    <div className="font-semibold">{s.name}</div>
                                                    <div className="text-sm text-slate-600">{s.instructor}</div>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {s.parsedTimeSlots.map((t, ti) => (
                                                        <span key={ti} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                                                            {t.dayAbbrev}. {t.timeRange}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <footer className="glass-card border-t border-white/20 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>
        </div>
    );
}
