# YKS Study Tracking Assistant

## Overview

YKS Study Tracking Assistant is a web application designed for Turkish university entrance exam (YKS) students to track their study activities. The application provides four main features: a to-do list for managing tasks, a question counter for tracking solved questions across subjects, a timer for study sessions, and an analysis dashboard with visualizations of study progress. The application emphasizes a soft, pastel-themed aesthetic with mobile-first responsive design to create a friendly and approachable learning environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, built using Vite as the build tool. The frontend follows a single-page application (SPA) pattern with client-side routing using Wouter.

**UI Framework**: shadcn/ui components (New York style variant) built on Radix UI primitives, providing accessible and customizable UI components. Styling is implemented with Tailwind CSS using a custom pastel color palette defined in CSS variables.

**Design System**: Mobile-first responsive design with a specific pastel color scheme targeting student users. The design uses:
- Pastel blue for headers and primary elements
- Pastel yellow/lime green variations for navigation cards
- Generous spacing and rounded corners (rounded-xl, rounded-2xl)
- Poppins font family for clean, modern typography
- A 2x2 grid layout for the main dashboard navigation

**State Management**: React Query (@tanstack/react-query) for server state management, providing automatic caching, background updates, and optimistic updates for a responsive user experience.

**Form Handling**: React Hook Form with Zod validation for type-safe form management and validation.

### Backend Architecture

**Runtime**: Node.js with Express.js framework running in ESNext module format.

**Development vs Production**: Separate entry points for development and production environments:
- Development mode uses Vite's middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static assets from the dist directory

**API Design**: RESTful API endpoints under `/api/*` namespace:
- **Authentication**:
  - `GET /api/auth/user` - Fetch current user (returns null if not authenticated)
  - `GET /api/login` - Redirect to Replit OAuth login
  - `GET /api/logout` - Logout and redirect to landing page
  - `GET /api/auth/callback` - OAuth callback handler
- **To-Do List**:
  - `GET /api/todos` - Fetch all todos
  - `POST /api/todos` - Create new todo
  - `PATCH /api/todos/:id` - Update todo
  - `DELETE /api/todos/:id` - Delete todo
- **Question Tracking**:
  - `GET /api/question-counts/:date` - Fetch question counts by date
  - `POST /api/question-counts` - Upsert question count
- **Timer Sessions**:
  - `GET /api/timer-sessions/:date` - Fetch timer sessions by date
  - `POST /api/timer-sessions` - Create timer session
- **Analytics**:
  - `GET /api/stats?startDate=X&endDate=Y` - Fetch aggregated statistics for date range (weekly/monthly analytics)

**Validation**: Zod schemas (defined in shared directory) validate all incoming API requests, with automatic error responses for validation failures.

**Data Storage**: PostgreSQL database using Drizzle ORM with `DbStorage` implementation. All data persists across server restarts. Uses Neon Pool driver with WebSocket support for transactions and sessions.

### Database Design

**ORM**: Drizzle ORM configured for PostgreSQL dialect with schema-first approach.

**Schema Structure**:
- `users` table: OAuth user data with email, firstName, lastName, profileImageUrl (via Replit Auth)
- `sessions` table: Express session storage for authentication state
- `todos` table: Task management with title and completion status
- `questionCounts` table: Daily question counts per subject with unique constraint on (subject, date) to prevent duplicates
- `timerSessions` table: Study session tracking with duration and subject

**Data Model Rationale**: Date-based tracking (storing dates as text) enables daily aggregation and historical analysis. Subjects are stored as text to allow flexibility in curriculum changes without schema migrations. Atomic upserts using Drizzle's `onConflictDoUpdate` ensure data integrity for question counts.

### Code Organization

**Monorepo Structure**: 
- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared TypeScript types and schemas (Zod validation schemas and database types)
- Path aliases configured for clean imports (`@/` for client, `@shared/` for shared code)

**Type Safety**: Full TypeScript coverage across frontend, backend, and shared code with strict mode enabled. Shared schema definitions ensure type consistency between client and server.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless UI component primitives for accessibility (@radix-ui/react-*)
- **shadcn/ui**: Pre-styled component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart visualization library for the analysis dashboard

### Data & State Management
- **TanStack Query** (@tanstack/react-query): Server state management with automatic caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Drizzle ORM**: Type-safe SQL query builder and schema manager

### Database
- **@neondatabase/serverless**: PostgreSQL database adapter with Pool driver and WebSocket support (via `ws` package)
- **Drizzle ORM**: Production database implementation with atomic upserts and proper transaction handling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Recent Changes (November 2024)

### Database Persistence Migration
- **Date**: November 24, 2025
- **Change**: Migrated from in-memory storage (`MemStorage`) to PostgreSQL database (`DbStorage`)
- **Implementation**: 
  - Using Drizzle ORM with Neon Pool driver
  - WebSocket support via `ws` package for Node.js compatibility
  - Added unique constraint on `question_counts(subject, date)` to prevent duplicate entries
  - Implemented atomic upserts using `onConflictDoUpdate` for question counts
  - All data now persists across server restarts
- **Testing**: End-to-end tests confirm data persistence across page refreshes for todos, question counts, and timer sessions

### Weekly/Monthly Statistics Feature
- **Date**: November 24, 2025
- **Change**: Added date range analytics with daily/weekly/monthly views to Analysis page
- **Implementation**:
  - New API endpoint `GET /api/stats?startDate=X&endDate=Y` for date range queries
  - Added `getQuestionCountsByDateRange` and `getTimerSessionsByDateRange` to storage interface
  - Frontend tabs for switching between Daily (today), Weekly (last 7 days), and Monthly (last 30 days)
  - Data aggregation by subject across date ranges to prevent duplicate chart entries
  - Dynamic header updates based on selected period (Bugün/Bu Hafta/Bu Ay)
- **Testing**: End-to-end tests verify proper aggregation and unique subject entries across all three periods

### Styling & UI Utilities
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Utility for conditional class names

### Build & Development Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Static type checking across the entire codebase
- **Wouter**: Lightweight client-side routing library
- **date-fns**: Date manipulation and formatting utilities

### Authentication System Implementation
- **Date**: November 24, 2025
- **Change**: Implemented complete Replit Auth integration with OAuth support (email, Google, Apple login)
- **Implementation**:
  - **Backend**:
    - Created `server/replitAuth.ts` with Replit Auth configuration using openid-client and passport
    - Updated database schema: users table now stores OAuth fields (email, firstName, lastName, profileImageUrl)
    - Added sessions table for PostgreSQL session storage (connect-pg-simple)
    - Session cookies configured with environment-aware security (secure flag only in production)
    - Public `/api/auth/user` endpoint returns null when not authenticated (prevents cache deadlock)
  - **Frontend**:
    - Created `useAuth` hook for centralized auth state management
    - Built Navbar component with logo and authentication buttons (Sign In/Sign Up or Logout)
    - Created Landing page for unauthenticated users with hero section
    - Protected routes: authenticated users see dashboard, unauthenticated users see landing
    - Single `useAuth` call in App.tsx Router, passed as props to Navbar to avoid duplicate requests
  - **User Flow**:
    - Unauthenticated: Landing page with Sign In/Sign Up buttons
    - Click Sign In → redirect to `/api/login` → Replit OAuth flow
    - After OAuth: callback to `/api/auth/callback` → session created → redirect to dashboard
    - Authenticated: Dashboard with 4 feature cards + Navbar with Logout button
    - Click Logout → session destroyed → redirect to landing page
- **Testing**: End-to-end test confirms complete auth flow (landing → login → dashboard → logout → landing)
- **Assets**: User logo (logo_son_1764010143596.png) imported via @assets alias in Navbar

### Google Fonts Integration
- **Poppins**: Primary font family loaded via Google Fonts CDN