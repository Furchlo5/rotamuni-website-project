# RotamUni - Study Tracking Application

## Overview
RotamUni is a web application designed for Turkish university entrance exam students to track their study activities. It features a to-do list, a question counter, a study timer (with stopwatch and Pomodoro options), and an analytics dashboard with data visualizations. The application aims to provide a comprehensive, engaging, and mobile-first study tracking experience, helping students monitor their progress, identify areas for improvement, and stay motivated.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology**: React with TypeScript, Vite, Wouter for client-side routing.
- **UI/UX**: Mobile-first responsive design, pastel color scheme, Poppins font. Utilizes shadcn/ui (New York style) built on Radix UI, styled with Tailwind CSS.
- **State Management**: React Query for server state.
- **Form Handling**: React Hook Form with Zod validation.
- **Visualizations**: Recharts for data analytics.

### Backend
- **Technology**: Node.js with Express.js (ESNext module format).
- **API**: RESTful API with endpoints for authentication, to-do management, question tracking, timer sessions, analytics, streak tracking, and exam result tracking.
- **Validation**: Zod schemas for all API request validation.
- **Authentication**: Replit OAuth integration with user and session management.

### Database
- **ORM**: Drizzle ORM for PostgreSQL.
- **Schema**: Tables for `users`, `sessions`, `todos`, `questionCounts`, `timerSessions`, and `netResults`.
- **Data Isolation**: All user-specific data is isolated by `userId` and requires authentication.
- **Data Model**: Date-based tracking (dates as text) for historical analysis. Subjects stored as text for flexibility. Atomic upserts for data integrity.

### Code Organization
- **Structure**: Monorepo with `client/` (frontend), `server/` (backend), and `shared/` (common types and schemas) directories.
- **Type Safety**: Full TypeScript coverage with strict mode and shared Zod schemas ensuring end-to-end type consistency.

### Key Features Implemented
- **Comprehensive Authentication**: Replit OAuth integration.
- **Persistent Storage**: PostgreSQL database using Drizzle ORM for all data.
- **Study Timer**: Stopwatch and Pomodoro modes, tracking study sessions.
- **Question Counter**: Tracks solved questions by subject and date.
- **To-Do List**: Task management with completion status.
- **Analysis Dashboard**: Visualizations of study progress, including weekly/monthly statistics.
- **Streak Tracking**: Displays consecutive study days and monthly study calendars.
- **Exam Result Tracking (Net Takibi)**: Records TYT/AYT practice exam scores, calculates net scores, and visualizes progress over time.

## External Dependencies

### UI/Design
- **Radix UI**: Headless UI components.
- **shadcn/ui**: Pre-styled UI components.
- **Lucide React**: Icon library.
- **Recharts**: Charting library.
- **Google Fonts**: Poppins font family.

### Data & State Management
- **TanStack Query**: Server state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.
- **Drizzle ORM**: PostgreSQL ORM.

### Database
- **@neondatabase/serverless**: PostgreSQL adapter.
- **connect-pg-simple**: PostgreSQL session store for Express.