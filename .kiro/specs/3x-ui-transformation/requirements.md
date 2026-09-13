# Requirements Document

## Introduction

**Feature: 3X-UI Style Transformation**

This feature transforms the Suproxy Admin panel from a basic CRUD interface into a modern, premium dark-themed admin dashboard inspired by 3X-UI. The transformation includes fixing character encoding issues, implementing a sophisticated dark color scheme, restructuring navigation with bilingual support (English and Russian), adding real-time system monitoring with circular progress charts, and integrating comprehensive Xray management capabilities. The goal is to create a professional, visually appealing interface that matches 3X-UI's modern aesthetics while maintaining full compatibility with existing backend APIs.

## Glossary

- **Admin_Panel**: The Suproxy Admin web application interface
- **Dark_Theme**: A premium dark color scheme with coal-black backgrounds (#121212-#141414) and soft white/gray text
- **Sidebar**: The left navigation menu providing access to all admin sections
- **Dashboard**: The main landing page displaying system metrics and monitoring information
- **Circular_Progress_Chart**: A circular visualization showing percentage-based metrics (CPU, RAM, Disk, Swap)
- **System_Monitor**: Real-time component displaying server resource usage and Xray status
- **Xray_Management_Section**: Submenu containing Inbounds, Clients, Nodes, and Routing pages
- **Stat_Card**: A dashboard card displaying a single metric with icon, value, and description
- **Activity_Card**: A dashboard card showing real-time system information (Xray status, uptime, traffic)
- **Character_Encoding_Issue**: Display of garbled characters like "â€"" instead of proper em-dash or zero
- **Backend_API**: Existing REST API endpoints for data retrieval and manipulation
- **Responsive_Layout**: UI that adapts to mobile, tablet, and desktop screen sizes
- **Real_Time_Data**: Live system metrics fetched periodically from backend APIs
- **Traffic_Speed**: Current network throughput measured in KB/s or MB/s
- **Traffic_Volume**: Total accumulated network data transfer measured in GB
- **Uptime**: Duration the system has been running without restart
- **Navigation_Structure**: Hierarchical organization of menu items with parent items and submenus
- **i18n_Localization**: Multi-language support system with English and Russian translations
- **Language_Selector**: UI component allowing users to switch between supported languages
- **Translation_Key**: Unique identifier mapping to localized text strings

## Requirements

### Requirement 1: Character Encoding and Data Display Fix

**User Story:** As an administrator, I want to see properly formatted data instead of garbled characters, so that I can accurately read system metrics.

#### Acceptance Criteria

1. WHEN stat cards display numeric data, THE Admin_Panel SHALL render proper characters without encoding artifacts (no "â€"" symbols)
2. WHEN data is unavailable or loading, THE Admin_Panel SHALL display either "0" or a localized loading message ("Loading..." in English / "Загрузка..." in Russian) instead of encoded characters
3. WHEN numeric values contain em-dashes or special characters, THE Admin_Panel SHALL use proper UTF-8 encoding
4. THE Admin_Panel SHALL validate all text content is UTF-8 encoded before rendering

### Requirement 2: Premium Dark Theme Implementation

**User Story:** As an administrator, I want a modern dark interface that reduces eye strain and looks professional, so that I can work comfortably for extended periods.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use a primary background color between #121212 and #141414 (coal-black)
2. THE Admin_Panel SHALL soften all white borders to use subtle gray tones (#2a2a2a to #333333)
3. THE Admin_Panel SHALL render text and icons in soft white (#e4e4e7) or light gray (#a1a1aa) colors
4. WHEN cards and containers are displayed, THE Admin_Panel SHALL use slightly lighter backgrounds (#1a1a1a to #1f1f1f) for contrast
5. THE Admin_Panel SHALL apply consistent dark theme styling across all pages and components
6. WHEN hover states occur, THE Admin_Panel SHALL lighten interactive elements by 5-10% for visual feedback
7. THE Admin_Panel SHALL maintain WCAG AA contrast ratios for accessibility (minimum 4.5:1 for normal text)

### Requirement 3: Bilingual Navigation Structure (English/Russian)

**User Story:** As an administrator, I want to switch between English and Russian interface languages, so that I can use the panel in my preferred language.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a Language_Selector component in the header or settings area
2. THE Language_Selector SHALL allow switching between English and Russian languages
3. THE Admin_Panel SHALL persist the selected language in localStorage
4. WHEN the page loads, THE Admin_Panel SHALL apply the previously selected language from localStorage (defaulting to English)
5. WHEN English is selected, THE Sidebar SHALL display navigation items in English
6. WHEN Russian is selected, THE Sidebar SHALL display navigation items in Russian
7. THE Sidebar SHALL include a "📊 Dashboard" (EN) / "📊 Панель управления" (RU) menu item linking to the main dashboard
8. THE Sidebar SHALL include a "👥 Users" (EN) / "👥 Пользователи" (RU) menu item linking to user management
9. THE Sidebar SHALL include a "📥 Sessions" (EN) / "📥 Сессии" (RU) menu item linking to session management
10. THE Sidebar SHALL include a "🚀 Xray Management" (EN) / "🚀 Управление Xray" (RU) parent menu item with expandable submenu
11. WHEN "🚀 Xray Management" / "🚀 Управление Xray" is clicked, THE Sidebar SHALL expand to reveal four submenu items
12. THE Xray_Management_Section submenu SHALL include "📥 Inbounds" (EN) / "📥 Входящие" (RU) linking to inbound management
13. THE Xray_Management_Section submenu SHALL include "🔑 Clients" (EN) / "🔑 Клиенты" (RU) linking to client management
14. THE Xray_Management_Section submenu SHALL include "⚙️ Nodes" (EN) / "⚙️ Узлы" (RU) linking to node management
15. THE Xray_Management_Section submenu SHALL include "🗺️ Routing" (EN) / "🗺️ Маршрутизация" (RU) linking to routing configuration
16. THE Sidebar SHALL include a "📦 Plans" (EN) / "📦 Тарифы" (RU) menu item linking to plan management
17. THE Sidebar SHALL include a "📝 Logs" (EN) / "📝 Логи" (RU) menu item linking to audit logs
18. THE Sidebar SHALL include a "🖥️ Monitoring" (EN) / "🖥️ Мониторинг" (RU) menu item linking to system monitoring
19. THE Sidebar SHALL highlight the currently active menu item
20. WHEN a submenu is expanded, THE Sidebar SHALL maintain expansion state during navigation within that section
21. THE Sidebar SHALL be collapsible on mobile devices for responsive design
22. THE Admin_Panel SHALL use next-i18next or similar i18n library for managing translations
23. WHEN language is changed, THE Admin_Panel SHALL update all visible text immediately without page reload
24. THE Admin_Panel SHALL load the appropriate translation bundle based on the selected language

### Requirement 4: Circular Progress System Monitors

**User Story:** As an administrator, I want to see real-time system resource usage in intuitive circular charts, so that I can quickly assess server health.

#### Acceptance Criteria

1. THE Dashboard SHALL display four Circular_Progress_Charts in the top section
2. THE Dashboard SHALL display a CPU usage Circular_Progress_Chart showing percentage (0-100%)
3. THE Dashboard SHALL display a RAM usage Circular_Progress_Chart showing used memory in MB
4. THE Dashboard SHALL display a Swap usage Circular_Progress_Chart showing swap memory usage
5. THE Dashboard SHALL display a Disk usage Circular_Progress_Chart showing used storage in GB
6. WHEN system resource usage is below 70%, THE Circular_Progress_Chart SHALL display in green color (#22c55e)
7. WHEN system resource usage is between 70% and 89%, THE Circular_Progress_Chart SHALL display in yellow color (#eab308)
8. WHEN system resource usage is 90% or above, THE Circular_Progress_Chart SHALL display in red color (#ef4444)
9. THE Circular_Progress_Chart SHALL update every 5 seconds with fresh data from Backend_API
10. WHEN data fetch fails, THE Circular_Progress_Chart SHALL display the last known value with a warning indicator
11. THE Circular_Progress_Chart SHALL animate smoothly when values change (transition duration 300ms)
12. WHEN hovering over a Circular_Progress_Chart, THE Dashboard SHALL display detailed tooltip with exact values

### Requirement 5: Activity and Status Cards

**User Story:** As an administrator, I want to see Xray status, system uptime, and traffic information at a glance, so that I can monitor operational status quickly.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Xray Status Activity_Card showing operational state
2. WHEN Xray is running, THE Activity_Card SHALL display localized "Running" text (English) / "Работает" (Russian) with a green indicator dot
3. WHEN Xray is stopped, THE Activity_Card SHALL display localized "Stopped" text (English) / "Остановлен" (Russian) with a red indicator dot
4. THE Dashboard SHALL display a System Uptime Activity_Card showing days, hours, and minutes
5. THE Dashboard SHALL display a Traffic Speed Activity_Card showing current throughput in KB/s or MB/s
6. THE Dashboard SHALL display a Total Traffic Activity_Card showing accumulated volume in GB or TB
7. THE Activity_Card SHALL update every 10 seconds with fresh data from Backend_API
8. WHEN network traffic exceeds 1024 KB/s, THE Traffic Speed Activity_Card SHALL display value in MB/s
9. WHEN total traffic exceeds 1024 GB, THE Total Traffic Activity_Card SHALL display value in TB
10. THE Activity_Card SHALL use consistent icon sizing and spacing matching the Dark_Theme aesthetic

### Requirement 6: Real-Time Backend Integration

**User Story:** As an administrator, I want all dashboard metrics to reflect actual system state, so that I can make informed operational decisions.

#### Acceptance Criteria

1. THE Dashboard SHALL fetch system monitoring data from the Backend_API endpoint '/api/admin/system/stats'
2. THE Dashboard SHALL fetch Xray status from the Backend_API endpoint '/api/admin/system/xray'
3. THE Dashboard SHALL fetch server resource data from the Backend_API endpoint '/api/admin/system/health'
4. WHEN Backend_API is unavailable, THE Dashboard SHALL display "Data unavailable" message for affected metrics
5. THE Dashboard SHALL implement automatic retry with exponential backoff (1s, 2s, 4s) when API calls fail
6. WHEN Real_Time_Data is successfully fetched, THE Dashboard SHALL update all affected components within 100ms
7. THE Dashboard SHALL log all API errors to browser console for debugging
8. WHEN multiple API calls are needed, THE Dashboard SHALL execute them in parallel for optimal performance

### Requirement 7: Xray Management Pages Structure

**User Story:** As an administrator, I want dedicated pages for Xray inbounds, clients, nodes, and routing, so that I can manage proxy configurations efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide an Inbounds page at '/admin/xray/inbounds' displaying all Xray inbound configurations
2. THE Admin_Panel SHALL provide a Clients page at '/admin/xray/clients' displaying all Xray client configurations
3. THE Admin_Panel SHALL provide a Nodes page at '/admin/xray/nodes' displaying all server nodes
4. THE Admin_Panel SHALL provide a Routing page at '/admin/xray/routing' displaying routing rules
5. THE Inbounds page SHALL integrate with Backend_API endpoint '/api/admin/xray/inbounds'
6. THE Clients page SHALL integrate with Backend_API endpoint '/api/admin/xray/clients'
7. THE Nodes page SHALL integrate with Backend_API endpoint '/api/admin/xray/nodes'
8. WHEN navigating to any Xray management page, THE Sidebar SHALL keep the "Xray Management" / "Управление Xray" submenu expanded
9. WHEN navigating to any Xray management page, THE Sidebar SHALL highlight the specific submenu item
10. THE Xray management pages SHALL maintain consistent table layouts and action buttons across all views

### Requirement 8: Responsive Layout Adaptation

**User Story:** As an administrator, I want the new UI to work seamlessly on all device sizes, so that I can manage the system from any device.

#### Acceptance Criteria

1. WHEN viewed on mobile devices (width < 768px), THE Sidebar SHALL collapse and be accessible via hamburger menu
2. WHEN viewed on mobile devices, THE Circular_Progress_Charts SHALL display in a 2x2 grid
3. WHEN viewed on tablet devices (width 768px-1024px), THE Circular_Progress_Charts SHALL display in a 2x2 grid
4. WHEN viewed on desktop devices (width > 1024px), THE Circular_Progress_Charts SHALL display in a 1x4 row
5. WHEN viewed on mobile devices, THE Activity_Cards SHALL stack vertically
6. WHEN viewed on desktop devices, THE Activity_Cards SHALL display in a horizontal grid
7. THE Admin_Panel SHALL maintain touch-friendly tap targets (minimum 44x44px) on mobile devices
8. WHEN the viewport is resized, THE Responsive_Layout SHALL smoothly transition without content jumps

### Requirement 9: Tailwind CSS Styling Implementation

**User Story:** As a developer, I want all new UI components styled with Tailwind CSS, so that the design system remains consistent and maintainable.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use Tailwind CSS utility classes for all Dark_Theme styling
2. THE Admin_Panel SHALL define custom color values in tailwind.config.ts for the premium dark palette
3. THE Admin_Panel SHALL use Tailwind's responsive breakpoints (sm:, md:, lg:, xl:) for Responsive_Layout
4. THE Admin_Panel SHALL leverage Tailwind's transition utilities for smooth animations
5. WHEN custom components are needed, THE Admin_Panel SHALL extend existing shadcn/ui components
6. THE Admin_Panel SHALL avoid inline styles except for dynamic values (progress percentages, colors based on thresholds)
7. THE Admin_Panel SHALL use Tailwind's group and peer utilities for interactive hover states

### Requirement 10: Dashboard Layout Restructuring

**User Story:** As an administrator, I want a well-organized dashboard that prioritizes monitoring information, so that I can assess system health immediately upon login.

#### Acceptance Criteria

1. THE Dashboard SHALL arrange content in three distinct sections: System Monitors, Activity Cards, and Recent Activity
2. THE System_Monitor section SHALL occupy the full width at the top of the Dashboard
3. THE Activity Cards section SHALL appear below System_Monitor in a responsive grid
4. THE Recent Activity section SHALL appear at the bottom showing audit logs
5. WHEN viewed on desktop, THE Dashboard SHALL display all sections with appropriate spacing (24px gaps)
6. WHEN viewed on mobile, THE Dashboard SHALL use condensed spacing (12px gaps) to maximize content visibility
7. THE Dashboard page header SHALL display localized title ("Dashboard" in English / "Панель управления" in Russian)
8. THE Dashboard SHALL use consistent card styling matching the Dark_Theme throughout all sections

### Requirement 11: Component Reusability and Modularity

**User Story:** As a developer, I want reusable components for circular charts and activity cards, so that I can maintain code quality and consistency.

#### Acceptance Criteria

1. THE Admin_Panel SHALL implement a CircularProgressChart component accepting value, max, label, and color props
2. THE Admin_Panel SHALL implement an ActivityCard component accepting title, value, status, and icon props
3. THE CircularProgressChart component SHALL be reusable for CPU, RAM, Disk, and Swap monitoring
4. THE ActivityCard component SHALL be reusable for Xray Status, Uptime, and Traffic displays
5. WHEN prop values change, THE components SHALL re-render efficiently without unnecessary DOM updates
6. THE components SHALL be TypeScript-typed with proper interfaces for type safety
7. THE components SHALL include JSDoc comments documenting props and usage examples

### Requirement 12: Browser Compatibility and Performance

**User Story:** As an administrator, I want the new UI to load quickly and work across modern browsers, so that I have a smooth experience regardless of my browser choice.

#### Acceptance Criteria

1. THE Admin_Panel SHALL load the Dashboard within 2 seconds on a standard broadband connection
2. THE Admin_Panel SHALL support Chrome, Firefox, Safari, and Edge (latest 2 versions)
3. WHEN Real_Time_Data updates occur, THE Admin_Panel SHALL not block user interactions
4. THE Admin_Panel SHALL use React Server Components for initial page load optimization
5. THE Admin_Panel SHALL lazy-load heavy monitoring components below the fold
6. THE Circular_Progress_Charts SHALL use CSS transforms and will-change for GPU-accelerated animations
7. WHEN multiple API calls execute, THE Admin_Panel SHALL implement request deduplication to avoid redundant calls
8. THE Admin_Panel SHALL achieve a Lighthouse performance score of 85+ for the Dashboard page
