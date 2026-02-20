# CUDSeeReg Project Guide

## Overview
CUDSeeReg is a web application designed to help students discover elective subjects and plan their class timetables. It parses external data sources (GitHub JSON/CSV) to provide an interactive course browser and a visual weekly schedule planner.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Export**: html2canvas
- **Layout**: Bento Grid & Light Glassmorphism

## Project Structure
### Core Directories (`app/`)
- **`components/`**: Client-side UI components.
  - `HomeContent.tsx`: Main logic for the Browse/Home page, including search and subject cards.
- **`planner/`**: Dedicated route for the Timetable Planner.
  - `PlannerContent.tsx`: Main planner logic, grid rendering, and state orchestration.
  - `PlannerModal.tsx`: Modal for selecting electives within specific time slots. Uses `createPortal` for viewport positioning.
- **`presentation/`**: Dedicated route for project presentation.
  - `page.tsx`: Displays problem statement, tech stack, and feature walkthrough in Thai.
- **`lib/`**: Business logic and utilities.
  - `dataFetcher.ts`: Services to fetch subject data and descriptions from external GitHub repositories. Includes caching logic.
  - `baseTimetables.ts`: Definitions for core schedules (e.g., Grade 1, Grade 4-6 base structures).
  - `thaiTimeParser.ts`: utility to parse Thai day/time strings into structured data.
  - `shareTimetable.ts`: Utilities for generating shareable links and payloads.
- **`store/`**: Global state management.
  - `useTimetable.ts`: Zustand store managing the user's current schedule modifications.
- **`types/`**: TypeScript definitions.
  - `subject.ts`: Core interfaces like `Subject`, `FlattenedSubject`, `GroupedSubject`.

## Key Workflows
1.  **Data Loading**: Subjects are fetched on the client side using `dataFetcher.ts` which pulls from `ronnapatp/cudElective`. Data is cached in `localStorage`.
2.  **Timetable Planning**:
    - Users start with a `BaseTimetable` (e.g., M.5 Science).
    - They click empty slots to open `PlannerModal`.
    - Selected subjects are added to the Zustand store.
3.  **Exporting**: The timetable view is captured and downloaded as a PNG using `html2canvas`.

## Development Commands
- **Start Dev Server**: `npm run dev`
- **Build Production**: `npm run build`
- **Lint**: `npm run lint`

## Conventions
- **Component Architecture**: Major features (Browsing, Planning) are encapsulated in large "Content" components (`HomeContent`, `PlannerContent`) to separate client logic from server layouts.
- **Styling & Design**: 
  - Uses a **Light Mode** theme with vibrant pastel accents.
  - Core UI follows a **Bento Grid** layout with glassmorphism cards (`.glass-card`).
  - Standardized day colors (e.g., Pink for Tuesday, Blue for Friday) are used across all components.
- **Modals**: Complex modals (e.g., `PlannerModal`) use `createPortal` to render into `document.body`, escaping transform contexts from Framer Motion page transitions to maintain fixed positioning.
- **Animations**: Fluid motion using **Framer Motion** (Page transitions, Staggered entrance animations, and Magnetic buttons).
- **Type Safety**: strict utilization of interfaces from `app/types/`. All subject data manipulations should respect `FlattenedSubject` structure.

## Cache Keys
When the upstream data in `ronnapatp/cudElective` is updated and a force-refresh is needed, bump the version suffix on the relevant cache key in `dataFetcher.ts`:
- Subject JSON data: `cudseereg_subjects_m${grade}_json_v4`
- Subject descriptions CSV: `cudseereg_descriptions_m${grade}_v2`

## Data Notes
- **Subject descriptions** are read from the 5th column (index 4) of the CSV. If the header row contains a column named `คำอธิบาย` or `แนะนำ`, that column is used instead. The fallback to column index 4 was introduced after the original code incorrectly fell back to the subject name column (`ชื่อรายวิชา`).
