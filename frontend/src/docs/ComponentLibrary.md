# DICIS Tracker Atomic Component Library

This document outlines the core UI components implemented during the 100% componentization overhaul. These components serve as the single source of truth for all UI elements in the application.

## Core Atoms

### [BaseButton](../components/common/BaseButton.tsx)
Standardized button with support for multiple variants and states.
- **Variants**: `primary`, `secondary`, `ghost`, `danger`, `neutral`.
- **Sizes**: `sm`, `md`, `lg`, `icon`.
- **Features**: Built-in loading states, consistent scaling animations via `framer-motion`.

### [Badge](../components/common/Badge.tsx)
Short status labels or categories.
- **Variants**: `success`, `warning`, `danger`, `info`, `neutral`.
- **Features**: Icon support, consistent typography and dark mode support.

### [SearchBar](../components/common/SearchBar.tsx)
Standardized input field for searching lists.
- **Features**: Clear button, consistent focus states, built-in Icon.

## Layout & Wrappers

### [LayoutSection](../components/common/LayoutSection.tsx)
A semantic wrapper for page sections that provides consistent padding, spacing, and entry animations.

### [CardGrid](../components/common/CardGrid.tsx)
A responsive grid layout for displaying cards consistently across the app.
- **Prop**: `columns` (defaults to 1, 2, or 3 depending on context).

### [Tabs](../components/common/Tabs.tsx)
Reusable navigation for switched views.
- **Features**: Animated active state, support for custom icons and counts.

## Specialized Components

### [PageHeader](../components/common/PageHeader.tsx)
Standardized header for sections and pages.
- **Features**: Icon support, count badges, consistent typography with tracking-tight.

### [ScheduleModal](../components/common/ScheduleModal.tsx)
The unified modal for viewing schedules of Rooms, Professors, and Subjects.
- **Optimization**: Uses `BaseButton` and `Badge` for internal UI.

## Performance Patterns

1. **Memoization**: All core card components (`SubjectCard`, `RoomCard`, `ProfessorCard`) are wrapped in `React.memo` to prevent unnecessary re-renders in large lists.
2. **Standardization**: By using the atomic components, we ensure that changes to the design system propagate automatically across the entire app.
3. **Animations**: All interactive elements use `framer-motion` with standardized variants to ensure a premium, fluid feel.
