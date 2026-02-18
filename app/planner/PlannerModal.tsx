'use client';

import { X } from 'lucide-react';
import { DAY_NAMES_TH } from '../lib/baseTimetables';
import { FlattenedSubject, BaseTimetable } from '../types/subject';

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
    if (!isOpen || !selectedSlot) return null;

    return (
        <div
            className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10"
            onClick={onClose}
        >
            <div
                className="modal-content bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="p-4 border-b bg-pink-50">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-pink-900">
                            เลือกวิชา - {DAY_NAMES_TH[selectedSlot.day]} คาบ {selectedSlot.period}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-pink-100 rounded-lg interactive-press">
                            <X size={20} />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาวิชา (ชื่อวิชา, รหัสวิชา, อาจารย์)..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                        autoFocus
                    />
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
                            {filteredSubjects.map((subject, index) => (
                                <div
                                    key={`${subject.code}-${subject.group}-${index}`}
                                    onClick={() => onSelectSubject(subject)}
                                    className="stagger-item p-4 border border-slate-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                                    style={{ animationDelay: `${Math.min(index * 0.03, 0.2)}s` }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-mono text-pink-600">{subject.code} {subject.group && `กลุ่ม ${subject.group}`}</div>
                                            <div className="font-semibold">{subject.name}</div>
                                            <div className="text-sm text-slate-600">{subject.instructor}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {subject.parsedTimeSlots.map((timeSlot, timeIndex) => (
                                                <span key={timeIndex} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
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
        </div>
    );
}
