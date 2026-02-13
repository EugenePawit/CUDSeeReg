'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [currentView, setCurrentView] = useState('subjects');

    const navigate = (path: string) => {
        setCurrentView(path);
        router.push(path === 'subjects' ? '/' : `/${path}`);
    };

    return (
        <div className="min-h-screen">
            <header className="glass-card sticky top-0 z-40 border-b border-white/20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                            CUDSeeReg
                        </h1>
                        <p className="text-xs text-slate-600">ระบบช่วยเลือกวิชาเลือก</p>
                    </div>
                    <nav className="flex gap-2">
                        <button
                            onClick={() => navigate('subjects')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'subjects'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            รายวิชา
                        </button>
                        <button
                            onClick={() => navigate('planner')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'planner'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            วางแผนตาราง
                        </button>
                    </nav>
                </div>
            </header>

            {children}

            <footer className="glass-card border-t border-white/20 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-600">
                    <p className="mt-1">CUDSeeReg © 2026</p>
                </div>
            </footer>
        </div>
    );
}
