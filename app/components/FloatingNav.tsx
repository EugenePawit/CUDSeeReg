'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './motion/MagneticButton';

export default function FloatingNav() {
    const { scrollY } = useScroll();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Transform values based on scroll
    const navWidth = useTransform(scrollY, [0, 100], ["100%", "70%"]);
    const navY = useTransform(scrollY, [0, 100], [0, 10]);
    const navBg = useTransform(
        scrollY,
        [0, 100],
        ["rgba(255,255,255,0)", "rgba(255,255,255,0.7)"]
    );
    const navBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(24px)"]);
    const navBorder = useTransform(
        scrollY,
        [0, 100],
        ["border-transparent", "border-slate-200/50"]
    );

    if (!isMounted) return null;

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 font-sans pointer-events-none"
            style={{ y: navY }}
        >
            <motion.div
                className="flex items-center justify-between px-6 py-3 rounded-full shadow-glass pointer-events-auto border"
                style={{
                    width: navWidth,
                    maxWidth: '1200px',
                    backgroundColor: navBg,
                    backdropFilter: navBlur,
                    borderColor: 'rgba(0,0,0,0.05)'
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                        CUD<span className="text-pink-600">See</span>Reg
                    </span>
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                    <MagneticButton>
                        <Link
                            href="/"
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === '/' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            ค้นหาวิชา
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <Link
                            href="/planner"
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === '/planner' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            จัดตาราง
                        </Link>
                    </MagneticButton>
                </nav>
            </motion.div>
        </motion.header>
    );
}
