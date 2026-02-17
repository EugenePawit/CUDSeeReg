# CUDSeeReg Project Summary & Handoff

## Overview
CUDSeeReg is a Next.js web application designed to help students viewing subject information and planning their class schedules (timetables). It features a modern, responsive UI built with Tailwind CSS and supports interactive timetable planning with conflict detection.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for planner state)
- **Icons**: Lucide React
- **Data Source**: JSON and CSV files hosted on GitHub (cudElective repo)

## Key Features

### 1. Subject Viewer (Home Page)
- **Data Fetching**: Fetches subject data from `m{grade}.json` and descriptions from `m{grade}.csv` hosted externally.
- **Filtering**:
  - **Grade Selection**: Tabs for M.1 - M.6 (defaulting to M.5).
  - **Search**: Real-time filtering by subject code, name, or instructor.
- **Display**:
  - Grid of `SubjectCard` components.
  - Interactive "Info" (i) button triggers a modal with detailed subject info (credits, capacity, enrollment tracks, time slots, description).
  - Visual indicators for "Open" seats.
  - **Color Coding**: Days are color-coded (Yellow=Mon, Pink=Tue, Green=Wed, Orange=Thu, Blue=Fri).

### 2. Timetable Planner (`/planner`)
- **Base Timetables**: Pre-defined core schedules for M.1-M.6 and various tracks (Science, Arts, EP). defined in `app/lib/baseTimetables.ts`.
- **Interactive Slots**:
  - "Elective" slots are clickable.
  - Opens a modal to select available subjects for that specific time slot.
  - **Search**: Modal includes a search bar to find subjects quickly.
  - **Conflict Detection**: Prevents adding subjects that overlap with existing core or elective classes.
- **State Persistence**: Uses `zustand/persist` to save the user's timetable in `localStorage`.
- **Export**: Generates a PNG image of the timetable using `html2canvas`.

## Data Architecture

### Core Data Types (`app/types/subject.ts`)
- **`Subject`**: Raw data shape from JSON.
- **`FlattenedSubject`**: Processed subject with parsed time slots.
- **`GroupedSubject`**: Subjects grouped by code to handle multiple sections/groups.
- **`BaseTimetable`**: Structure for the fixed core schedules.

### Data Fetching (`app/lib/dataFetcher.ts`)
- **`fetchSubjects(grade)`**: Fetches JSON data. Caches in `localStorage` for 1 hour.
- **`fetchSubjectDescriptions(grade)`**: Fetches CSV data. Parses columns 1 (Code) and 5 (Description). Caches in `localStorage`.
- **`flattenSubjects`**: Normalizes raw data, handles multiple groups/teachers, and calculates available seats.
- **`groupSubjectsByCode`**: Aggergates flattened subjects for the main listing view.

### Time Parsing (`app/lib/thaiTimeParser.ts`)
- Parses Thai time strings (e.g., "จ. 08:30-10:20") into structured objects `{ day, start, end }`.
- Handles multiple time slots per subject.

## Directory Structure
```
root/
├── app/
│   ├── components/         # UI Components (HomeContent, SubjectCard)
│   ├── lib/
│   │   ├── baseTimetables.ts   # Core schedule definitions
│   │   ├── dataFetcher.ts      # API calls and data transformation
│   │   └── thaiTimeParser.ts   # Time string parsing logic
│   ├── planner/            # Planner page route
│   ├── store/              # Zustand state store (useTimetable.ts)
│   ├── types/              # TypeScript interfaces
│   ├── global.css          # Global styles & Tailwind directives
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (wraps HomeContent)
├── public/                 # Static assets
└── ...config files         # next.config, tailwind.config, etc.
```

## Recent Changes & Current State
1. **Data Source**: Reverted from CSV parsing back to JSON for reliability, but added a side-fetch for CSV descriptions.
2. **UI Enhancements**:
   - Switched from expandable cards to Modal popups for cleaner UI.
   - Added Escape key support for closing modals.
   - Moved "Student Capacity" badges for better visibility.
   - Added Search functionality to the Planner elective selection modal.
   - Updated "สำรวจวิชาเลือก" to "รายวิชาเรียน".
3. **Planner Logic**: Added graceful handling/messaging for M.1-M.3 which lack elective data options.

## What Was Added / Changed (Latest Update)

### 1. URL Timetable Sharing
- Added share payload utilities in `app/lib/shareTimetable.ts` to serialize/deserialize timetable state into a compact URL-safe token (`tt` query param).
- Planner now supports:
  - **Copy Share Link** button (clipboard + fallback copy behavior).
  - **Auto-import from shared URL** on page load.
  - Validation/fallback handling for invalid or partially missing subjects.
- Added store action `replaceTimetable` in `app/store/useTimetable.ts` for safe bulk hydration from a shared link.

### 2. Planner Performance + Code Optimizations
- Refactored planner screen into:
  - `app/planner/page.tsx` (Suspense wrapper)
  - `app/planner/PlannerContent.tsx` (main client logic)
- Added `useShallow` Zustand selector usage to reduce unnecessary rerenders.
- Replaced repeated conflict checks with memoized occupied-slot/selected-subject sets.
- Memoized filtered subject computation for slot modal search and conflict filtering.
- Stabilized timetable selection sync logic so selecting the same base timetable no longer resets state.

### 3. Home Page Performance + UX Optimizations
- Added deferred search (`useDeferredValue`) and memoized filtering for smoother typing on large lists.
- Memoized `SubjectCard` rendering and improved list animation load behavior.
- Improved URL grade sync logic to avoid redundant route replacements.

### 4. Animations and Transition System
- Added `framer-motion` dependency for animation primitives.
- Added route/page transition wrapper via `app/template.tsx`.
- Added modal enter/exit animation on both Home and Planner.
- Added click/press micro-interactions (`interactive-press`) for buttons, cards, and clickable table cells in `app/globals.css`.

### 5. Data Fetching Robustness Improvements
- Added in-memory caching layer on top of localStorage cache in `app/lib/dataFetcher.ts`.
- Improved CSV parsing to support escaped quotes.
- Switched description extraction from fixed column index to header-driven lookup with fallback.

## Deployment
- **Platform**: Vercel (recommended) or any Next.js compatible host.
- **Build**: Standard `npm run build`.
- **Note**: Currently seeing a warning about `@next/swc` version mismatch, but the build completes successfully.

## Future To-Dos / Known Issues
- **SWC Warning**: Resolve the version mismatch for `@next/swc`.
- **M.1-M.3 Electives**: Currently no data available for lower secondary electives.
- **Mobile Optimization**: Planner table is scrollable but could be optimized for small screens.
