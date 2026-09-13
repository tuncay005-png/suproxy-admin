# Implementation Plan: 3X-UI Style Transformation

## Overview

This implementation plan transforms the Suproxy Admin panel from a basic CRUD interface into a modern, premium dark-themed admin dashboard inspired by 3X-UI. The plan implements bilingual support (English/Russian), real-time system monitoring with circular progress charts, enhanced navigation with Xray management submenu, and comprehensive UI improvements while maintaining full compatibility with existing backend APIs.

**Implementation Language:** TypeScript with Next.js 15 App Router, React 19, Tailwind CSS 4

**Key Features:**
- Premium dark theme with coal-black backgrounds (#121212-#141414)
- Custom i18n implementation with English/Russian translations
- Real-time circular progress charts for CPU, RAM, Disk, Swap
- Activity cards for Xray status, uptime, and traffic monitoring
- Enhanced sidebar navigation with expandable Xray submenu
- Complete Xray management pages (Inbounds, Clients, Nodes, Routing)
- Character encoding fixes for UTF-8 data display
- Responsive layout with mobile-first design

## Tasks

- [x] 1. Foundation Setup
  - [x] 1.1 Enhance Tailwind dark theme with premium coal-black palette
    - Update `app/globals.css` with new dark theme color tokens
    - Define premium dark colors: background (#121212), card (#1a1a1a), borders (#2a2a2a)
    - Add chart-specific colors: green (#22c55e), yellow (#eab308), red (#ef4444)
    - Test contrast ratios meet WCAG AA standards (4.5:1 minimum)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.2 Create i18n context provider and translation infrastructure
    - Create `lib/i18n/context.tsx` with I18nProvider and useTranslations hook
    - Implement localStorage persistence for locale selection
    - Add automatic locale detection on mount
    - Create translation helper function `t(key)` with dot notation support
    - _Requirements: 3.22, 3.24_

  - [x] 1.3 Create English translation file
    - Create `lib/i18n/locales/en.json` with all navigation labels
    - Add dashboard section translations (titles, descriptions, statuses)
    - Add monitoring metric labels (CPU, RAM, Disk, Swap)
    - Add common UI text (loading, error, retry, data unavailable)
    - _Requirements: 3.5, 3.6, 3.7, 3.8, 3.9, 3.12, 3.14, 3.16, 3.18_

  - [x] 1.4 Create Russian translation file
    - Create `lib/i18n/locales/ru.json` mirroring English structure
    - Translate all navigation items to Russian
    - Translate dashboard and monitoring labels
    - Translate common UI text
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.13, 3.15, 3.17, 3.19_

  - [x] 1.5 Write property test for language persistence round-trip
    - **Property 4: Language Persistence Round-Trip**
    - **Validates: Requirements 3.3, 3.4**
    - Generate test cases for 'en' and 'ru' locales
    - Verify localStorage.setItem → getItem preserves exact value
    - Test across simulated page reloads

  - [x] 1.6 Implement UTF-8 character encoding validation
    - Create `lib/utils/encoding.ts` with sanitizeValue function
    - Add validation to reject "â€"" and similar encoding artifacts
    - Use proper fallback: display "0" instead of garbled characters
    - Apply to all numeric data rendering in stat cards
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.7 Write property test for UTF-8 character validation
    - **Property 1: UTF-8 Character Validation**
    - **Validates: Requirements 1.1, 1.3, 1.4**
    - Generate random text with valid UTF-8 and encoding artifacts
    - Verify validation returns true for valid, false for invalid
    - Test common encoding issues (em-dash, special characters)

- [x] 2. Core UI Components
  - [x] 2.1 Create CircularProgressChart component
    - Create `components/admin/dashboard/circular-progress-chart.tsx`
    - Implement SVG-based circular progress with stroke-dasharray animation
    - Add TypeScript interface: value, max, label, unit, size, strokeWidth props
    - Include CSS transition for smooth 300ms animations
    - Add ARIA progressbar role with aria-valuenow, aria-valuemin, aria-valuemax
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.11, 11.1, 11.6_

  - [x] 2.2 Implement chart color threshold logic
    - Add getChartColor function: return green (0-69%), yellow (70-89%), red (90-100%)
    - Apply color dynamically based on percentage value
    - Test with edge cases: 0%, 69%, 70%, 89%, 90%, 100%
    - _Requirements: 4.6, 4.7, 4.8_

  - [x] 2.3 Write property test for chart color threshold selection
    - **Property 2: Chart Color Threshold Selection**
    - **Validates: Requirements 4.6, 4.7, 4.8**
    - Generate random value/max pairs across full range
    - Calculate percentage and verify color matches threshold rules
    - Include boundary conditions (69%, 70%, 89%, 90%)

  - [x] 2.4 Create ActivityCard component
    - Create `components/admin/dashboard/activity-card.tsx`
    - Implement TypeScript interface: icon, title, value, description, status, statusDot props
    - Add status variants: success (green), warning (yellow), error (red), neutral (gray)
    - Include status dot indicator with color coding
    - Style with dark theme card background and borders
    - _Requirements: 5.1, 5.2, 5.3, 5.10, 11.2, 11.6_

  - [x] 2.5 Implement traffic unit conversion utilities
    - Create `lib/utils/format.ts` with formatTrafficSpeed and formatTrafficVolume
    - Auto-convert KB/s ↔ MB/s at 1024 threshold
    - Auto-convert GB ↔ TB at 1024 threshold
    - Implement round-trip conversion validation
    - _Requirements: 5.8, 5.9_

  - [x] 2.6 Write property test for traffic unit conversion
    - **Property 3: Traffic Unit Conversion**
    - **Validates: Requirements 5.8, 5.9**
    - Generate random byte values across magnitude ranges
    - Verify correct unit selection (KB/s, MB/s, GB, TB)
    - Test round-trip conversion preserves original value

  - [x] 2.7 Create LanguageSelector component
    - Create `components/admin/layout/language-selector.tsx`
    - Implement dropdown with English (🇺🇸) and Russian (🇷🇺) options
    - Use shadcn/ui DropdownMenu component
    - Integrate with i18n context to trigger language changes
    - Show checkmark for selected language
    - _Requirements: 3.1, 3.2, 3.23_

  - [x] 2.8 Create useRealTimePolling custom hook
    - Create `lib/hooks/use-real-time-polling.ts`
    - Implement TypeScript interface: fetchFunction, intervalMs, options
    - Add exponential backoff with configurable maxBackoff
    - Integrate Page Visibility API to pause on inactive tabs
    - Return data, error, isLoading, isFetching, refresh, lastUpdated
    - _Requirements: 4.9, 4.10, 6.5, 12.3_

  - [x] 2.9 Write property test for exponential backoff calculation
    - **Property 6: Exponential Backoff Calculation**
    - **Validates: Requirements 6.5**
    - Generate failure counts 0-20
    - Verify delay follows formula: interval × 2^(failures-1)
    - Confirm values never exceed maxBackoff (60000ms)

- [x] 3. Navigation Enhancement
  - [x] 3.1 Update navigation configuration with Xray submenu
    - Update `lib/utils/navigation.ts` with expanded structure
    - Add "Dashboard" / "Панель управления" menu item
    - Add "Xray Management" / "Управление Xray" parent with children
    - Add submenu items: Inbounds, Clients, Nodes, Routing
    - Add Plans and Monitoring menu items
    - Remove Azerbaijani labels, prepare for i18n integration
    - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18_

  - [x] 3.2 Integrate i18n into AdminLayout
    - Wrap `app/admin/layout.tsx` content with I18nProvider
    - Ensure context is available to all admin pages
    - Test language switching propagates to all components
    - _Requirements: 3.22, 3.23_

  - [x] 3.3 Integrate i18n into AdminSidebar
    - Update `components/admin/layout/admin-sidebar.tsx` to use useTranslations
    - Replace hardcoded "Suproxy Admin" with translatable key
    - Update footer version text with translation
    - _Requirements: 3.5, 3.6_

  - [x] 3.4 Integrate i18n into AdminNav component
    - Update `components/admin/layout/admin-nav.tsx` to use useTranslations
    - Replace item.title with t(item.labelKey) in NavItem rendering
    - Update "Coming Soon" text with translation
    - Test submenu expansion with translated labels
    - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19_

  - [x] 3.5 Add LanguageSelector to AdminHeader
    - Update `components/admin/layout/admin-header.tsx`
    - Add LanguageSelector component next to user menu
    - Style to match existing header aesthetic
    - Test language switching updates all visible UI immediately
    - _Requirements: 3.1, 3.2, 3.23_

  - [x] 3.6 Implement active route highlighting for submenus
    - Update NavItem in admin-nav.tsx to detect active child routes
    - Auto-expand parent when child is active
    - Maintain expansion state during navigation
    - Highlight specific submenu item when active
    - _Requirements: 3.19, 3.20, 7.8, 7.9_

  - [x] 3.7 Write property test for active route highlighting
    - **Property 7: Active Route Highlighting**
    - **Validates: Requirements 3.21**
    - Generate valid route paths from navigation structure
    - Verify isActive() returns true for matching item, false for others
    - Test with nested routes and submenus

- [x] 4. Checkpoint - Verify Foundation and Components
  - Ensure all TypeScript compiles without errors
  - Test dark theme colors in browser dev tools
  - Verify language switching works (en ↔ ru)
  - Confirm navigation displays correctly with translations
  - Test CircularProgressChart renders with different values
  - Verify ActivityCard displays with all status variants

- [x] 5. Dashboard Restructuring
  - [x] 5.1 Create SystemMonitors client component
    - Create `components/admin/dashboard/system-monitors.tsx`
    - Accept initialHealth prop from server component
    - Integrate useRealTimePolling for 5-second updates
    - Render 4 CircularProgressChart components (CPU, RAM, Disk, Swap)
    - Use responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.9, 10.2, 10.5_

  - [x] 5.2 Create ActivitySection client component
    - Create `components/admin/dashboard/activity-section.tsx`
    - Accept initialXrayStatus prop from server component
    - Integrate useRealTimePolling for 10-second updates
    - Render 3 ActivityCard components (Xray Status, Uptime, Traffic Speed)
    - Use responsive grid: 1 col mobile, 3 col desktop
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.3, 10.5_

  - [x] 5.3 Update Dashboard page with new layout structure
    - Update `app/admin/page.tsx` with three-section layout
    - Fetch initial data server-side (stats, health, xrayStatus, auditLogs)
    - Replace old stat cards with SystemMonitors component
    - Add ActivitySection component below monitors
    - Keep existing ActivityFeed and QuickActions in third section
    - Apply consistent spacing: 24px desktop, 12px mobile
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 5.4 Integrate i18n into Dashboard page
    - Use useTranslations hook in client components
    - Translate page header (title, description)
    - Translate system monitor labels
    - Translate activity card titles and statuses
    - Update "Data unavailable" and "Loading..." text
    - _Requirements: 1.2, 3.23, 10.7_

  - [x] 5.5 Implement error handling for real-time data
    - Add error state rendering in SystemMonitors
    - Display last known value with timestamp on fetch failure
    - Show warning indicator when data is stale
    - Implement retry button for manual refresh
    - _Requirements: 4.10, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.6 Add loading states and skeletons
    - Create skeleton components for charts and cards
    - Display during initial load and first fetch
    - Use shadcn/ui Skeleton component
    - Ensure smooth transition when data loads
    - _Requirements: 12.4, 12.5_

- [x] 6. Backend API Integration
  - [x] 6.1 Create system health API endpoint
    - Create or update `lib/api/endpoints/system.ts`
    - Add getHealth() method: GET /api/admin/system/health
    - Return SystemHealth model with CPU, RAM, Disk, Swap, uptime
    - Add UTF-8 charset to response headers
    - _Requirements: 6.1, 6.3, 1.3_

  - [x] 6.2 Create Xray status API endpoint
    - Add getXrayStatus() method: GET /api/admin/system/xray
    - Return XrayStatus model with status, traffic_speed, traffic_total, uptime
    - Handle 'running' | 'stopped' status mapping
    - _Requirements: 6.2, 5.1, 5.2_

  - [x] 6.3 Implement request deduplication cache
    - Create `lib/api/request-cache.ts` with RequestCache class
    - Implement 1-second cache TTL for duplicate requests
    - Integrate with systemApi getHealth and getXrayStatus
    - Test multiple simultaneous calls result in single network request
    - _Requirements: 6.7, 12.7_

  - [x] 6.4 Write property test for request deduplication
    - **Property 9: Request Deduplication Within Time Window**
    - **Validates: Requirements 12.7**
    - Trigger 5 simultaneous API calls to same endpoint
    - Mock network layer to count actual requests
    - Verify only 1 network request made, all callers receive same response

  - [x] 6.4 Add exponential backoff to API client
    - Update useRealTimePolling with backoff logic
    - Implement 1s → 2s → 4s → 8s retry pattern
    - Cap at 60 seconds maximum delay
    - Reset backoff on successful fetch
    - _Requirements: 6.5_

- [x] 7. Xray Management Pages Structure
  - [x] 7.1 Create Inbounds page route and structure
    - Create `app/admin/xray/inbounds/page.tsx` server component
    - Fetch inbounds data from backend API
    - Create `components/admin/xray/inbounds-table.tsx` client component
    - Display inbounds in data table with name, protocol, port, status
    - Add actions: view, edit, delete
    - Integrate i18n for column headers and labels
    - _Requirements: 7.1, 7.5, 7.10_

  - [x] 7.2 Create Clients page route and structure
    - Create `app/admin/xray/clients/page.tsx` server component
    - Fetch clients data from backend API
    - Create `components/admin/xray/clients-table.tsx` client component
    - Display clients in data table with email, inbound, status
    - Add actions: view, edit, delete
    - Integrate i18n for column headers and labels
    - _Requirements: 7.2, 7.6, 7.10_

  - [x] 7.3 Create Nodes page route and structure
    - Create `app/admin/xray/nodes/page.tsx` server component
    - Fetch nodes data from backend API
    - Create `components/admin/xray/nodes-table.tsx` client component
    - Display nodes in data table with name, address, status
    - Add actions: view, edit, delete
    - Integrate i18n for column headers and labels
    - _Requirements: 7.3, 7.7, 7.10_

  - [x] 7.4 Create Routing page route and structure
    - Create `app/admin/xray/routing/page.tsx` server component
    - Fetch routing rules from backend API
    - Create `components/admin/xray/routing-table.tsx` client component
    - Display rules in data table with name, type, action
    - Add actions: view, edit, delete
    - Integrate i18n for column headers and labels
    - _Requirements: 7.4, 7.10_

  - [x] 7.5 Create reusable DataTable component
    - Create `components/admin/common/data-table.tsx`
    - Implement TypeScript interface: columns, data, actions, searchable, sortable
    - Use shadcn/ui Table component
    - Add search input and column sorting
    - Implement mobile-responsive card layout
    - Add action dropdown menu for view/edit/delete
    - _Requirements: 7.10, 8.1, 8.2, 8.5, 8.6_

- [x] 8. Responsive Layout Implementation
  - [x] 8.1 Implement mobile sidebar behavior
    - Update AdminSidebar to collapse on mobile (<768px)
    - Add hamburger menu toggle in AdminHeader
    - Implement overlay and drawer animation
    - Test touch-friendly tap targets (44x44px minimum)
    - _Requirements: 8.1, 8.7_

  - [x] 8.2 Write property test for touch target minimum size
    - **Property 8: Touch Target Minimum Size**
    - **Validates: Requirements 8.7**
    - Query all interactive elements in mobile viewport
    - Measure computed width and height
    - Verify both dimensions ≥ 44px

  - [x] 8.3 Implement responsive dashboard grid layouts
    - Update SystemMonitors: 1 col mobile, 2 col tablet, 4 col desktop
    - Update ActivitySection: stack vertically mobile, horizontal desktop
    - Adjust spacing: 12px mobile, 16px tablet, 24px desktop
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 10.5, 10.6_

  - [x] 8.4 Test viewport resize transitions
    - Verify smooth transitions without content jumps
    - Test at breakpoints: 640px, 768px, 1024px, 1280px
    - Ensure charts and cards maintain aspect ratio
    - _Requirements: 8.8_

- [x] 9. Tailwind CSS Refinement
  - [x] 9.1 Define custom Tailwind classes for dark theme
    - Create utility classes in globals.css for premium cards
    - Add hover state classes with 5-10% lightening
    - Define focus ring styles for accessibility
    - Create chart-container and nav-item classes
    - _Requirements: 9.1, 9.2, 9.4, 9.7_

  - [x] 9.2 Apply Tailwind responsive utilities throughout
    - Use sm:, md:, lg:, xl: breakpoints consistently
    - Apply responsive padding and margin classes
    - Use responsive flex and grid layouts
    - _Requirements: 9.3_

  - [x] 9.3 Implement Tailwind transition utilities
    - Add transition classes to CircularProgressChart stroke-dashoffset
    - Apply transition to sidebar slide-in animation
    - Use transition on hover states for interactive elements
    - Set will-change: transform for GPU acceleration
    - _Requirements: 9.4, 4.11_

  - [x] 9.4 Minimize inline styles
    - Replace inline styles with Tailwind utilities where possible
    - Keep inline only for dynamic values (progress percentage, threshold colors)
    - Document remaining inline styles with comments
    - _Requirements: 9.6_

- [x] 10. Checkpoint - Verify Dashboard and Xray Pages
  - Test dashboard loads within 2 seconds
  - Verify real-time data updates every 5s (charts) and 10s (cards)
  - Confirm language switching updates all dashboard text
  - Test all 4 Xray management pages display correctly
  - Verify responsive layout on mobile, tablet, desktop
  - Check WCAG AA contrast ratios with browser tools

- [x] 11. Performance Optimization
  - [x] 11.1 Implement lazy loading for below-fold components
    - Use dynamic import for ActivityFeed component
    - Add loading skeleton for lazy components
    - Test LCP (Largest Contentful Paint) improvement
    - _Requirements: 12.5_

  - [x] 11.2 Optimize Server Components data fetching
    - Use Promise.allSettled for parallel API calls in getDashboardData
    - Handle partial failures gracefully
    - Log fetch timing for performance monitoring
    - _Requirements: 6.8, 12.4_

  - [x] 11.3 Add Page Visibility API to pause polling
    - Update useRealTimePolling to detect document.hidden
    - Pause polling when tab is inactive
    - Resume polling when tab becomes active
    - _Requirements: 12.3_

  - [x] 11.4 Run Lighthouse performance audit
    - Target: Performance score ≥ 85
    - Optimize FCP (First Contentful Paint) < 1.5s
    - Optimize LCP (Largest Contentful Paint) < 2.0s
    - Optimize TBT (Total Blocking Time) < 200ms
    - Minimize CLS (Cumulative Layout Shift) < 0.1
    - _Requirements: 12.1, 12.8_

- [x] 12. Accessibility Verification
  - [x] 12.1 Add ARIA labels to all charts and cards
    - Add role="progressbar" to CircularProgressChart
    - Include aria-valuenow, aria-valuemin, aria-valuemax
    - Add aria-label with metric description
    - Add aria-live regions for real-time updates
    - _Requirements: 2.7_

  - [x] 12.2 Verify keyboard navigation
    - Test Tab key navigation through all interactive elements
    - Verify focus indicators are visible
    - Test Escape key closes mobile sidebar
    - Ensure Enter/Space activate buttons and links
    - _Requirements: 8.7_

  - [x] 12.3 Run axe-core accessibility audit
    - Install @axe-core/react for automated testing
    - Fix critical and serious issues
    - Document minor issues for future consideration
    - _Requirements: 2.7_

  - [x] 12.4 Write property test for WCAG AA contrast ratio compliance
    - **Property 5: WCAG AA Contrast Ratio Compliance**
    - **Validates: Requirements 2.7**
    - Extract all color combinations from theme
    - Calculate contrast ratios using WCAG formula
    - Verify all combinations ≥ 4.5:1 (normal text) or ≥ 3:1 (large text)

- [x] 13. Browser Compatibility Testing
  - [x] 13.1 Test on Chrome/Edge (latest 2 versions)
    - Verify all features work correctly
    - Test real-time polling and animations
    - Check language switching
    - _Requirements: 12.2_

  - [x] 13.2 Test on Firefox (latest 2 versions)
    - Verify all features work correctly
    - Test SVG chart rendering
    - Check localStorage persistence
    - _Requirements: 12.2_

  - [x] 13.3 Test on Safari (macOS and iOS)
    - Verify all features work correctly
    - Test mobile responsive layout
    - Check touch interactions
    - _Requirements: 12.2_

  - [x] 13.4 Implement feature detection and graceful fallbacks
    - Add localStorage feature detection
    - Add ResizeObserver fallback
    - Add Page Visibility API fallback
    - _Requirements: 12.3_

- [x] 14. Testing and Quality Assurance
  - [x] 14.1 Write unit tests for CircularProgressChart
    - Test value rendering with different inputs
    - Test color threshold logic (green, yellow, red)
    - Test animation transitions
    - Test ARIA attributes

  - [x] 14.2 Write unit tests for ActivityCard
    - Test status variants (success, warning, error, neutral)
    - Test value formatting
    - Test status dot rendering

  - [x] 14.3 Write unit tests for LanguageSelector
    - Test locale switching triggers i18n context
    - Test localStorage persistence
    - Test dropdown menu interaction

  - [x] 14.4 Write unit tests for useRealTimePolling hook
    - Test polling interval timing
    - Test error handling and backoff
    - Test pause on inactive tab
    - Test manual refresh trigger

  - [x] 14.5 Write integration tests for i18n system
    - Test language switching updates all visible text
    - Test localStorage persistence across reload
    - Test fallback to default locale on invalid stored value

  - [x] 14.6 Write integration tests for real-time polling
    - Test data updates after polling interval
    - Test error state display
    - Test exponential backoff on repeated failures

- [x] 15. Documentation and Cleanup
  - [x] 15.1 Add JSDoc comments to all new components
    - Document CircularProgressChart with usage examples
    - Document ActivityCard with prop descriptions
    - Document LanguageSelector with integration notes
    - Document useRealTimePolling with options
    - _Requirements: 11.7_

  - [x] 15.2 Update README with new features
    - Document bilingual support (en/ru)
    - Explain dark theme customization
    - Document real-time monitoring features
    - Add screenshots of new UI

  - [x] 15.3 Remove Azerbaijani language remnants
    - Search codebase for "az" locale references
    - Remove unused translation keys
    - Clean up old language files if present

  - [x] 15.4 Clean up console logs and debug code
    - Remove development console.log statements
    - Keep error logging for production debugging
    - Ensure no sensitive data in logs

- [x] 16. Final Verification and Deployment
  - [x] 16.1 Run full TypeScript type check
    - Execute `npm run type-check` or `tsc --noEmit`
    - Fix any type errors
    - Verify all API response types match backend contracts

  - [x] 16.2 Run production build
    - Execute `npm run build`
    - Verify no build errors or warnings
    - Check bundle size is reasonable

  - [x] 16.3 Manual end-to-end testing
    - Test complete user journey: login → dashboard → Xray pages
    - Verify language switching throughout session
    - Test real-time data updates for 5 minutes
    - Verify mobile responsive layout on real device
    - Test all Xray management CRUD operations

  - [x] 16.4 Performance verification
    - Run Lighthouse audit on production build
    - Verify performance score ≥ 85
    - Verify accessibility score ≥ 90
    - Check network tab for API call patterns

  - [x] 16.5 Cross-browser final check
    - Test on Chrome, Firefox, Safari
    - Verify identical behavior across browsers
    - Check for browser-specific issues

## Notes

- **Tasks marked with `*` are optional testing sub-tasks** and can be skipped for faster MVP delivery
- **Character encoding fix (Task 1.6)** should be applied immediately to resolve garbled character display
- **i18n setup (Tasks 1.2-1.4)** must be completed before navigation and dashboard integration tasks
- **Core components (Tasks 2.1-2.8)** are prerequisites for dashboard restructuring
- **Navigation enhancement (Tasks 3.1-3.6)** can proceed in parallel with component development
- **Xray management pages (Tasks 7.1-7.5)** can be implemented in parallel after DataTable component is ready
- **Performance optimization (Tasks 11.1-11.4)** should be done after core features are stable
- **Property-based tests** validate universal correctness properties and catch edge cases
- **Unit tests** verify specific examples and component behavior
- **Integration tests** ensure different system parts work together correctly
- Each task references specific requirements for traceability
- Checkpoints provide natural pause points to verify work before proceeding

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.6"] },
    { "id": 1, "tasks": ["1.2", "1.7", "3.1"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.4", "2.5", "2.7", "3.2"] },
    { "id": 4, "tasks": ["2.3", "2.6", "2.8", "3.3", "3.4", "6.1", "6.2"] },
    { "id": 5, "tasks": ["2.9", "3.5", "3.6", "6.3", "6.4", "7.5"] },
    { "id": 6, "tasks": ["3.7", "5.1", "5.2", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["5.3", "5.4", "5.5", "8.1", "9.1"] },
    { "id": 8, "tasks": ["5.6", "8.2", "8.3", "9.2", "9.3"] },
    { "id": 9, "tasks": ["8.4", "9.4", "11.1", "11.2"] },
    { "id": 10, "tasks": ["11.3", "12.1", "12.2"] },
    { "id": 11, "tasks": ["11.4", "12.3", "12.4", "13.1", "13.2", "13.3"] },
    { "id": 12, "tasks": ["13.4", "14.1", "14.2", "14.3", "14.4"] },
    { "id": 13, "tasks": ["14.5", "14.6", "15.1", "15.2"] },
    { "id": 14, "tasks": ["15.3", "15.4", "16.1"] },
    { "id": 15, "tasks": ["16.2", "16.3"] },
    { "id": 16, "tasks": ["16.4", "16.5"] }
  ]
}
```

---

**Estimated Total Effort:** 8-10 days for core implementation (non-optional tasks)  
**Estimated With Testing:** 12-14 days including all optional test tasks  
**Implementation Language:** TypeScript  
**Framework:** Next.js 15 App Router with React 19  
**Styling:** Tailwind CSS 4 with custom dark theme  
**Testing:** Vitest + React Testing Library for unit and property-based tests
