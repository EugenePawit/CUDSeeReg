'use client';

import { useState, useEffect, useMemo, useDeferredValue, memo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { fetchSubjects, flattenSubjects, groupSubjectsByCode, fetchSubjectDescriptions } from '../lib/dataFetcher';
import { GroupedSubject } from '../types/subject';

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
        <div className="min-h-screen">
            <header className="glass-card sticky top-0 z-40 border-b border-white/20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                            CUDSeeReg
                        </h1>
                        <p className="text-xs text-slate-600">ระบบช่วยเลือกวิชาเลือก</p>
                    </div>
                    <nav className="flex gap-2">
                        <Link href="/" className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium interactive-press">
                            รายวิชา
                        </Link>
                        <Link href="/planner" className="px-4 py-2 rounded-lg text-slate-600 hover:bg-pink-100 font-medium interactive-press">
                            วางแผนตาราง
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">รายวิชาเรียน</h1>

                <div className="glass-card p-4 rounded-xl mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map((itemGrade) => (
                            <button
                                key={itemGrade}
                                onClick={() => handleGradeChange(itemGrade)}
                                className={`${grade === itemGrade ? 'btn-primary' : 'btn-secondary'} interactive-press`}
                            >
                                ม.{itemGrade}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อวิชา, รหัสวิชา..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSubjects.map((subject, index) => (
                            <div key={subject.code} className="stagger-item" style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}>
                                <SubjectCard
                                    subject={subject}
                                    description={descriptions[subject.code] || ''}
                                    onViewDetails={handleViewDetails}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main >

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
                    const top = anchor.top; // Align top with card top (or use anchor.bottom for below)

                    // Boundary checks
                    // Ensure at least 16px from left edge
                    left = Math.max(16, left);
                    // Ensure at least 16px from right edge
                    const maxLeft = window.innerWidth - modalWidth - 16;
                    left = Math.min(left, maxLeft);

                    positionStyle = {
                        position: 'absolute',
                        top: `${top}px`,
                        left: `${left}px`,
                        width: '100%',
                        maxWidth: '28rem',
                        margin: 0,
                    };

                    // Ensure it doesn't go off-screen to the left
                    // logic handled by max-width + right alignment usually safe on desktop for this layout
                    // Change overlay to allow absolute positioning
                    overlayClasses = "modal-overlay fixed inset-0 bg-black/20 z-[100] block overflow-y-auto";
                }

                return (
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
                    </div>
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
            <div ref={cardRef} className="glass-card rounded-xl p-4 relative card-hover">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const rect = cardRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
                        onViewDetails(subject, selectedGroup, rect);
                    }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors interactive-press"
                    aria-label="Show details"
                >
                    <span className="text-xs font-bold">i</span>
                </button>

                <div className="mb-3 pr-8">
                    <div className="text-sm font-mono text-pink-600 mb-1">{subject.code}</div>
                    <h3 className="text-lg font-semibold text-slate-900">{subject.name}</h3>
                </div>

                {hasMultipleGroups && (
                    <div className="mb-3">
                        <select
                            value={selectedGroup}
                            onChange={(event) => setSelectedGroup(Number(event.target.value))}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 interactive-press"
                        >
                            {subject.groups.map((group, groupIndex) => (
                                <option key={`${group.group}-${groupIndex}`} value={groupIndex}>
                                    กลุ่ม {group.group} - {group.instructor}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="text-sm text-slate-600 space-y-2">
                    {!hasMultipleGroups && <div>อาจารย์: {current.instructor}</div>}
                    <div className="flex flex-wrap gap-1">
                        {current.parsedTimeSlots.length > 0 ? (
                            current.parsedTimeSlots.map((timeSlot, timeIndex) => (
                                <span key={timeIndex} className={`px-2 py-1 rounded text-xs ${DAY_COLORS[timeSlot.dayAbbrev] || 'bg-pink-100 text-pink-700'}`}>
                                    {timeSlot.dayAbbrev}. {timeSlot.timeRange}
                                </span>
                            ))
                        ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs italic">
                                ไม่มีข้อมูลเวลาเรียน
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>หน่วยกิต: {subject.credit}</span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                            รับ {current.availableSeats} คน
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
});
