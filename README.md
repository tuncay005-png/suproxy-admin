# Suproxy Admin Panel

A modern, premium dark-themed admin dashboard for Suproxy proxy management, featuring bilingual support, real-time system monitoring, and comprehensive Xray management capabilities.

## Features

### 🎨 Premium Dark Theme
- **Coal-black backgrounds** (#121212-#141414) for reduced eye strain during extended use
- **Subtle gray borders and accents** (#2a2a2a-#333333) for refined visual hierarchy
- **Soft white and gray text** (#e4e4e7, #a1a1aa) with WCAG AA contrast compliance
- **Smooth hover states** with intelligent color transitions
- **Consistent card styling** across all pages and components

### 🌐 Bilingual Support (English/Russian)
- **Language selector** in the header for instant switching
- **Persistent language preference** stored in localStorage
- **Complete translations** for all navigation items and content:
  - Dashboard / Панель управления
  - Users / Пользователи
  - Sessions / Сессии
  - Xray Management / Управление Xray
  - Plans / Тарифы
  - Logs / Логи
  - Monitoring / Мониторинг
- **Custom i18n implementation** optimized for Next.js 15 App Router

### 📊 Real-Time System Monitoring
- **Circular progress charts** for CPU, RAM, Disk, and Swap usage with SVG-based rendering
- **Intelligent color-coded thresholds**:
  - 🟢 Green (#22c55e) for 0-69% usage (healthy)
  - 🟡 Yellow (#eab308) for 70-89% usage (warning)
  - 🔴 Red (#ef4444) for 90%+ usage (critical)
- **Smooth GPU-accelerated animations** with 300ms CSS transitions using `will-change: transform`
- **Automatic data refresh** every 5 seconds with smart polling:
  - Exponential backoff on errors (5s → 10s → 20s → 40s → 60s max)
  - Pause polling when browser tab is inactive (Page Visibility API)
  - Request deduplication within 1-second window to prevent redundant API calls
  - Displays last known value with timestamp when data fetch fails
- **Accessibility features**:
  - ARIA progressbar roles with proper labels
  - Keyboard navigation support
  - Screen reader announcements for value changes

### 📈 Activity Cards
- **Xray Status Card** showing operational state (Running/Stopped) with status dot indicators
- **System Uptime Card** displaying days, hours, and minutes in readable format
- **Traffic Speed Card** showing current throughput (auto-converts KB/s ↔ MB/s)
- **Total Traffic Card** displaying accumulated volume (auto-converts GB ↔ TB)
- **Real-time updates** every 10 seconds

### 🚀 Enhanced Xray Management
- **Hierarchical navigation** with expandable Xray Management submenu:
  - **Inbounds** – Configure incoming proxy connections
  - **Clients** – Manage client access keys and permissions
  - **Nodes** – Administer server nodes and configurations
  - **Routing** – Define routing rules and policies
- **Persistent submenu state** during navigation within Xray sections
- **Active route highlighting** for current page

### 📱 Responsive Mobile-First Design
- **Collapsible sidebar** with hamburger menu on mobile devices (<768px)
- **Adaptive grid layouts**:
  - Desktop (>1024px): 1×4 row for progress charts
  - Tablet (768px-1024px): 2×2 grid
  - Mobile (<768px): 2×2 grid with vertical card stacking
- **Touch-friendly tap targets** (minimum 44×44px) for mobile usability
- **Smooth transitions** on viewport resize

## Technology Stack

### Core Framework
- **Next.js 16** with App Router and React Server Components
- **React 19** for modern UI rendering
- **TypeScript 5+** with strict mode for type safety

### Styling & UI
- **Tailwind CSS 4** with custom dark theme tokens
- **shadcn/ui** component library (Radix UI primitives)
- **Lucide React** for consistent iconography
- **next-themes** for theme management

### State Management & Data
- **React Server Components** for initial data fetching
- **Custom fetch-based API client** with token refresh
- **Custom i18n context** with localStorage persistence
- **Real-time polling hooks** with exponential backoff

### Form Handling
- **React Hook Form** with Zod schema validation
- **@hookform/resolvers** for seamless integration

### Testing
- **Vitest** for unit and integration tests
- **@testing-library/react** for component testing
- **Playwright** for end-to-end tests
- **jsdom** for DOM environment simulation

## Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd suproxy-admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your backend API URL and credentials
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` – Start development server with hot reload
- `npm run build` – Create optimized production build
- `npm start` – Start production server
- `npm run lint` – Run ESLint for code quality checks
- `npm test` – Run unit tests with Vitest
- `npm run test:watch` – Run tests in watch mode
- `npm run test:ui` – Open Vitest UI for interactive testing
- `npm run test:integration` – Run integration tests
- `npm run test:e2e` – Run Playwright end-to-end tests
- `npm run test:e2e:ui` – Open Playwright UI

## Project Structure

```
suproxy-admin/
├── app/                        # Next.js App Router pages
│   ├── (public)/              # Public routes (login)
│   ├── actions/               # Server actions
│   └── admin/                 # Protected admin routes
│       ├── layout.tsx         # Admin layout with sidebar
│       ├── page.tsx           # Dashboard with monitoring
│       ├── users/             # User management
│       ├── sessions/          # Session management
│       ├── xray/              # Xray management section
│       │   ├── inbounds/
│       │   ├── clients/
│       │   ├── nodes/
│       │   └── routing/
│       ├── plans/             # Plan management
│       ├── logs/              # Audit logs
│       └── monitoring/        # System monitoring
├── components/                # Reusable React components
│   ├── admin/
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── circular-progress-chart.tsx
│   │   │   └── activity-card.tsx
│   │   └── layout/            # Layout components
│   │       ├── admin-sidebar.tsx
│   │       ├── admin-header.tsx
│   │       └── language-selector.tsx
│   └── ui/                    # shadcn/ui components
├── lib/                       # Utilities and helpers
│   ├── api/                   # API client functions
│   ├── hooks/                 # Custom React hooks
│   │   └── use-real-time-polling.ts
│   └── i18n/                  # Internationalization
│       ├── context.tsx        # i18n provider and hooks
│       └── locales/           # Translation files
│           ├── en.json
│           └── ru.json
├── public/                    # Static assets
└── tests/                     # Test files
```

## Dark Theme Customization

The premium dark theme can be customized by modifying the color tokens in `app/globals.css`:

```css
.dark {
  /* Main backgrounds */
  --color-background: oklch(10% 0 0);    /* #121212 - main background */
  --color-card: oklch(13% 0 0);          /* #1a1a1a - card background */
  --color-popover: oklch(11% 0 0);       /* #141414 - popover background */
  
  /* Text colors */
  --color-foreground: oklch(95% 0 0);    /* #e4e4e7 - soft white text */
  --color-muted-foreground: oklch(65% 0 0); /* #a1a1aa - light gray */
  
  /* Borders */
  --color-border: oklch(17% 0 0);        /* #2a2a2a - subtle gray */
  
  /* Chart colors */
  --color-chart-green: oklch(65% 0.16 145);  /* #22c55e */
  --color-chart-yellow: oklch(75% 0.13 85);  /* #eab308 */
  --color-chart-red: oklch(60% 0.18 25);     /* #ef4444 */
}
```

### Customization Examples

**Change background darkness:**
```css
--color-background: oklch(8% 0 0);  /* Darker: #0f0f0f */
--color-background: oklch(12% 0 0); /* Lighter: #151515 */
```

**Adjust chart thresholds:**
Modify the color selection logic in `components/admin/dashboard/circular-progress-chart.tsx`:
```typescript
const getChartColor = (percentage: number) => {
  if (percentage < 70) return 'var(--color-chart-green)';  // Adjust threshold
  if (percentage < 90) return 'var(--color-chart-yellow)';
  return 'var(--color-chart-red)';
};
```

**Customize text contrast:**
```css
--color-foreground: oklch(98% 0 0);    /* Brighter white */
--color-muted-foreground: oklch(70% 0 0); /* Lighter gray */
```

## Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)
*Real-time system monitoring with circular progress charts and activity cards showing CPU, RAM, Disk, and Swap usage with color-coded thresholds*

### Xray Management
![Xray Management](docs/screenshots/xray-management.png)
*Comprehensive Xray configuration interface with expandable submenu for inbounds, clients, nodes, and routing management*

### Mobile Responsive Design
![Mobile View](docs/screenshots/mobile-view.png)
*Optimized mobile experience with collapsible navigation, 2×2 grid layout, and touch-friendly 44×44px tap targets*

### Language Switching
![Language Selector](docs/screenshots/language-selector.png)
*Seamless English/Russian language switching with persistent localStorage preferences*

> **Note:** Screenshots will be captured and added to demonstrate the final UI implementation. See `SCREENSHOTS_GUIDE.md` for detailed screenshot requirements.

## Accessibility

This application is built with accessibility in mind and targets **WCAG 2.1 Level AA compliance**:

- **Color Contrast**: All text meets WCAG AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
- **Focus Management**: Visible focus indicators and logical tab order
- **Responsive Design**: Touch-friendly tap targets (minimum 44×44px) for mobile devices

**Manual Testing Recommended**: While automated tests cover many accessibility requirements, full validation requires manual testing with assistive technologies (screen readers, keyboard-only navigation) and expert accessibility review.

## Browser Support

The application supports the latest two versions of:
- Google Chrome
- Mozilla Firefox
- Safari
- Microsoft Edge

## Performance

- **Initial Load Time**: <2 seconds on standard broadband connections
- **Dashboard Performance**: Lighthouse score 85+ for Dashboard page
- **Real-Time Updates**: Non-blocking with 5-10 second refresh intervals
- **Smooth Animations**: 60fps GPU-accelerated transitions
- **Optimized Rendering**: React Server Components for initial page load

## API Integration

The admin panel integrates with the following backend API endpoints:

- `/api/admin/system/stats` – System-wide statistics (users, instances, actions)
- `/api/admin/system/health` – Real-time resource usage (CPU, RAM, Disk, Swap)
- `/api/admin/system/xray` – Xray service status and traffic metrics
- `/api/admin/xray/inbounds` – Inbound configuration management
- `/api/admin/xray/clients` – Client access management
- `/api/admin/xray/nodes` – Node administration
- `/api/admin/xray/routing` – Routing rule configuration

All API calls include:
- **Automatic retry** with exponential backoff (1s, 2s, 4s)
- **Error logging** for debugging
- **Request deduplication** to avoid redundant calls
- **Loading states** for user feedback

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use Tailwind CSS utility classes for styling
- Write tests for new components and features
- Ensure WCAG AA accessibility compliance
- Maintain consistent code style with ESLint

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) – Learn about Next.js features and API
- [React Documentation](https://react.dev) – Learn about React 19
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) – Learn about utility-first CSS
- [TypeScript Documentation](https://www.typescriptlang.org/docs) – Learn about TypeScript
- [shadcn/ui Documentation](https://ui.shadcn.com) – Learn about the component library

## License

[Add your license information here]

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
