'use client';

import { Suspense } from 'react';
import PlannerContent from './PlannerContent';

export default function PlannerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PlannerContent />
        </Suspense>
    );
}
