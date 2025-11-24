# Design Guidelines: YKS Study Tracking Assistant

## Design Approach
**Modern Dark Mode Theme**: The application follows a sophisticated dark mode aesthetic with vibrant orange gradients and teal accents. Design emphasizes modern, clean visuals appealing to young students while maintaining a professional and focused study environment.

## Core Design Principles
- Mobile-first responsive design
- Modern dark mode aesthetic
- Vibrant accent colors for engagement
- Clear visual hierarchy with generous spacing
- Smooth, purposeful animations

## Typography
- **Primary Font**: Modern, clean sans-serif (Inter or default system fonts)
- **Headings**: Font weight 600-700, white or very light gray
- **Body Text**: Font weight 400-500, comfortable reading size
- **Subtext/Descriptions**: Muted gray tones for secondary information
- **Card Labels**: Font weight 500-600, centered alignment

## Color Palette (Dark Mode)

### Background Colors
- **Main Background**: Deep dark blue/charcoal (220 25% 10%) - Creates immersive dark environment
- **Card/Surface Background**: Lighter dark gray/blue (220 20% 16%) - Provides subtle elevation
- **Elevated Surfaces**: Slightly lighter than cards for depth (220 18% 20%)

### Accent Colors
- **Primary Accent (Warm)**: Vibrant Orange/Amber (25 95% 55%)
  - Use for: Primary CTAs, important banners, emphasis text
  - Apply as gradients when possible (orange to amber transitions)
  - Gradients: from-orange-500 to-amber-500
- **Secondary Accent (Cool)**: Bright Teal/Cyan (180 85% 50%)
  - Use for: Progress bars, icons, statistics, data visualizations
  - Creates visual contrast with warm orange
  
### Text Colors
- **Primary Text**: White or very light gray (0 0% 95%)
- **Secondary Text**: Muted gray (220 15% 65%)
- **Tertiary Text**: Darker muted gray (220 15% 45%)

## Layout System
- **Spacing Units**: Tailwind spacing - primarily use 4, 6, 8, 12, 16 units (p-4, gap-6, mb-8, etc.)
- **Container**: Centered content with responsive padding (px-4 md:px-6)
- **Grid**: 2x2 grid for navigation cards on mobile and desktop
- **Border Radius**: Use rounded-xl or rounded-2xl for all cards, buttons, inputs

## Component Specifications

### Header Component
- Positioned at top of page with margin from edges
- Border radius: rounded-xl or rounded-2xl
- Background: Dark surface with subtle orange gradient accent
- Content: "YKS Yol Arkadaşım" or "Hoşgeldin [User]" text in white
- Padding: Generous vertical and horizontal spacing
- Text: Large, centered, welcoming

### Navigation Grid (Dashboard)
- Layout: 2-column, 2-row grid (grid-cols-2)
- Gap: Consistent spacing between cards (gap-4 or gap-6)
- Responsive: Maintains 2x2 structure across all breakpoints

### Navigation Cards
- Shape: Square or slightly rectangular with rounded-2xl corners
- Background: Dark surface with vibrant gradients
  - To-Do: Orange gradient (from-orange-500 to-amber-600)
  - Counter: Teal/Orange blend
  - Timer: Orange/Amber variations
  - Analysis: Teal accent
- Depth: Use color tone differences instead of heavy shadows
- Icon: Large Lucide-React icon centered at top in white/light color
  - To-Do List: ClipboardList
  - Question Counter: Calculator or Tally5
  - Timer: Timer or Hourglass
  - Analytics: BarChart
- Label: Centered below icon, white text, clear and readable
- Hover Effect: Subtle brightness increase with smooth transition
- Active State: Slight brightness decrease for tactile feedback

### Sub-Page Layouts
- Header: Consistent with dashboard header
- Content Area: Centered with max-width container
- Background: Same dark background as dashboard
- Components: Cards use dark surfaces with rounded-xl aesthetic and accent colors

## Animations
- **Card Hover**: Subtle brightness adjustment (transition duration-200)
- **Button Interactions**: Gentle brightness transitions
- **Progress Bars**: Smooth fill animations with teal color
- Keep animations subtle and purposeful - avoid distractions from study tasks

## Visual Depth
- Use color tone differences rather than heavy shadows
- Lighter surfaces appear "elevated" against darker backgrounds
- Subtle borders only where necessary
- Gradients add depth to important elements

## Accessibility
- Ensure sufficient color contrast for all text on dark backgrounds
- Touch-friendly card sizes for mobile (minimum 44x44px tap targets)
- Clear focus states for keyboard navigation
- Semantic HTML structure

## Images
No hero images required. The application is utility-focused with icon-based navigation. Icons serve as primary visual elements throughout the interface.

## Page-Specific Guidelines

### Dashboard
- Dark background with welcoming header featuring orange accent
- Prominent 2x2 navigation grid with gradient cards
- Clean, focused layout emphasizing the navigation cards

### To-Do List Page
- Task input section with orange accent button
- List of tasks with subtle dark backgrounds
- Teal checkmarks for completed tasks

### Question Counter Page
- Subject-based counters with increment/decrement controls
- Orange buttons for primary actions
- Teal progress indicators
- Visual feedback for count changes

### Timer Page
- Large, prominent timer display in white text
- Orange start/pause buttons
- Teal accent for session indicators
- Session tracking with dark card backgrounds

### Analysis/Charts Page
- Bar charts with teal and orange color scheme
- Use Recharts library with dark theme colors
- Statistics cards with dark surfaces
- Orange for emphasis metrics, teal for data points
