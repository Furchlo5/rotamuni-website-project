# Design Guidelines: YKS Study Tracking Assistant

## Design Approach
**Modern Dark Mode Theme**: The application follows a sophisticated dark mode aesthetic with vibrant orange/amber gradients and teal/cyan accents. Design emphasizes modern, clean visuals appealing to young students while maintaining a professional and focused study environment. All elements use subtle shadows for depth and rounded-2xl corners for a contemporary look.

## Core Design Principles
- Mobile-first responsive design with consistent padding
- Persistent dark mode aesthetic (always enabled)
- Vibrant gradient accents for engagement and visual interest
- Clear visual hierarchy with generous spacing and shadows
- Smooth, purposeful animations with brightness transitions
- Consistent shadow usage (shadow-lg for headers, shadow-md for cards)

## Typography
- **Primary Font**: Poppins (loaded from Google Fonts)
- **Headings**: Font weight 600-700, pure white text for maximum contrast
- **Body Text**: Font weight 400-500, comfortable reading size
- **Subtext/Descriptions**: Muted gray (text-muted-foreground) for secondary information
- **Card Labels**: Font weight 500-600, centered alignment with white text on gradients

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
- Positioned at top of page with consistent margin (mb-6 or mb-8)
- Border radius: rounded-2xl exclusively
- Background: Vibrant gradients (bg-gradient-to-r) with shadow-lg for prominence
  - Dashboard: from-orange-500 to-amber-600
  - To-Do: from-orange-500 to-amber-600
  - Counter: from-teal-500 to-cyan-600
  - Timer: from-orange-600 to-amber-700
  - Analysis: from-cyan-500 to-teal-600
- Content: "YKS Yol Arkadaşım" or page titles in white
- Padding: p-6 for sub-pages, p-8 for dashboard
- Text: Large (text-2xl md:text-3xl for pages, text-3xl md:text-4xl for dashboard), white, font-bold
- Subtitle: text-white/90 for translucent effect

### Navigation Grid (Dashboard)
- Layout: 2-column, 2-row grid (grid-cols-2)
- Gap: Consistent spacing between cards (gap-4 or gap-6)
- Responsive: Maintains 2x2 structure across all breakpoints

### Navigation Cards
- Shape: Square or slightly rectangular with rounded-2xl corners
- Background: Vibrant gradients (bg-gradient-to-br) with shadow-lg for depth
  - To-Do: Orange to Amber (from-orange-500 to-amber-600)
  - Counter: Teal to Cyan (from-teal-500 to-cyan-600)
  - Timer: Darker Orange to Amber (from-orange-600 to-amber-700)
  - Analysis: Cyan to Teal (from-cyan-500 to-teal-600)
- Depth: Consistent shadow-lg shadows for modern elevated appearance
- Icon: Large Lucide-React icon (w-12 h-12 md:w-16 md:h-16) centered at top in pure white
  - To-Do List: ClipboardList
  - Question Counter: Calculator
  - Timer: Timer
  - Analytics: BarChart
- Label: Centered below icon, white text (text-white), font-semibold
- Hover Effect: brightness-110 for subtle glow
- Active State: brightness-90 for tactile feedback
- Transition: transition-all duration-200 for smooth interactions

### Sub-Page Layouts
- Header: Consistent with dashboard header
- Content Area: Centered with max-width container
- Background: Same dark background as dashboard
- Components: Cards use dark surfaces with rounded-xl aesthetic and accent colors

## Animations
- **Card Hover**: Brightness increase (brightness-110) with transition-all duration-200
- **Card Active**: Brightness decrease (brightness-90) for press feedback
- **Button Interactions**: Gentle hover:bg-white/20 on ghost variant buttons
- **Progress Bars**: Smooth fill animations with teal color
- **Loading Skeletons**: bg-white/20 with animate-pulse for consistency
- Keep animations subtle and purposeful - avoid distractions from study tasks

## Visual Depth & Shadows
- **Headers**: shadow-lg for prominent elevation
- **Navigation Cards**: shadow-lg for strong depth
- **Content Cards**: shadow-md for subtle elevation (subject cards, stat cards, charts)
- **Background**: Deep dark blue/charcoal creates contrast foundation
- Gradients add vibrant depth to important interactive elements
- No borders needed - shadows and color contrast provide sufficient definition

## Accessibility
- Ensure sufficient color contrast for all text on dark backgrounds
- Touch-friendly card sizes for mobile (minimum 44x44px tap targets)
- Clear focus states for keyboard navigation
- Semantic HTML structure

## Images
No hero images required. The application is utility-focused with icon-based navigation. Icons serve as primary visual elements throughout the interface.

## Page-Specific Guidelines

### Dashboard
- Deep dark background (bg-background)
- Welcoming header with orange-to-amber gradient and shadow-lg
- Prominent 2x2 grid (grid-cols-2) with vibrant gradient cards
- Each card has shadow-lg, rounded-2xl, and hover/active brightness effects

### To-Do List Page
- Orange-to-amber header gradient with shadow-lg
- Task cards with dark surface (Card component) 
- Primary buttons use default styling with orange accent
- Completed tasks show checkmark indicators

### Question Counter Page
- Teal-to-cyan header gradient with shadow-lg for uniqueness
- 8 subject cards (grid-cols-1 md:grid-cols-2) with shadow-md
- Each subject card has:
  - Gradient header (alternating orange/amber and teal/cyan combinations)
  - White subject name (text-white, font-semibold)
  - Large count display (text-4xl font-bold text-foreground)
  - Increment/decrement/reset buttons

### Timer Page
- Darker orange-to-amber header gradient (from-orange-600 to-amber-700) with shadow-lg
- Large timer display in white
- Primary action buttons with orange accent
- Session list with dark card backgrounds
- Loading skeleton uses bg-white/20

### Analysis/Charts Page
- Cyan-to-teal header gradient with shadow-lg
- Period tabs (Günlük/Haftalık/Aylık) for data filtering
- Three stat cards with shadow-md:
  - Toplam Soru: teal-400 text with teal-500/20 icon background
  - Çalışma Süresi: orange-400 text with orange-500/20 icon background
  - Ders Sayısı: cyan-400 text with cyan-500/20 icon background
- Charts use teal/orange color palette (COLORS array)
- All chart cards have shadow-md for consistency
