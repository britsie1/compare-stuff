# Recommended Improvements for react-compare-app

This document outlines the suggested improvements for the React Comparison App, categorized by area.

## 1. Architectural & Code Quality Improvements
- [x] **Standardize Data Fetching with TanStack Query**: Refactored core components and services to use custom hooks (`useTemplates`, `useComments`, etc.) for better caching and state management.
- [x] **Extract Wrapper Components**: Extracted `ComparisonViewWrapper` and `EditComparisonFormWrapper` to clean up `App.jsx` routing.
- [x] **Full TypeScript Migration**: Completed. All components, services, hooks, and **test files** have been migrated to `.ts` or `.tsx` with zero type errors.
- [x] **Modernize Sticky Header**: Restored the original logic-based approach to handle viewport vertical stickiness and horizontal scroll synchronization correctly.
- [x] **Fix and Type Tests**: All Jest unit tests and Playwright E2E tests have been fixed, typed, and verified to pass.

## 2. UI/UX & Accessibility Enhancements
- [x] **Replace alert() with Modern Toast Notifications**: Used `sonner` for non-blocking feedback across all components.
- [x] **Implement Loading Skeletons**: Use skeleton screens (`react-loading-skeleton`) instead of simple spinners/text in lists and tables.
- [x] **Advanced Form Validation**: Integrated `react-hook-form` and `zod` for `CreateComparisonForm` and `ItemFormModal` to provide real-time validation feedback.
- [x] **Smooth Transitions**: Added page transitions and entry animations using `framer-motion` for a more polished feel.

## 3. New Features & Functionality
- [ ] **Search and Filter**: Add search and status filtering to the comparison list and user dashboard.
- [ ] **Export Options**: Allow exporting comparisons as CSV, PDF, or Markdown.
- [ ] **Public Sharing via QR/Links**: Generate shareable links or QR codes for published templates.
- [ ] **Item Reordering**: Use drag-and-drop to allow users to reorder items horizontally in the comparison table.

## 4. Testing & Maintenance
- [ ] **Increase Test Coverage**: Add unit tests for hooks and integration tests for core comparison flows.
- [ ] **Centralized Error Handling**: Implement a global error boundary and a standard service for Firebase error mapping.
