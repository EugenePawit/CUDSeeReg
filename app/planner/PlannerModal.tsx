'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DAY_NAMES_TH } from '../lib/baseTimetables';
import { FlattenedSubject, BaseTimetable } from '../types/subject';

const DAY_COLORS: Record<string, string> = {
    'จ': 'bg-yellow-100 text-yellow-700',
    'อ': 'bg-pink-100 text-pink-700',
    'พ': 'bg-green-100 text-green-700',
    'พฤ': 'bg-orange-100 text-orange-700',
    'ศ': 'bg-blue-100 text-blue-700',
};

interface PlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSlot: { day: string; period: number } | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    loading: boolean;
    baseTimetable: BaseTimetable | null;
    filteredSubjects: FlattenedSubject[];
    onSelectSubject: (subject: FlattenedSubject) => void;
}

export default function PlannerModal({
    isOpen,
    onClose,
    selectedSlot,
    searchQuery,
    onSearchChange,
    loading,
    baseTimetable,
    filteredSubjects,
    onSelectSubject
}: PlannerModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !selectedSlot || !mounted) return null;

    return createPortal(
        <div
            className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10"
            onClick={onClose}
        >
            <div
                className="modal-content bg-white/90 backdrop-blur-3xl border border-slate-200 shadow-glass-lg rounded-bento max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-black text-slate-800 drop-shadow-sm">
                            เลือกวิชา - {DAY_NAMES_TH[selectedSlot.day]} คาบ {selectedSlot.period}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors interactive-press">
                            <X size={20} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาวิชา (ชื่อวิชา, รหัสวิชา, อาจารย์)..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-slate-800 placeholder-slate-400 shadow-sm"
                        autoFocus
                    />
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar flex-grow z-10 relative">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <p className="text-center text-slate-500 py-12 font-medium">ไม่พบวิชาที่เปิดสอนในคาบนี้</p>
                    ) : (
                        <div className="space-y-4 p-2">
                            {filteredSubjects.map((subject, index) => (
                                <div
                                    key={`${subject.code}-${subject.group}-${index}`}
                                    onClick={() => onSelectSubject(subject)}
                                    className="stagger-item p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-pink-300 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-sm active:scale-[0.98]"
                                    style={{ animationDelay: `${Math.min(index * 0.03, 0.2)}s` }}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="text-xs font-mono tracking-wider text-pink-600 mb-1">{subject.code} {subject.group && `กลุ่ม ${subject.group}`}</div>
                                            <div className="font-bold text-slate-800 text-lg tracking-tight leading-tight mb-1">{subject.name}</div>
                                            <div className="text-sm text-slate-500 font-medium">{subject.instructor}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {subject.parsedTimeSlots.map((timeSlot, timeIndex) => (
                                                <span key={timeIndex} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${DAY_COLORS[timeSlot.dayAbbrev] || 'bg-slate-100 text-slate-700'}`}>
                                                    {timeSlot.dayAbbrev}. {timeSlot.timeRange}
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
        </div>,
        document.body
    );
}
