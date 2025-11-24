# Design Guidelines: YKS Study Tracking Assistant

## Design Approach
**User-Specified Design**: The application follows specific pastel-themed aesthetics targeting Turkish university entrance exam (YKS) students. Design emphasizes soft, friendly, and modern aesthetics appealing to young students.

## Core Design Principles
- Mobile-first responsive design
- Soft, approachable aesthetic with pastel color palette
- Clear visual hierarchy with generous spacing
- Smooth, subtle animations for engagement

## Typography
- **Primary Font**: Clean, modern sans-serif (use Google Fonts: Inter or Poppins)
- **Headings**: Font weight 600-700, larger sizes for emphasis
- **Body Text**: Font weight 400-500, comfortable reading size
- **Card Labels**: Font weight 500-600, centered alignment

## Color Palette
- **Background**: Light gray or off-white (#F9FAFB or similar soft neutral)
- **Header Background**: Pastel Blue (soft, calming blue tone)
- **Navigation Cards**: Pastel Yellow/Lime Green tones (warm, energetic pastels)
- **Text**: Dark gray for readability with sufficient contrast

## Layout System
- **Spacing Units**: Tailwind spacing - primarily use 4, 6, 8, 12, 16 units (p-4, gap-6, mb-8, etc.)
- **Container**: Centered content with responsive padding (px-4 md:px-6)
- **Grid**: 2x2 grid for navigation cards on mobile and desktop

## Component Specifications

### Header Component
- Positioned at top of page with margin from edges
- Border radius: rounded-xl or rounded-2xl
- Background: Pastel blue
- Content: "YKS Yol Arkadaşım" or "Hoşgeldin [User]" text
- Padding: Generous vertical and horizontal spacing
- Text: Large, centered, welcoming

### Navigation Grid (Dashboard)
- Layout: 2-column, 2-row grid (grid-cols-2)
- Gap: Consistent spacing between cards (gap-4 or gap-6)
- Responsive: Maintains 2x2 structure across all breakpoints

### Navigation Cards
- Shape: Square or slightly rectangular with rounded-xl corners
- Background: Pastel Yellow/Lime Green variations (each card can have slightly different pastel tone)
- Shadow: Soft shadow for depth (shadow-md or shadow-lg)
- Icon: Large Lucide-React icon centered at top
  - To-Do List: ClipboardList
  - Question Counter: Calculator or Tally5
  - Timer: Timer or Hourglass
  - Analytics: BarChart
- Label: Centered below icon, clear and readable
- Hover Effect: Scale transformation (scale-105) with smooth transition
- Active State: Slight scale-down effect for tactile feedback

### Sub-Page Layouts
- Header: Consistent with dashboard header but may include back navigation
- Content Area: Centered with max-width container
- Background: Same light background as dashboard
- Components: Cards and sections use same rounded-xl aesthetic with pastel accents

## Animations
- **Card Hover**: Smooth scale transform (transition-transform duration-200)
- **Page Transitions**: Subtle fade or slide effects when navigating between routes
- **Button Interactions**: Gentle scale or color transitions
- Keep animations subtle and purposeful - avoid distractions from study tasks

## Accessibility
- Ensure sufficient color contrast for all text
- Touch-friendly card sizes for mobile (minimum 44x44px tap targets)
- Clear focus states for keyboard navigation
- Semantic HTML structure

## Images
No hero images required. The application is utility-focused with icon-based navigation. Icons serve as primary visual elements throughout the interface.

## Page-Specific Guidelines

### Dashboard
- Welcoming header with greeting
- Prominent 2x2 navigation grid as main content
- Clean, uncluttered layout focusing on navigation cards

### To-Do List Page
- Task input section at top
- List of tasks with checkboxes
- Pastel accents for task categories or priorities

### Question Counter Page
- Subject-based counters with increment/decrement controls
- Visual feedback for count changes
- Daily or weekly totals display

### Timer Page
- Large, prominent timer display
- Start/pause/reset controls
- Session tracking or history

### Analysis/Charts Page
- Bar charts or line graphs showing study progress
- Use Recharts library with pastel color scheme
- Statistics cards summarizing key metrics