'use client';

import { useState, useEffect, useMemo, useDeferredValue, memo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { fetchSubjects, flattenSubjects, groupSubjectsByCode, fetchSubjectDescriptions } from '../lib/dataFetcher';
import { GroupedSubject } from '../types/subject';
import { StaggerContainer, StaggerItem } from './motion/Stagger';
import TiltCard from './motion/TiltCard';

const DAY_COLORS: Record<string, string> = {
    'จ': 'bg-yellow-100 text-yellow-700',
    'อ': 'bg-pink-100 text-pink-700',
    'พ': 'bg-green-100 text-green-700',
    'พฤ': 'bg-orange-100 text-orange-700',
    'ศ': 'bg-blue-100 text-blue-700',
};

function normalizeText(input: string): string {
    return input.trim().toLowerCase();
}

export default function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [grade, setGrade] = useState(() => {
        const gradeParam = searchParams.get('grade');
        const parsedGrade = gradeParam ? parseInt(gradeParam, 10) : null;
        return parsedGrade && parsedGrade >= 1 && parsedGrade <= 6 ? parsedGrade : 5;
    });

    const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [descriptions, setDescriptions] = useState<Record<string, string>>({});
    const [modalData, setModalData] = useState<{ subject: GroupedSubject, groupIndex: number, description: string, anchor?: DOMRect } | null>(null);

    const handleViewDetails = useCallback((subject: GroupedSubject, groupIndex: number, rect?: DOMRect) => {
        setModalData({ subject, groupIndex, description: descriptions[subject.code] || '', anchor: rect });
    }, [descriptions]);

    // Add keydown listener to close modal on Escape
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setModalData(null);
            }
        };
        if (modalData) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [modalData]);

    useEffect(() => {
        const currentGrade = searchParams.get('grade');
        const nextGrade = grade.toString();
        if (currentGrade === nextGrade) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('grade', nextGrade);
        router.replace(`/?${params.toString()}`, { scroll: false });
    }, [grade, router, searchParams]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Promise.all([fetchSubjects(grade), fetchSubjectDescriptions(grade)])
            .then(([data, descs]) => {
                if (cancelled) {
                    return;
                }
                const flattened = flattenSubjects(data);
                const grouped = groupSubjectsByCode(flattened);
                setSubjects(grouped);
                setDescriptions(descs);
                setLoading(false);
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }
                console.error(error);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [grade]);

    const normalizedSearch = useMemo(() => normalizeText(deferredSearch), [deferredSearch]);

    const filteredSubjects = useMemo(() => {
        if (!normalizedSearch) {
            return subjects;
        }
        return subjects.filter((subject) => {
            const firstGroup = subject.groups[0];
            const haystack = `${subject.code} ${subject.name} ${firstGroup?.instructor ?? ''}`.toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [subjects, normalizedSearch]);

    const handleGradeChange = useCallback((nextGrade: number) => {
        setGrade(nextGrade);
    }, []);

    return (
        <div className="min-h-screen flex flex-col pt-32 pb-12">
            <main className="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-3 drop-shadow-sm">
                            รายวิชาเรียน
                        </h1>
                        <p className="text-slate-600 font-medium text-lg tracking-wide">สำรวจและวางแผนวิชาเลือกที่เปิดสอน</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    {/* Grade Selector */}
                    <div className="md:col-span-5 glass-card p-2 shadow-glass rounded-full flex gap-1 z-20 relative">
                        {[1, 2, 3, 4, 5, 6].map((itemGrade) => (
                            <button
                                key={itemGrade}
                                onClick={() => handleGradeChange(itemGrade)}
                                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${grade === itemGrade ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                            >
                                ม.{itemGrade}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="md:col-span-7 glass-card shadow-glass relative rounded-full overflow-hidden flex items-center z-20">
                        <Search className="absolute left-6 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อวิชา, รหัสวิชา, หรืออาจารย์ผู้สอน..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base border-none ring-0 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32 flex-grow items-center">
                        <div className="animate-spin w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full" />
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(280px,auto)]">
                        {filteredSubjects.map((subject) => {
                            return (
                                <StaggerItem
                                    key={subject.code}
                                    className={`col-span-1 w-full h-full relative z-10`}
                                >
                                    <TiltCard className="w-full h-full glass-card hover:border-pink-300 transition-colors">
                                        <SubjectCard
                                            subject={subject}
                                            description={descriptions[subject.code] || ''}
                                            onViewDetails={handleViewDetails}
                                        />
                                    </TiltCard>
                                </StaggerItem>
                            );
                        })}
                    </StaggerContainer>
                )}
            </main>

            <footer className="glass-card border-t border-white/20 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>

            {modalData && (() => {
                const { subject, groupIndex, description, anchor } = modalData;
                const current = subject.groups[groupIndex] ?? subject.groups[0];
                const hasMultipleGroups = subject.groups.length > 1;

                // Calculate position style if anchor exists (desktop)
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                let positionStyle: React.CSSProperties = {};
                let overlayClasses = "modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"; // Default centered (mobile)

                if (anchor && !isMobile) {
                    // Desktop: Position absolute/fixed relative to the anchor (which is now the CARD)
                    // Center horizontally relative to the card
                    const cardCenter = anchor.left + (anchor.width / 2);
                    const modalWidth = 448; // max-w-md (approx 28rem)
                    let left = cardCenter - (modalWidth / 2);
                    const top = anchor.top - 48; // Slightly above the card

                    // Boundary checks
                    // Ensure at least 16px from left edge
                    left = Math.max(16, left);
                    // Ensure at least 16px from right edge
                    const maxLeft = window.innerWidth - modalWidth - 16;
                    left = Math.min(left, maxLeft);

                    positionStyle = {
                        position: 'fixed',
                        top: `${top}px`,
                        left: `${left}px`,
                        width: '100%',
                        maxWidth: '28rem',
                        margin: 0,
                    };

                    // Ensure it doesn't go off-screen to the left
                    // logic handled by max-width + right alignment usually safe on desktop for this layout
                    // Change overlay to allow fixed positioning
                    overlayClasses = "modal-overlay fixed inset-0 bg-black/20 z-[100] block overflow-y-auto";
                }

                if (typeof window === 'undefined') return null;

                return createPortal(
                    <div
                        className={overlayClasses}
                        onClick={() => setModalData(null)}
                    >
                        <div
                            className="modal-content bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/40"
                            style={positionStyle}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm font-mono text-pink-600 mb-1">{subject.code}</div>
                                    <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
                                </div>
                                <button
                                    onClick={() => setModalData(null)}
                                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none interactive-press"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                {/* Common Details Section */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pb-3 border-b border-slate-100">
                                    <div>
                                        <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">หน่วยกิต</span>
                                        <div className="font-medium text-slate-800">{subject.credit}</div>
                                    </div>
                                    {current.classPerWeek && (
                                        <div>
                                            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ชม./สัปดาห์</span>
                                            <div className="font-medium text-slate-800">{current.classPerWeek}</div>
                                        </div>
                                    )}
                                    {current.enrollment && (
                                        <div className="col-span-2">
                                            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">เปิดรับ</span>
                                            <div className="font-medium text-slate-800">{current.enrollment}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Groups List Section */}
                                <div>
                                    <div className="font-bold text-slate-800 mb-2">กลุ่มเรียน:</div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {subject.groups.map((group, idx) => (
                                            <div
                                                key={`${group.group}-${idx}`}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${idx === groupIndex ? 'bg-pink-50 border-pink-200 ring-1 ring-pink-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-100 hover:shadow-sm'}`}
                                                onClick={() => setModalData(prev => prev ? ({ ...prev, groupIndex: idx }) : null)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <span className="font-semibold text-pink-700">กลุ่ม {group.group}</span>
                                                        <span className="text-slate-600 ml-2 text-sm">{group.instructor}</span>
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                        รับ {group.availableSeats}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {group.parsedTimeSlots.length > 0 ? (
                                                        group.parsedTimeSlots.map((timeSlot, timeIndex) => (
                                                            <span key={timeIndex} className={`px-2 py-1 rounded text-xs ${DAY_COLORS[timeSlot.dayAbbrev] || 'bg-pink-100 text-pink-700'}`}>
                                                                {timeSlot.dayAbbrev}. {timeSlot.timeRange}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">ไม่มีข้อมูลเวลา</span>
                                                    )}
                                                </div>
                                                {group.note && <div className="text-xs text-amber-700 mt-2 bg-amber-50 p-1.5 rounded border border-amber-100">{group.note}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Description Section */}
                                {(descriptions[subject.code] || description) && (descriptions[subject.code] || description).trim() !== '' && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <span className="font-medium text-slate-700">รายละเอียด:</span>
                                        <p className="text-slate-600 mt-1 leading-relaxed">{descriptions[subject.code] || description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                );
            })()}
        </div >
    );
}

interface SubjectCardProps {
    subject: GroupedSubject;
    description: string;
    onViewDetails: (subject: GroupedSubject, groupIndex: number, rect?: DOMRect) => void;
}

const SubjectCard = memo(function SubjectCard({ subject, description, onViewDetails }: SubjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [selectedGroup, setSelectedGroup] = useState(0);
    const current = subject.groups[selectedGroup] ?? subject.groups[0];
    const hasMultipleGroups = subject.groups.length > 1;

    useEffect(() => {
        if (selectedGroup >= subject.groups.length) {
            setSelectedGroup(0);
        }
    }, [selectedGroup, subject.groups.length]);

    return (
        <>
            <div
                ref={cardRef}
                className="w-full h-full p-6 relative flex flex-col justify-between z-30 cursor-pointer group"
                onClick={(e) => {
                    const rect = cardRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
                    onViewDetails(subject, selectedGroup, rect);
                }}
            >
                <div
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-pink-100 flex items-center justify-center text-slate-600 group-hover:text-pink-600 transition-all duration-300 group-hover:scale-110 z-40 shadow-sm"
                    aria-label="Show details"
                >
                    <span className="text-sm font-bold font-sans">i</span>
                </div>

                <div className="mb-4 pr-10">
                    <div className="text-sm font-mono tracking-widest text-pink-500 font-semibold mb-1 uppercase drop-shadow-sm">{subject.code}</div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tight drop-shadow-sm">{subject.name}</h3>
                </div>

                {hasMultipleGroups && (
                    <div className="mb-5 relative z-40">
                        <select
                            value={selectedGroup}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => setSelectedGroup(Number(event.target.value))}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none cursor-pointer hover:bg-slate-50 transition-colors relative z-50"
                        >
                            {subject.groups.map((group, groupIndex) => (
                                <option key={`${group.group}-${groupIndex}`} value={groupIndex} className="text-slate-900 bg-white">
                                    กลุ่ม {group.group} - {group.instructor}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                )}

                <div className="mt-auto">
                    <div className="text-sm text-slate-600 space-y-3 font-medium">
                        {!hasMultipleGroups && <div className="text-slate-700"><span className="text-slate-500 mr-2">อาจารย์:</span>{current.instructor}</div>}
                        <div className="flex flex-wrap gap-2">
                            {current.parsedTimeSlots.length > 0 ? (
                                current.parsedTimeSlots.map((timeSlot, timeIndex) => (
                                    <span key={timeIndex} className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${DAY_COLORS[timeSlot.dayAbbrev] || 'bg-slate-100 text-slate-700'}`}>
                                        {timeSlot.dayAbbrev}. {timeSlot.timeRange}
                                    </span>
                                ))
                            ) : (
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs italic">
                                    ไม่มีข้อมูลเวลา
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>{subject.credit} หน่วยกิต</span>
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>รับ {current.availableSeats}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});
