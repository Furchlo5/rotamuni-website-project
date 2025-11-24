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
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/question-counts/:date` - Fetch question counts by date
- `POST /api/question-counts` - Upsert question count
- `GET /api/timer-sessions/:date` - Fetch timer sessions by date
- `POST /api/timer-sessions` - Create timer session

**Validation**: Zod schemas (defined in shared directory) validate all incoming API requests, with automatic error responses for validation failures.

**Data Storage**: Abstracted through an `IStorage` interface, allowing for pluggable storage implementations. Currently includes an in-memory implementation (`MemStorage`) for development/testing. The schema and Drizzle configuration indicate preparation for PostgreSQL integration using Drizzle ORM.

### Database Design

**ORM**: Drizzle ORM configured for PostgreSQL dialect with schema-first approach.

**Schema Structure**:
- `users` table: User authentication with username/password
- `todos` table: Task management with title and completion status
- `questionCounts` table: Daily question counts per subject
- `timerSessions` table: Study session tracking with duration and subject

**Data Model Rationale**: Date-based tracking (storing dates as text) enables daily aggregation and historical analysis. Subjects are stored as text to allow flexibility in curriculum changes without schema migrations.

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
- **@neondatabase/serverless**: PostgreSQL database adapter (configured but storage layer currently uses in-memory implementation)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Styling & UI Utilities
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Utility for conditional class names

### Build & Development Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Static type checking across the entire codebase
- **Wouter**: Lightweight client-side routing library
- **date-fns**: Date manipulation and formatting utilities

### Google Fonts Integration
- **Poppins**: Primary font family loaded via Google Fonts CDN