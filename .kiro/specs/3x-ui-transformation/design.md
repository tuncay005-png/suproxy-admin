# Design Document: 3X-UI Style Transformation

## Overview

The 3X-UI Style Transformation feature transforms the Suproxy Admin panel from a basic CRUD interface into a modern, premium dark-themed admin dashboard inspired by 3X-UI. This design document outlines the technical architecture, component design, data flow, and implementation strategies for creating a professional, visually appealing interface with comprehensive internationalization (English/Russian), real-time monitoring, and enhanced Xray management capabilities.

### Design Goals

1. **Modern Premium Aesthetics**: Implement a sophisticated dark theme with coal-black backgrounds and refined color palette
2. **Bilingual Support**: Provide seamless English/Russian language switching with persistent user preferences
3. **Real-Time Monitoring**: Display live system metrics through circular progress charts and activity cards
4. **Enhanced Navigation**: Restructure sidebar with hierarchical menu items and Xray management submenu
5. **Component Reusability**: Build modular, type-safe React components for charts and cards
6. **Performance Optimization**: Achieve <2s initial load time and smooth 60fps animations
7. **Maintainability**: Follow Next.js 15 App Router best practices and TypeScript strict mode

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19, shadcn/ui components
- **Styling**: Tailwind CSS 4 with custom dark theme tokens
- **Internationalization**: Custom i18n implementation with React Context
- **State Management**: React Server Components with client-side hydration
- **API Client**: Custom fetch-based client with token refresh
- **Charts**: Custom SVG-based circular progress components
- **Type Safety**: TypeScript 5+ with strict mode

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │  Language        │  │  Theme           │  │  Real-time │ │
│  │  Context         │  │  System          │  │  Polling   │ │
│  │  (localStorage)  │  │  (Tailwind)      │  │  Manager   │ │
│  └──────────────────┘  └──────────────────┘  └───────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Page Components (RSC + Client)              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Dashboard  │  Users  │  Xray Mgmt  │  Monitoring     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                  │
│  ┌────────────────────────┼────────────────────────────────┐ │
│  │         Reusable UI Components (Client)                 │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  CircularProgressChart  │  ActivityCard  │  Sidebar    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┼──────────────────────────────────────┘
                       │ API Calls (fetch)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server (RSC)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Route Handlers                         │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  /api/admin/system/*  │  /api/admin/xray/*            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                  │
│                            │ Forward to Backend              │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Backend Proxy Layer                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Backend API                         │
│              (Python/FastAPI Service)                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Component Hierarchy

```
app/
└── admin/
    └── layout.tsx (Client Component)
        ├── AdminSidebar (Client Component with i18n)
        │   ├── LanguageSelector
        │   ├── SidebarNavItem
        │   └── XraySubmenu (expandable)
        ├── AdminHeader (Client Component)
        └── children (Page Components)

pages/
├── dashboard/ (Server Component)
│   ├── CircularProgressChart × 4 (Client Component)
│   ├── ActivityCard × 3 (Client Component)
│   └── ActivityFeed (Server Component)
├── xray/
│   ├── inbounds/
│   ├── clients/
│   ├── nodes/
│   └── routing/
└── monitoring/ (Server Component with real-time updates)
```

### Data Flow Architecture

#### Real-Time Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Page (RSC)                      │
│                  Initial Data Fetch (SSR)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ Server-side fetch
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API: /api/admin/system/stats                    │
│              API: /api/admin/system/health                   │
│              API: /api/admin/system/xray                     │
└────────────────────────┬────────────────────────────────────┘
                         │ Initial props
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Client Components Hydrate with Data                │
│       ┌──────────────────────────────────────────┐          │
│       │  useRealTimePolling Hook                 │          │
│       │  - Polls every 5s (charts)               │          │
│       │  - Polls every 10s (activity cards)      │          │
│       │  - Exponential backoff on errors         │          │
│       └──────────────────────────────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │ Periodic updates
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              State Updates via React setState                │
│       CircularProgressChart animates (CSS transition)        │
│       ActivityCard updates values                            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. CircularProgressChart Component

#### Purpose
Displays system resource usage (CPU, RAM, Disk, Swap) as animated circular SVG charts with color-coded thresholds.

#### Interface Definition

```typescript
/**
 * CircularProgressChart Component
 * 
 * Displays a circular progress indicator with dynamic coloring based on value thresholds.
 * Uses SVG for rendering and CSS transitions for smooth animations.
 * 
 * @example
 * <CircularProgressChart
 *   value={75}
 *   max={100}
 *   label="CPU"
 *   unit="%"
 *   size={120}
 * />
 */

interface CircularProgressChartProps {
  /** Current value to display */
  value: number;
  /** Maximum value for percentage calculation */
  max: number;
  /** Label text displayed below the chart */
  label: string;
  /** Unit suffix (%, MB, GB) */
  unit: string;
  /** Chart diameter in pixels (default: 120) */
  size?: number;
  /** Stroke width in pixels (default: 8) */
  strokeWidth?: number;
  /** Override automatic color selection */
  color?: 'green' | 'yellow' | 'red';
  /** CSS class for additional styling */
  className?: string;
  /** Accessible description for screen readers */
  ariaLabel?: string;
}

interface CircularProgressChartState {
  /** Current percentage (0-100) */
  percentage: number;
  /** Current color based on threshold */
  displayColor: string;
  /** Animation state */
  isAnimating: boolean;
}
```

#### Implementation Details

**Color Thresholds:**
- Green (#22c55e): 0-69%
- Yellow (#eab308): 70-89%
- Red (#ef4444): 90-100%

**SVG Structure:**
```typescript
// Circular chart uses two SVG circles:
// 1. Background circle (gray stroke)
// 2. Progress circle (colored stroke with stroke-dasharray)

const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (percentage / 100) * circumference;
```

**Animation Strategy:**
- CSS `transition: stroke-dashoffset 300ms ease-out`
- React state update triggers re-render
- `useEffect` monitors value changes to recalculate percentage

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` describing the metric

#### File Location
`components/admin/dashboard/circular-progress-chart.tsx`

---

### 2. ActivityCard Component

#### Purpose
Displays real-time system information (Xray status, uptime, traffic) in a compact card format with icons and status indicators.

#### Interface Definition

```typescript
/**
 * ActivityCard Component
 * 
 * Displays a metric with an icon, title, value, and optional status indicator.
 * Used for Xray status, system uptime, and network traffic displays.
 * 
 * @example
 * <ActivityCard
 *   icon={Activity}
 *   title={t('dashboard.xray_status')}
 *   value="Running"
 *   status="success"
 *   statusDot={true}
 * />
 */

interface ActivityCardProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Translated card title */
  title: string;
  /** Primary display value */
  value: string | number;
  /** Secondary descriptive text */
  description?: string;
  /** Status variant for coloring */
  status?: 'success' | 'warning' | 'error' | 'neutral';
  /** Show status dot indicator */
  statusDot?: boolean;
  /** CSS class for additional styling */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
}
```

#### Status Indicators

| Status  | Dot Color | Use Case              |
|---------|-----------|------------------------|
| success | Green     | Xray running, healthy  |
| warning | Yellow    | Degraded performance   |
| error   | Red       | Xray stopped, errors   |
| neutral | Gray      | Uptime, traffic stats  |

#### Implementation Details

**Layout Structure:**
```tsx
<Card className="relative overflow-hidden">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      {/* Icon with status dot */}
      <div className="relative">
        <Icon className="h-5 w-5" />
        {statusDot && <StatusDot status={status} />}
      </div>
      
      {/* Text content */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  </CardContent>
</Card>
```

**Value Formatting:**
- Traffic Speed: Auto-convert KB/s ↔ MB/s at 1024 threshold
- Traffic Volume: Auto-convert GB ↔ TB at 1024 threshold
- Uptime: Format as "Xd Xh Xm" pattern

#### File Location
`components/admin/dashboard/activity-card.tsx`

---

### 3. LanguageSelector Component

#### Purpose
Provides a dropdown menu for switching between English and Russian languages, persisting the choice in localStorage.

#### Interface Definition

```typescript
/**
 * LanguageSelector Component
 * 
 * Dropdown menu for language selection with localStorage persistence.
 * Integrates with the i18n context to trigger language changes.
 * 
 * @example
 * <LanguageSelector />
 */

interface LanguageSelectorProps {
  /** CSS class for additional styling */
  className?: string;
}

type Locale = 'en' | 'ru';

interface LanguageOption {
  code: Locale;
  label: string;
  flag: string; // Emoji flag
}

const languages: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];
```

#### Implementation Details

**Storage Strategy:**
```typescript
// On language change:
localStorage.setItem('preferred_locale', locale);
i18n.changeLanguage(locale);

// On component mount:
const storedLocale = localStorage.getItem('preferred_locale') || 'en';
i18n.changeLanguage(storedLocale);
```

**UI Component:**
- Uses shadcn/ui `<DropdownMenu>` component
- Displays current language with flag emoji
- Checkmark indicator for selected language
- Updates immediately without page reload

#### File Location
`components/admin/layout/language-selector.tsx`

---

### 4. AdminSidebar Component (Enhanced)

#### Purpose
Primary navigation component with hierarchical menu structure, Xray management submenu, and bilingual support.

#### Interface Definition

```typescript
/**
 * AdminSidebar Component
 * 
 * Enhanced sidebar navigation with expandable submenus, i18n support,
 * and active route highlighting.
 * 
 * @example
 * <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
 */

interface AdminSidebarProps {
  /** Mobile sidebar visibility state */
  isOpen: boolean;
  /** Callback to close mobile sidebar */
  onClose: () => void;
}

interface NavItem {
  /** Translation key for item label */
  labelKey: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Navigation path */
  href?: string;
  /** Child items for submenu */
  children?: NavItem[];
  /** Badge text (e.g., "New") */
  badge?: string;
}

interface SidebarState {
  /** Currently expanded submenu paths */
  expandedItems: Set<string>;
  /** Current active route */
  activeRoute: string;
}
```

#### Navigation Structure

```typescript
const navigationItems: NavItem[] = [
  {
    labelKey: 'nav.dashboard',
    icon: BarChart3,
    href: '/admin',
  },
  {
    labelKey: 'nav.users',
    icon: Users,
    href: '/admin/users',
  },
  {
    labelKey: 'nav.sessions',
    icon: FileText,
    href: '/admin/sessions',
  },
  {
    labelKey: 'nav.xray_management',
    icon: Rocket,
    children: [
      {
        labelKey: 'nav.xray.inbounds',
        icon: Download,
        href: '/admin/xray/inbounds',
      },
      {
        labelKey: 'nav.xray.clients',
        icon: Key,
        href: '/admin/xray/clients',
      },
      {
        labelKey: 'nav.xray.nodes',
        icon: Settings,
        href: '/admin/xray/nodes',
      },
      {
        labelKey: 'nav.xray.routing',
        icon: Map,
        href: '/admin/xray/routing',
      },
    ],
  },
  {
    labelKey: 'nav.plans',
    icon: Package,
    href: '/admin/plans',
  },
  {
    labelKey: 'nav.logs',
    icon: FileText,
    href: '/admin/logs',
  },
  {
    labelKey: 'nav.monitoring',
    icon: Monitor,
    href: '/admin/monitoring',
  },
];
```

#### Implementation Details

**Submenu Expansion Logic:**
```typescript
// Auto-expand parent when child route is active
useEffect(() => {
  const currentPath = pathname;
  const parentItem = navigationItems.find(item => 
    item.children?.some(child => currentPath.startsWith(child.href))
  );
  if (parentItem) {
    setExpandedItems(prev => new Set([...prev, parentItem.labelKey]));
  }
}, [pathname]);
```

**Active Highlighting:**
```typescript
const isActive = (href: string) => {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
};
```

**Responsive Behavior:**
- Desktop (≥768px): Fixed sidebar, always visible
- Mobile (<768px): Overlay sidebar, hamburger menu toggle
- Touch-friendly tap targets (44×44px minimum)

#### File Location
`components/admin/layout/admin-sidebar.tsx`

---

### 5. useRealTimePolling Hook

#### Purpose
Custom React hook for managing periodic API polling with error handling, exponential backoff, and automatic cleanup.

#### Interface Definition

```typescript
/**
 * useRealTimePolling Hook
 * 
 * Manages periodic data fetching with configurable intervals, error handling,
 * and automatic cleanup on unmount.
 * 
 * @example
 * const { data, error, isLoading } = useRealTimePolling(
 *   () => systemApi.getStats(),
 *   5000,
 *   { enableBackoff: true }
 * );
 */

interface UseRealTimePollingOptions {
  /** Enable exponential backoff on errors (default: true) */
  enableBackoff?: boolean;
  /** Maximum backoff delay in ms (default: 60000) */
  maxBackoff?: number;
  /** Pause polling when tab is not visible (default: true) */
  pauseOnInactive?: boolean;
  /** Initial data to display before first fetch */
  initialData?: any;
}

interface UseRealTimePollingReturn<T> {
  /** Current data state */
  data: T | null;
  /** Current error state */
  error: Error | null;
  /** Loading state (true during first fetch) */
  isLoading: boolean;
  /** Fetching state (true during any fetch) */
  isFetching: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Last successful fetch timestamp */
  lastUpdated: Date | null;
}

function useRealTimePolling<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  intervalMs: number,
  options?: UseRealTimePollingOptions
): UseRealTimePollingReturn<T>;
```

#### Implementation Details

**Exponential Backoff Strategy:**
```typescript
let backoffDelay = intervalMs;
let failureCount = 0;

const calculateBackoff = () => {
  if (!options.enableBackoff) return intervalMs;
  
  failureCount++;
  backoffDelay = Math.min(
    intervalMs * Math.pow(2, failureCount - 1),
    options.maxBackoff || 60000
  );
  return backoffDelay;
};

// Reset on successful fetch
const resetBackoff = () => {
  failureCount = 0;
  backoffDelay = intervalMs;
};
```

**Page Visibility API Integration:**
```typescript
useEffect(() => {
  if (!options.pauseOnInactive) return;
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(intervalRef.current);
    } else {
      startPolling();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Error Handling:**
- Log errors to console
- Preserve last known good data
- Increase polling interval on consecutive failures
- Reset backoff on first successful fetch after errors

#### File Location
`lib/hooks/use-real-time-polling.ts`

## Data Models

### System Statistics Model

```typescript
/**
 * System-wide statistics for dashboard display
 */
interface SystemStats {
  /** Total number of registered users */
  total_users: number;
  /** Number of users active in last 30 days */
  active_users: number;
  /** Total Xray instances configured */
  total_xray_instances: number;
  /** Currently running Xray instances */
  active_xray_instances: number;
  /** Number of audit log entries in last 24 hours */
  recent_audit_actions: number;
}
```

### System Health Model

```typescript
/**
 * Real-time system resource usage metrics
 */
interface SystemHealth {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** CPU usage percentage (0-100) */
  cpu_usage: number;
  /** RAM usage in MB */
  ram_used: number;
  /** Total RAM in MB */
  ram_total: number;
  /** Disk usage in GB */
  disk_used: number;
  /** Total disk space in GB */
  disk_total: number;
  /** Swap memory used in MB */
  swap_used: number;
  /** Total swap memory in MB */
  swap_total: number;
  /** System uptime in seconds */
  uptime: number;
  /** Database connection status */
  database: 'connected' | 'disconnected' | 'slow';
  /** Timestamp of health check */
  timestamp: string;
}
```

### Xray Status Model

```typescript
/**
 * Xray system operational status
 */
interface XrayStatus {
  /** Xray service status */
  status: 'running' | 'stopped' | 'restarting' | 'error';
  /** Xray version string */
  version: string;
  /** Current network throughput in bytes/second */
  traffic_speed: number;
  /** Total accumulated traffic in bytes */
  traffic_total: number;
  /** Number of active connections */
  active_connections: number;
  /** Xray uptime in seconds */
  uptime: number;
  /** Last restart timestamp */
  last_restart: string | null;
}
```

### Translation Model

```typescript
/**
 * Translation dictionary structure
 */
interface Translations {
  nav: {
    dashboard: string;
    users: string;
    sessions: string;
    xray_management: string;
    xray: {
      inbounds: string;
      clients: string;
      nodes: string;
      routing: string;
    };
    plans: string;
    logs: string;
    monitoring: string;
  };
  dashboard: {
    title: string;
    description: string;
    total_users: string;
    active_users: string;
    xray_instances: string;
    active_instances: string;
    servers: string;
    online_servers: string;
    plans: string;
    active_plans: string;
    recent_actions: string;
    xray_status: string;
    running: string;
    stopped: string;
    system_uptime: string;
    traffic_speed: string;
    total_traffic: string;
    data_unavailable: string;
    loading: string;
  };
  monitoring: {
    cpu_usage: string;
    ram_usage: string;
    disk_usage: string;
    swap_usage: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
  };
}
```

## Internationalization (i18n) Implementation

### Architecture Overview

Instead of using next-i18next (which is not recommended for App Router as per [official Next.js guidance](https://nextjs.org/docs/15/app/guides/internationalization)), we'll implement a lightweight custom i18n solution using React Context and localStorage persistence.

### Implementation Strategy

#### 1. I18n Context Provider

```typescript
/**
 * lib/i18n/context.tsx
 * 
 * React Context for managing locale state and translations
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'ru';

interface I18nContextValue {
  locale: Locale;
  translations: Translations;
  changeLanguage: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Translations>(enTranslations);

  useEffect(() => {
    // Load persisted locale from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred_locale') as Locale | null;
      if (stored && (stored === 'en' || stored === 'ru')) {
        setLocale(stored);
        loadTranslations(stored);
      }
    }
  }, []);

  const loadTranslations = async (newLocale: Locale) => {
    const translations = await import(`./locales/${newLocale}.json`);
    setTranslations(translations.default);
  };

  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('preferred_locale', newLocale);
    loadTranslations(newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, translations, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }
  return context;
}
```

#### 2. Translation Files Structure

```
lib/i18n/
├── context.tsx          # I18n provider and hooks
├── locales/
│   ├── en.json         # English translations
│   └── ru.json         # Russian translations
└── types.ts            # TypeScript interfaces
```

**English Translation File** (`lib/i18n/locales/en.json`):
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "users": "Users",
    "sessions": "Sessions",
    "xray_management": "Xray Management",
    "xray": {
      "inbounds": "Inbounds",
      "clients": "Clients",
      "nodes": "Nodes",
      "routing": "Routing"
    },
    "plans": "Plans",
    "logs": "Logs",
    "monitoring": "Monitoring"
  },
  "dashboard": {
    "title": "Dashboard",
    "description": "Welcome to the admin dashboard",
    "total_users": "Total Users",
    "active_users": "active",
    "xray_instances": "Xray Instances",
    "servers": "Servers",
    "plans": "Plans",
    "recent_actions": "Recent Actions",
    "xray_status": "Xray Status",
    "running": "Running",
    "stopped": "Stopped",
    "system_uptime": "System Uptime",
    "traffic_speed": "Traffic Speed",
    "total_traffic": "Total Traffic",
    "data_unavailable": "Data unavailable",
    "loading": "Loading..."
  }
}
```

**Russian Translation File** (`lib/i18n/locales/ru.json`):
```json
{
  "nav": {
    "dashboard": "Панель управления",
    "users": "Пользователи",
    "sessions": "Сессии",
    "xray_management": "Управление Xray",
    "xray": {
      "inbounds": "Входящие",
      "clients": "Клиенты",
      "nodes": "Узлы",
      "routing": "Маршрутизация"
    },
    "plans": "Тарифы",
    "logs": "Логи",
    "monitoring": "Мониторинг"
  },
  "dashboard": {
    "title": "Панель управления",
    "description": "Добро пожаловать в административную панель",
    "total_users": "Всего пользователей",
    "active_users": "активных",
    "xray_instances": "Экземпляры Xray",
    "servers": "Серверы",
    "plans": "Тарифы",
    "recent_actions": "Последние действия",
    "xray_status": "Статус Xray",
    "running": "Работает",
    "stopped": "Остановлен",
    "system_uptime": "Время работы",
    "traffic_speed": "Скорость трафика",
    "total_traffic": "Общий трафик",
    "data_unavailable": "Данные недоступны",
    "loading": "Загрузка..."
  }
}
```

#### 3. Integration with Admin Layout

```typescript
// app/admin/layout.tsx
'use client';

import { I18nProvider } from '@/lib/i18n/context';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
```

#### 4. Usage in Components

```typescript
// components/admin/layout/admin-sidebar.tsx
'use client';

import { useTranslations } from '@/lib/i18n/context';

export function AdminSidebar() {
  const { t } = useTranslations();
  
  return (
    <nav>
      <Link href="/admin">
        <BarChart3 />
        {t('nav.dashboard')}
      </Link>
      <Link href="/admin/users">
        <Users />
        {t('nav.users')}
      </Link>
      {/* ... */}
    </nav>
  );
}
```

### Character Encoding Fix

**Problem**: Display of garbled characters like "â€"" instead of proper em-dash or zero.

**Root Cause**: Incorrect UTF-8 encoding handling when displaying numeric data or special characters.

**Solution**:

1. **Ensure UTF-8 Response Headers**:
```typescript
// app/api/admin/system/stats/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
```

2. **Validate Data Before Rendering**:
```typescript
// components/admin/dashboard/stat-card.tsx
function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') {
    // Remove problematic characters
    return value.replace(/[^\x20-\x7E]/g, '');
  }
  return String(value);
}
```

3. **Use Proper Fallbacks**:
```typescript
const displayValue = stats?.data?.total_users ?? 0; // Use 0, not "—"
```

## Dark Theme System

### Tailwind CSS Configuration

#### Custom Color Palette

We'll extend the existing `globals.css` with premium dark theme tokens:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Existing light mode tokens */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(9% 0 0);
  /* ... */
}

.dark {
  /* Premium Dark Theme - Coal Black Backgrounds */
  --color-background: oklch(10% 0 0);          /* #121212 equivalent - main background */
  --color-foreground: oklch(95% 0 0);           /* #e4e4e7 - soft white text */
  
  /* Card backgrounds - slightly lighter for contrast */
  --color-card: oklch(13% 0 0);                 /* #1a1a1a equivalent */
  --color-card-foreground: oklch(95% 0 0);
  
  /* Popover and dropdown backgrounds */
  --color-popover: oklch(11% 0 0);              /* #141414 equivalent */
  --color-popover-foreground: oklch(95% 0 0);
  
  /* Primary accent - keep existing */
  --color-primary: oklch(63% 0.25 265);
  --color-primary-foreground: oklch(98% 0 0);
  
  /* Secondary backgrounds */
  --color-secondary: oklch(15% 0 0);            /* #1f1f1f equivalent */
  --color-secondary-foreground: oklch(95% 0 0);
  
  /* Muted text and backgrounds */
  --color-muted: oklch(15% 0 0);
  --color-muted-foreground: oklch(65% 0 0);     /* #a1a1aa - light gray */
  
  /* Accent backgrounds for hover states */
  --color-accent: oklch(17% 0 0);               /* Slightly lighter on hover */
  --color-accent-foreground: oklch(95% 0 0);
  
  /* Borders - subtle gray */
  --color-border: oklch(17% 0 0);               /* #2a2a2a equivalent */
  --color-input: oklch(17% 0 0);
  
  /* Chart colors */
  --color-chart-green: oklch(65% 0.16 145);     /* #22c55e equivalent */
  --color-chart-yellow: oklch(75% 0.13 85);     /* #eab308 equivalent */
  --color-chart-red: oklch(60% 0.18 25);        /* #ef4444 equivalent */
  
  /* Ring focus color */
  --color-ring: oklch(63% 0.25 265);
}
```

#### Component-Level Styling Patterns

**Sidebar Styling:**
```css
/* Dark background with subtle border */
.sidebar {
  @apply bg-card border-r border-border;
}

/* Nav item hover state - lighten by ~10% */
.nav-item {
  @apply text-muted-foreground hover:text-foreground hover:bg-accent transition-colors;
}

/* Active nav item */
.nav-item-active {
  @apply bg-accent text-foreground;
}
```

**Card Styling:**
```css
/* Premium card with subtle border */
.premium-card {
  @apply bg-card border border-border rounded-lg shadow-sm;
}

/* Card hover state */
.premium-card-hover {
  @apply hover:border-accent hover:shadow-md transition-all duration-200;
}
```

**Circular Chart Container:**
```css
.chart-container {
  @apply bg-card border border-border rounded-lg p-4;
  @apply flex flex-col items-center justify-center;
}
```

### Accessibility Considerations

**WCAG AA Contrast Ratios** (Requirement 2.7):

| Element Combination | Contrast Ratio | Status |
|---------------------|----------------|--------|
| Foreground (#e4e4e7) on Background (#121212) | 13.5:1 | ✅ Pass AAA |
| Muted text (#a1a1aa) on Background (#121212) | 6.8:1 | ✅ Pass AA |
| Border (#2a2a2a) on Background (#121212) | 1.9:1 | ⚠️ Decorative only |
| Green (#22c55e) on Card (#1a1a1a) | 5.2:1 | ✅ Pass AA |
| Yellow (#eab308) on Card (#1a1a1a) | 7.1:1 | ✅ Pass AA |
| Red (#ef4444) on Card (#1a1a1a) | 4.8:1 | ✅ Pass AA |

## Dashboard Layout Restructuring

### Layout Specification

#### Three-Section Layout

```typescript
/**
 * Dashboard Page Layout
 * 
 * Structured as three distinct sections:
 * 1. System Monitors (Circular Progress Charts)
 * 2. Activity Cards (Xray Status, Uptime, Traffic)
 * 3. Recent Activity Feed (Audit Logs)
 */

// app/admin/page.tsx
export default async function DashboardPage() {
  const { stats, health, xrayStatus, auditLogs } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader heading={t('dashboard.title')} description={t('dashboard.description')} />

      {/* Section 1: System Monitors - Full Width, 4-column grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="System Monitors">
        <CircularProgressChart
          value={health.cpu_usage}
          max={100}
          label={t('monitoring.cpu_usage')}
          unit="%"
        />
        <CircularProgressChart
          value={health.ram_used}
          max={health.ram_total}
          label={t('monitoring.ram_usage')}
          unit="MB"
        />
        <CircularProgressChart
          value={health.disk_used}
          max={health.disk_total}
          label={t('monitoring.disk_usage')}
          unit="GB"
        />
        <CircularProgressChart
          value={health.swap_used}
          max={health.swap_total}
          label={t('monitoring.swap_usage')}
          unit="MB"
        />
      </section>

      {/* Section 2: Activity Cards - 3-column grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Activity Status">
        <ActivityCard
          icon={Activity}
          title={t('dashboard.xray_status')}
          value={xrayStatus.status === 'running' ? t('dashboard.running') : t('dashboard.stopped')}
          status={xrayStatus.status === 'running' ? 'success' : 'error'}
          statusDot={true}
        />
        <ActivityCard
          icon={Clock}
          title={t('dashboard.system_uptime')}
          value={formatUptime(health.uptime)}
          status="neutral"
        />
        <ActivityCard
          icon={TrendingUp}
          title={t('dashboard.traffic_speed')}
          value={formatTrafficSpeed(xrayStatus.traffic_speed)}
          description={`${formatTrafficVolume(xrayStatus.traffic_total)} total`}
          status="neutral"
        />
      </section>

      {/* Section 3: Recent Activity - 2-column layout */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" aria-label="Activity and Actions">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed auditLogs={auditLogs} />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

### Responsive Breakpoints

| Breakpoint | Width | System Monitors | Activity Cards | Recent Activity |
|------------|-------|-----------------|----------------|-----------------|
| Mobile     | <640px | 1 column | 1 column | 1 column |
| Tablet     | 640-1024px | 2 columns | 1 column | 1 column |
| Desktop    | ≥1024px | 4 columns | 3 columns | 4:3 split |

### Spacing Strategy

```css
/* Desktop spacing (≥1024px) */
.dashboard-container {
  @apply space-y-6; /* 24px vertical gap */
}

.section-grid {
  @apply gap-4; /* 16px grid gap */
}

/* Mobile spacing (<768px) */
@media (max-width: 767px) {
  .dashboard-container {
    @apply space-y-3; /* 12px vertical gap */
  }
  
  .section-grid {
    @apply gap-3; /* 12px grid gap */
  }
}
```

## Real-Time Data Flow

### API Integration Architecture

#### Backend API Endpoints

The admin panel communicates with the following backend endpoints:

1. **System Statistics**: `GET /api/admin/system/stats`
   - Returns: `SystemStats` model
   - Used by: Dashboard stat cards

2. **System Health**: `GET /api/admin/system/health`
   - Returns: `SystemHealth` model
   - Used by: Circular progress charts

3. **Xray Status**: `GET /api/admin/system/xray`
   - Returns: `XrayStatus` model
   - Used by: Activity cards

4. **Audit Logs**: `GET /api/admin/logs?limit=10`
   - Returns: `AuditLog[]` model
   - Used by: Recent activity feed

#### Polling Strategy

**Chart Updates (5-second interval)**:
```typescript
// components/admin/dashboard/system-monitors.tsx
'use client';

export function SystemMonitors({ initialHealth }: { initialHealth: SystemHealth }) {
  const { data, error, isLoading } = useRealTimePolling(
    () => systemApi.getHealth(),
    5000, // 5 seconds
    { initialData: initialHealth, enableBackoff: true }
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CircularProgressChart
        value={data?.cpu_usage ?? 0}
        max={100}
        label="CPU"
        unit="%"
      />
      {/* ... other charts */}
    </div>
  );
}
```

**Activity Card Updates (10-second interval)**:
```typescript
// components/admin/dashboard/activity-section.tsx
'use client';

export function ActivitySection({ initialXrayStatus }: { initialXrayStatus: XrayStatus }) {
  const { data, error } = useRealTimePolling(
    () => systemApi.getXraySystemStatus(),
    10000, // 10 seconds
    { initialData: initialXrayStatus }
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ActivityCard
        icon={Activity}
        title="Xray Status"
        value={data?.status === 'running' ? 'Running' : 'Stopped'}
        status={data?.status === 'running' ? 'success' : 'error'}
        statusDot={true}
      />
      {/* ... other activity cards */}
    </div>
  );
}
```

### Error Handling and Retry Logic

#### Exponential Backoff Implementation

```typescript
// lib/hooks/use-real-time-polling.ts

class PollingManager {
  private intervalMs: number;
  private currentDelay: number;
  private failureCount: number = 0;
  private maxBackoff: number = 60000; // 1 minute max

  constructor(intervalMs: number) {
    this.intervalMs = intervalMs;
    this.currentDelay = intervalMs;
  }

  calculateNextDelay(): number {
    if (this.failureCount === 0) {
      return this.intervalMs;
    }

    // Exponential backoff: interval × 2^(failures-1)
    // e.g., 5s → 5s → 10s → 20s → 40s → 60s (capped)
    this.currentDelay = Math.min(
      this.intervalMs * Math.pow(2, this.failureCount - 1),
      this.maxBackoff
    );

    return this.currentDelay;
  }

  recordFailure(): void {
    this.failureCount++;
    console.warn(`[Polling] Failure ${this.failureCount}, next delay: ${this.calculateNextDelay()}ms`);
  }

  recordSuccess(): void {
    if (this.failureCount > 0) {
      console.log('[Polling] Recovered from failures, resetting backoff');
    }
    this.failureCount = 0;
    this.currentDelay = this.intervalMs;
  }
}
```

#### Error State Handling

```typescript
// components/admin/dashboard/circular-progress-chart.tsx

export function CircularProgressChart({ value, max, label }: Props) {
  const { data, error, lastUpdated } = useRealTimePolling(...);

  if (error) {
    return (
      <div className="chart-container">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground mt-2">
          {t('common.error')}
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last update: {formatDistanceToNow(lastUpdated)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Normal chart rendering */}
    </div>
  );
}
```

### Request Deduplication

To prevent redundant API calls when multiple components poll the same endpoint:

```typescript
// lib/api/request-cache.ts

class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private ttl: number = 1000; // 1 second cache

  async fetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const promise = fetchFn();
    this.cache.set(key, promise);

    // Clear cache after TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, this.ttl);

    return promise;
  }
}

export const requestCache = new RequestCache();

// Usage in systemApi
export const systemApi = {
  getHealth: () => requestCache.fetch(
    'system:health',
    () => apiClient.get<ApiResponse<SystemHealth>>('/api/admin/system/health')
  ),
};
```

## Xray Management Pages

### Route Structure

```
app/admin/xray/
├── inbounds/
│   ├── page.tsx          # List all inbounds
│   ├── [id]/
│   │   ├── page.tsx      # View inbound details
│   │   └── edit/
│   │       └── page.tsx  # Edit inbound
│   └── new/
│       └── page.tsx      # Create new inbound
├── clients/
│   ├── page.tsx          # List all clients
│   ├── [id]/
│   │   ├── page.tsx      # View client details
│   │   └── edit/
│   │       └── page.tsx  # Edit client
│   └── new/
│       └── page.tsx      # Create new client
├── nodes/
│   ├── page.tsx          # List all nodes
│   ├── [id]/
│   │   ├── page.tsx      # View node details
│   │   └── edit/
│   │       └── page.tsx  # Edit node
│   └── new/
│       └── page.tsx      # Create new node
└── routing/
    ├── page.tsx          # Routing rules list
    ├── [id]/
    │   ├── page.tsx      # View rule details
    │   └── edit/
    │       └── page.tsx  # Edit rule
    └── new/
        └── page.tsx      # Create new rule
```

### Data Fetching Pattern

**Server Component (Initial Load)**:
```typescript
// app/admin/xray/inbounds/page.tsx
export default async function InboundsPage() {
  const inbounds = await xrayApi.getInbounds();
  
  return <InboundsTable initialData={inbounds.data} />;
}
```

**Client Component (Interactive Table)**:
```typescript
// components/admin/xray/inbounds-table.tsx
'use client';

export function InboundsTable({ initialData }: { initialData: Inbound[] }) {
  const [inbounds, setInbounds] = useState(initialData);
  const { t } = useTranslations();

  const handleDelete = async (id: string) => {
    await xrayApi.deleteInbound(id);
    setInbounds(prev => prev.filter(i => i.id !== id));
  };

  return (
    <DataTable
      columns={[
        { key: 'name', label: t('xray.inbound_name') },
        { key: 'protocol', label: t('xray.protocol') },
        { key: 'port', label: t('xray.port') },
        { key: 'status', label: t('xray.status') },
      ]}
      data={inbounds}
      onDelete={handleDelete}
    />
  );
}
```

### Consistent Table Layout

All Xray management pages use a standardized table component:

```typescript
// components/admin/common/data-table.tsx

interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  actions?: {
    view?: (item: T) => void;
    edit?: (item: T) => void;
    delete?: (item: T) => void;
  };
  searchable?: boolean;
  sortable?: boolean;
}

export function DataTable<T>({ columns, data, actions, searchable, sortable }: DataTableProps<T>) {
  // Implement table with:
  // - shadcn/ui Table component
  // - Search input (if searchable)
  // - Column sorting (if sortable)
  // - Action dropdown menu
  // - Responsive mobile view (card layout)
}
```

## Error Handling

### Error Boundary Strategy

```typescript
// components/admin/error-boundary.tsx
'use client';

export class DashboardErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Dashboard Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {this.state.error?.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>
                Reload Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests

**Component Testing**:
- CircularProgressChart: Value rendering, color thresholds, animations
- ActivityCard: Status variants, value formatting
- LanguageSelector: Locale switching, localStorage persistence
- useRealTimePolling: Polling intervals, error handling, backoff logic

**Testing Library**: Vitest + React Testing Library

```typescript
// components/admin/dashboard/circular-progress-chart.test.tsx
describe('CircularProgressChart', () => {
  it('displays green color for values below 70%', () => {
    render(<CircularProgressChart value={50} max={100} label="CPU" unit="%" />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ stroke: '#22c55e' });
  });

  it('displays yellow color for values 70-89%', () => {
    render(<CircularProgressChart value={75} max={100} label="CPU" unit="%" />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ stroke: '#eab308' });
  });

  it('displays red color for values 90% and above', () => {
    render(<CircularProgressChart value={95} max={100} label="CPU" unit="%" />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ stroke: '#ef4444' });
  });
});
```

### Integration Tests

**i18n Integration**:
- Language switching updates all visible text
- localStorage persistence across page reloads
- Fallback to default locale on invalid stored value

**Real-Time Polling Integration**:
- Data updates after polling interval
- Error handling displays error state
- Exponential backoff on repeated failures

### Accessibility Testing

**Manual Testing Checklist**:
- [ ] Keyboard navigation through all interactive elements
- [ ] Screen reader announcements for status changes
- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels present on charts and cards

**Automated Testing**:
- Run axe-core accessibility audits on all pages
- Verify semantic HTML structure
- Check ARIA roles and attributes

## Performance Optimizations

### 1. Server Components Strategy

**Default to Server Components** for:
- Initial page rendering
- Data fetching
- Static content

**Client Components** only when needed for:
- User interaction (buttons, forms)
- Real-time updates (polling)
- Browser APIs (localStorage)

```typescript
// app/admin/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await getDashboardData(); // Server-side fetch
  
  return (
    <div>
      <PageHeader /> {/* Server Component */}
      <SystemMonitors initialHealth={data.health} /> {/* Client Component */}
    </div>
  );
}
```

### 2. Lazy Loading

**Below-the-fold Components**:
```typescript
// Lazy load activity feed (below circular charts)
const ActivityFeed = dynamic(() => import('@/components/admin/dashboard/activity-feed'), {
  loading: () => <Skeleton />,
  ssr: false, // Not needed for initial paint
});
```

### 3. Request Deduplication

Implement request caching (as described in Real-Time Data Flow section) to prevent duplicate API calls within a 1-second window.

### 4. GPU-Accelerated Animations

```css
/* Use will-change for circular chart animations */
.circular-progress-svg circle {
  will-change: stroke-dashoffset;
  transition: stroke-dashoffset 300ms ease-out;
}

/* Transform-based animations for smooth 60fps */
.sidebar-slide-in {
  transform: translateX(0);
  transition: transform 200ms ease-out;
  will-change: transform;
}
```

### 5. Lighthouse Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | <1.5s | RSC, optimized CSS |
| Largest Contentful Paint | <2.0s | Image optimization, lazy loading |
| Total Blocking Time | <200ms | Code splitting, lazy components |
| Cumulative Layout Shift | <0.1 | Reserved space for dynamic content |
| Speed Index | <2.5s | Critical CSS, deferred JS |

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions (macOS and iOS)

### Feature Detection

```typescript
// lib/utils/feature-detection.ts

export const features = {
  supportsLocalStorage: typeof window !== 'undefined' && 'localStorage' in window,
  supportsVisibilityAPI: typeof document !== 'undefined' && 'visibilityState' in document,
  supportsResizeObserver: typeof window !== 'undefined' && 'ResizeObserver' in window,
};

// Graceful fallback for localStorage
export const storage = {
  getItem: (key: string) => {
    if (!features.supportsLocalStorage) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (!features.supportsLocalStorage) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn('localStorage not available');
    }
  },
};
```

### Polyfills

No polyfills required for target browsers. All features (CSS Grid, Flexbox, SVG, fetch, ResizeObserver) are natively supported in latest 2 versions.

## Security Considerations

### 1. XSS Prevention

```typescript
// Always sanitize user-generated content
import DOMPurify from 'dompurify';

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
}
```

### 2. CSRF Protection

All API mutations include CSRF tokens (handled by existing auth system).

### 3. Rate Limiting

Real-time polling respects rate limits:
- Maximum 1 request per 5 seconds per endpoint
- Exponential backoff on 429 (Too Many Requests)

### 4. Secure localStorage

```typescript
// Never store sensitive data in localStorage
// ✅ OK: User preferences (locale, theme)
// ❌ NOT OK: Auth tokens, passwords, API keys
```

## Deployment Considerations

### Environment Variables

```env
# Required for SSR API calls
NEXT_PUBLIC_SITE_URL=https://admin.suproxy.com

# Backend API endpoint
BACKEND_API_URL=https://api.suproxy.com
```

### Build Optimization

```bash
# Production build
npm run build

# Verify bundle size
npm run build -- --analyze
```

### CDN Strategy

- Static assets served from CDN
- SVG charts inlined (small size)
- Fonts preloaded for critical render path

## Migration Strategy

### Phase 1: Dark Theme Implementation
1. Update `globals.css` with new color tokens
2. Test contrast ratios for accessibility
3. Update existing components to use new tokens

### Phase 2: i18n Integration
1. Create i18n context and provider
2. Add translation files (en.json, ru.json)
3. Update AdminLayout to wrap with I18nProvider
4. Implement LanguageSelector component
5. Migrate sidebar and dashboard text to use `t()` function

### Phase 3: Dashboard Restructuring
1. Create CircularProgressChart component
2. Create ActivityCard component
3. Update dashboard page layout
4. Integrate real-time polling hook
5. Test data flow and error handling

### Phase 4: Xray Management Pages
1. Create route structure
2. Implement table components
3. Connect to backend APIs
4. Test CRUD operations

### Phase 5: Performance Optimization
1. Implement lazy loading
2. Add request deduplication
3. Optimize animations
4. Run Lighthouse audits
5. Fix performance issues

## Future Enhancements

1. **Advanced Filtering**: Add filtering capabilities to Xray management tables
2. **Export Functionality**: Allow exporting audit logs and system metrics to CSV
3. **Dark/Light Mode Toggle**: Complement fixed dark theme with optional light mode
4. **Real-Time Notifications**: WebSocket integration for instant alerts
5. **Custom Dashboards**: Allow users to customize dashboard layout and widgets
6. **Mobile App**: Native mobile app using React Native for on-the-go management

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is primarily a **UI transformation** involving styling, layout, responsive design, and internationalization. Most requirements fall into categories that are **not suitable for property-based testing**:

- **UI Rendering and Layout**: Dashboard sections, responsive grids, spacing
- **CSS Styling**: Dark theme colors, borders, hover states
- **Configuration and Setup**: Component existence, route structure, library usage

These are better tested through:
- **Snapshot tests** for UI rendering consistency
- **Example-based tests** for specific interactions
- **Visual regression tests** for styling consistency
- **Integration tests** for API wiring and performance

However, there are a few logical behaviors that **are suitable for PBT**:

1. **Data encoding/validation logic** (UTF-8 character handling)
2. **Color threshold logic** (chart color selection based on values)
3. **Unit conversion logic** (KB/MB, GB/TB automatic conversion)
4. **Language persistence** (localStorage round-trip)
5. **Accessibility validation** (WCAG contrast ratios)
6. **Exponential backoff logic** (retry timing calculation)
7. **Active route highlighting** (navigation state management)

Below are the correctness properties for these testable behaviors.

### Property 1: UTF-8 Character Validation

*For any* text content to be rendered in the UI, the UTF-8 validation function should correctly identify whether the content is properly encoded, and reject strings containing encoding artifacts like "â€"".

**Validates: Requirements 1.1, 1.3, 1.4**

**Test Strategy**: Generate random text strings including valid UTF-8, invalid byte sequences, and common encoding artifacts. Verify validation function returns true for valid UTF-8 and false for invalid encodings.

---

### Property 2: Chart Color Threshold Selection

*For any* numeric value and maximum value, the circular progress chart color selection function should return:
- Green (#22c55e) when percentage is 0-69%
- Yellow (#eab308) when percentage is 70-89%
- Red (#ef4444) when percentage is 90-100%

**Validates: Requirements 4.6, 4.7, 4.8**

**Test Strategy**: Generate random value/max pairs, calculate percentage, verify color selection matches threshold rules. Include edge cases (0%, 69%, 70%, 89%, 90%, 100%).

---

### Property 3: Traffic Unit Conversion

*For any* traffic value in bytes/second, the unit conversion function should:
- Display in KB/s when value < 1024 KB/s
- Display in MB/s when value ≥ 1024 KB/s
- Display in GB when volume < 1024 GB
- Display in TB when volume ≥ 1024 GB

And the conversion should be reversible: converting to display units and back should preserve the original value within rounding tolerance.

**Validates: Requirements 5.8, 5.9**

**Test Strategy**: Generate random byte values across magnitude ranges (bytes, KB, MB, GB, TB). Verify correct unit selection and that round-trip conversion (bytes → display → bytes) preserves value.

---

### Property 4: Language Persistence Round-Trip

*For any* valid locale ('en' or 'ru'), storing the locale in localStorage and then retrieving it should return the exact same locale value.

**Validates: Requirements 3.3, 3.4**

**Test Strategy**: For each valid locale, set it in localStorage, retrieve it, verify equality. Test across page reloads (using test harness to simulate reload).

---

### Property 5: WCAG AA Contrast Ratio Compliance

*For any* text/background color combination used in the dark theme, the contrast ratio should be at least 4.5:1 for normal text and 3:1 for large text (WCAG AA standard).

**Validates: Requirements 2.7**

**Test Strategy**: Extract all color combinations from theme configuration (foreground/background, muted/background, primary/card, etc.). Calculate contrast ratios using WCAG formula. Verify all meet minimum thresholds.

---

### Property 6: Exponential Backoff Calculation

*For any* number of consecutive failures (0-10), the exponential backoff delay calculation should:
- Return base interval when failures = 0
- Follow formula: `interval × 2^(failures-1)` for failures > 0
- Never exceed maximum backoff (60000ms)

**Validates: Requirements 6.5**

**Test Strategy**: Generate random failure counts (0-20). Verify calculated delay matches exponential formula or is capped at max backoff.

---

### Property 7: Active Route Highlighting

*For any* valid application route, navigating to that route should result in the corresponding sidebar navigation item having active styling (determined by pathname matching).

**Validates: Requirements 3.21**

**Test Strategy**: Generate valid route paths from navigation structure. For each route, verify the `isActive()` function returns true for the matching nav item and false for all others.

---

### Property 8: Touch Target Minimum Size

*For any* interactive element rendered on mobile viewport (width < 768px), the element's dimensions should be at least 44×44 pixels to meet touch-friendly requirements.

**Validates: Requirements 8.7**

**Test Strategy**: Query all interactive elements (buttons, links, form inputs) in mobile viewport. Measure computed dimensions (width × height). Verify both dimensions ≥ 44px.

---

### Property 9: Request Deduplication Within Time Window

*For any* API endpoint, making multiple simultaneous requests within the cache TTL window (1000ms) should result in only one actual network request, with all callers receiving the same promise.

**Validates: Requirements 12.7**

**Test Strategy**: For a test endpoint, trigger 5 simultaneous calls. Mock network layer to count requests. Verify only 1 network request is made and all 5 callers receive the same response.

---

## References

- [Next.js 15 Internationalization](https://nextjs.org/docs/15/app/guides/internationalization)
- [React Circular Progressbar](https://www.npmjs.com/package/react-circular-progressbar)
- [Tailwind CSS Custom Colors](https://tailwindcss.com/docs/customizing-colors)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [localStorage Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Author**: Kiro AI Agent  
**Status**: Ready for Review
