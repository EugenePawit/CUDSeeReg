'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export const staggerContainerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerItemVars = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

export function StaggerContainer({ children, className = '', ...props }: HTMLMotionProps<"div">) {
    return (
        <motion.div
            variants={staggerContainerVars}
            initial="hidden"
            animate="show"
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '', ...props }: HTMLMotionProps<"div">) {
    return (
        <motion.div
            variants={staggerItemVars}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
