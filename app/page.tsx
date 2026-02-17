'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { fetchSubjects, flattenSubjects, groupSubjectsByCode } from './lib/dataFetcher';
import { GroupedSubject } from './types/subject';

export default function Home() {
    const [grade, setGrade] = useState(5);
    const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchSubjects(grade)
            .then(data => {
                const flattened = flattenSubjects(data);
                const grouped = groupSubjectsByCode(flattened);
                setSubjects(grouped);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [grade]);

    const filtered = subjects.filter(s =>
        search ? s.name.includes(search) || s.code.includes(search) : true
    );

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
                        <Link href="/" className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium">
                            รายวิชา
                        </Link>
                        <Link href="/planner" className="px-4 py-2 rounded-lg text-slate-600 hover:bg-pink-100 font-medium">
                            วางแผนตาราง
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">สำรวจวิชาเลือก</h1>

                <div className="glass-card p-4 rounded-xl mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map(g => (
                            <button
                                key={g}
                                onClick={() => setGrade(g)}
                                className={grade === g ? 'btn-primary' : 'btn-secondary'}
                            >
                                ม.{g}
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
                            onChange={e => setSearch(e.target.value)}
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
                        {filtered.map(subject => (
                            <SubjectCard key={subject.code} subject={subject} />
                        ))}
                    </div>
                )}
            </main>

            <footer className="glass-card border-t border-white/20 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>
        </div>
    );
}

function SubjectCard({ subject }: { subject: GroupedSubject }) {
    const [selectedGroup, setSelectedGroup] = useState(0);
    const current = subject.groups[selectedGroup];
    const hasMultipleGroups = subject.groups.length > 1;

    // Map day abbreviations to colors matching the timetable
    const getDayColor = (dayAbbrev: string) => {
        const colorMap: Record<string, string> = {
            'จ': 'bg-yellow-100 text-yellow-700',
            'อ': 'bg-pink-100 text-pink-700',
            'พ': 'bg-green-100 text-green-700',
            'พฤ': 'bg-orange-100 text-orange-700',
            'ศ': 'bg-blue-100 text-blue-700',
        };
        return colorMap[dayAbbrev] || 'bg-pink-100 text-pink-700';
    };

    return (
        <div className="glass-card rounded-xl p-4">
            <div className="mb-3">
                <div className="text-sm font-mono text-pink-600 mb-1">{subject.code}</div>
                <h3 className="text-lg font-semibold text-slate-900">{subject.name}</h3>
            </div>

            {hasMultipleGroups && (
                <div className="mb-3">
                    <select
                        value={selectedGroup}
                        onChange={e => setSelectedGroup(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        {subject.groups.map((g, i) => (
                            <option key={i} value={i}>
                                กลุ่ม {g.group} - {g.instructor}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="text-sm text-slate-600 space-y-2">
                {!hasMultipleGroups && <div>อาจารย์: {current.instructor}</div>}
                <div className="flex flex-wrap gap-1">
                    {current.parsedTimeSlots.map((t, i) => (
                        <span key={i} className={`px-2 py-1 rounded text-xs ${getDayColor(t.dayAbbrev)}`}>
                            {t.dayAbbrev}. {t.timeRange}
                        </span>
                    ))}
                </div>
                <div>หน่วยกิต: {subject.credit}</div>
            </div>
        </div>
    );
}
