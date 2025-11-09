# Photo Editing App - Design Guidelines

## Design Approach

**Reference-Based with System Foundation**: Drawing inspiration from **Figma's workspace model** (clean editing canvas with contextual sidebars) and **Linear's polish** (modern typography, subtle interactions), combined with **Material Design 3** principles for consistent component behavior.

### Core Design Principles
1. **Canvas-First**: The editing workspace is the hero - minimize chrome, maximize canvas
2. **Progressive Disclosure**: Show editing tools contextually, hide complexity until needed
3. **Visual Feedback**: Every AI operation has clear loading and completion states
4. **Effortless Navigation**: Gallery and history accessible but never intrusive

---

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
**Secondary Font**: JetBrains Mono (for prompts/technical text)

**Hierarchy**:
- Hero Headlines: 48px (3xl), 700 weight
- Page Titles: 32px (2xl), 600 weight  
- Section Headers: 24px (xl), 600 weight
- Body Large: 18px (lg), 400 weight
- Body Default: 16px (base), 400 weight
- Body Small: 14px (sm), 500 weight
- Captions: 12px (xs), 400 weight
- Monospace Prompts: 14px (sm), JetBrains Mono

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm.

**Grid Structure**:
- Container max-width: `max-w-7xl` (1280px) for main content
- Editor workspace: Full viewport width with `max-w-screen-2xl` for ultra-wide displays
- Gallery grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `gap-6`

**Page Layouts**:

1. **Editor Page** (Main workspace):
   - Header: Fixed top, `h-16`, contains logo, user menu, "Save to Gallery" CTA
   - Left Sidebar: `w-80`, collapsible, contains Edit History with scroll
   - Canvas Area: Flex-grow, centered image display with zoom controls
   - Bottom Panel: `h-24`, contains prompt input and suggestion chips
   - Right Sidebar (optional): `w-64`, shows before/after comparison when active

2. **Gallery Page**:
   - Header: `h-20` with page title and filter/sort controls
   - Masonry Grid: 4 columns desktop, 2 tablet, 1 mobile
   - Infinite scroll with intersection observer

3. **Onboarding Page**:
   - Centered card: `max-w-2xl`, multi-step interview flow
   - Progress indicator: Stepper with 4 steps
   - Large CTAs for each preference selection

---

## Component Library

### Navigation & Structure
**Header**: 
- Logo left (h-8), navigation center, user profile + gallery link right
- Backdrop blur effect when over content
- Border bottom: 1px subtle divider

**Sidebar (Edit History)**:
- Each history item: Card with thumbnail (80x80), prompt text truncated, timestamp
- Hover state: Slight elevation, "Use as Base" and "Save" buttons appear
- Active edit: Highlighted with accent border
- Scrollable with custom thin scrollbar

### Editor Components
**Image Canvas**:
- Centered container with `max-h-[70vh]` constraint
- Drop shadow for image
- Zoom controls: Bottom-right floating button group (Fit, 100%, 200%)
- Loading overlay: Frosted glass effect with progress ring

**Prompt Input**:
- Large textarea: `min-h-20`, auto-expand up to 3 lines
- Submit button: Primary CTA, right-aligned
- Character counter: Bottom-right, subtle

**Suggestion Chips**:
- Horizontal scroll container (hide scrollbar)
- Each chip: Pill shape, `px-4 py-2`, hover lifts slightly
- Categories: Color-coded borders (not backgrounds)

**Before/After Slider**:
- Full-width implementation using react-compare-image
- Handle: Circular with icon, dropshadow
- Labels: "Original" (left) and "Edited" (right) at top corners

### Gallery Components
**Gallery Item Card**:
- Aspect ratio: `aspect-square` for uniformity
- Thumbnail fills card
- Overlay on hover: Frosted glass with edit date and "View Details" button
- Click opens modal

**Image Detail Modal**:
- Full-screen overlay: `bg-black/90`
- Image: Max 90% viewport, centered
- Close button: Top-right, large hit area
- Download button: Bottom-right floating
- Before/After toggle: Bottom-left

### Form Components (Onboarding)
**Interview Cards**:
- Selection cards: `p-6`, grid of 2-3 options
- Each option: Border, icon, title, description
- Selected state: Accent border, subtle background
- Multi-select uses checkmarks, single-select uses radio visual

---

## Interaction Patterns

**AI Processing States**:
1. Idle: Standard prompt input
2. Processing: Shimmer effect on canvas, prompt input disabled, "Generating..." text
3. Success: Fade-in new image, add to history with subtle animation
4. Error: Toast notification, prompt input re-enabled

**Image Upload**:
- Drop zone: Dashed border, centered icon + text
- Active drag: Border becomes solid, background tint
- Uploading: Progress bar overlay
- Success: Fade to editor view

**Navigation Transitions**:
- Page transitions: 200ms fade
- Sidebar collapse: 300ms slide with easing
- Modal appearance: 250ms scale + fade

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px - Stack all sidebars, bottom prompt bar becomes fixed
- Tablet: 768px-1024px - Collapsible left sidebar, hide right by default
- Desktop: > 1024px - Full layout with all panels

**Mobile Optimizations**:
- Edit history: Bottom sheet drawer (swipe up)
- Canvas: Full screen with floating zoom controls
- Gallery: Single column grid with larger thumbnails

---

## Icons & Assets

**Icon Library**: Heroicons (outline for nav/actions, solid for filled states)
**Required Icons**: Upload, Sparkles (AI), History, Gallery, User, Download, Compare, Zoom In/Out, Close, Check, Arrow Right, Menu

### Images

**Hero Section (Homepage - if applicable)**:
- Full-width background: Before/after split showcasing dramatic transformation
- Left half: Original photo, Right half: AI-edited result
- Overlay gradient: Dark edges for text readability
- Blurred background buttons with `backdrop-blur-md`

**Gallery Thumbnails**: User-generated content, no placeholder images needed
**Onboarding**: Decorative spot illustrations for each interview step (abstract editing concepts)

---

## Accessibility Notes

- Focus indicators: 2px accent ring on interactive elements
- Skip links: Hidden until focused, jump to main canvas
- Screen reader labels: All icon buttons include aria-label
- Keyboard navigation: Tab through history items, Escape closes modals
- Form inputs: Consistent label placement above fields, error messages below