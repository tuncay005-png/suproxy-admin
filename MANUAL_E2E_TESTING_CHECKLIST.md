# Manual End-to-End Testing Checklist
## Task 16.3: Complete User Journey Testing

**Spec:** 3X-UI Transformation  
**Test Date:** _____________  
**Tester:** _____________  
**Build Version:** _____________  

---

## Prerequisites

- [ ] Development server is running (`npm run dev`)
- [ ] Backend API is accessible and responding
- [ ] Test credentials are available (username: admin, password: admin123)
- [ ] Multiple browsers available for testing (Chrome, Firefox, Safari)
- [ ] Mobile device or browser DevTools mobile emulation ready
- [ ] Tablet device or emulation ready

---

## Test Section 1: Login Flow

### Desktop Login
- [ ] Navigate to `/login` page
- [ ] Page displays login form with username and password fields
- [ ] "Sign In" or "Log In" button is visible
- [ ] Enter username: `admin`
- [ ] Enter password: `admin123`
- [ ] Click login button
- [ ] Successfully redirects to `/admin` dashboard
- [ ] No errors in browser console

**Notes:**
_________________________________________________________________

---

## Test Section 2: Dashboard Verification

### Layout and Structure
- [ ] Dashboard page loads within 2 seconds
- [ ] Page heading displays "Dashboard" (EN) or "Панель управления" (RU)
- [ ] Three distinct sections are visible:
  - [ ] System Monitors (top section)
  - [ ] Activity Cards (middle section)
  - [ ] Recent Activity (bottom section)

### System Monitors (Circular Progress Charts)
- [ ] Four circular progress charts are displayed
- [ ] Charts are labeled:
  - [ ] CPU Usage (CPU / ЦП)
  - [ ] RAM Usage (RAM / ОЗУ)
  - [ ] Disk Usage (Disk / Диск)
  - [ ] Swap Usage (Swap / Своп)
- [ ] Each chart displays:
  - [ ] Percentage or value with unit
  - [ ] Color coding (green < 70%, yellow 70-89%, red ≥ 90%)
  - [ ] Smooth circular progress indicator
  - [ ] Label below chart

### Activity Cards
- [ ] Three activity cards are displayed:
  - [ ] Xray Status card with status indicator dot
  - [ ] System Uptime card
  - [ ] Traffic Speed/Total Traffic card
- [ ] Xray Status shows "Running" (green) or "Stopped" (red)
- [ ] Uptime displays in format: "Xd Xh Xm" or seconds
- [ ] Traffic displays with appropriate units (KB/s, MB/s, GB, TB)

### Data Display
- [ ] No garbled characters (no "â€"" symbols)
- [ ] Numbers display correctly without encoding artifacts
- [ ] All text is properly formatted UTF-8

**Notes:**
_________________________________________________________________

---

## Test Section 3: Language Switching

### Initial Language
- [ ] Identify current language (check dashboard heading)
- [ ] Note current language: _____ (EN or RU)

### Language Selector
- [ ] Locate language selector in header/settings
- [ ] Language selector displays flag emoji (🇺🇸 or 🇷🇺)
- [ ] Click language selector
- [ ] Dropdown/menu opens with language options
- [ ] Both languages visible: English and Русский

### Switch to English (if starting in Russian)
- [ ] Click "English" option
- [ ] Page updates immediately (no reload)
- [ ] Dashboard heading changes to "Dashboard"
- [ ] Sidebar navigation in English:
  - [ ] "Dashboard"
  - [ ] "Users"
  - [ ] "Sessions"
  - [ ] "Xray Management"
  - [ ] "Plans"
  - [ ] "Logs"
  - [ ] "Monitoring"
- [ ] System monitor labels in English
- [ ] Activity card titles in English

### Switch to Russian
- [ ] Click language selector again
- [ ] Select "Русский"
- [ ] Page updates immediately
- [ ] Dashboard heading changes to "Панель управления"
- [ ] Sidebar navigation in Russian:
  - [ ] "Панель управления"
  - [ ] "Пользователи"
  - [ ] "Сессии"
  - [ ] "Управление Xray"
  - [ ] "Тарифы"
  - [ ] "Логи"
  - [ ] "Мониторинг"
- [ ] System monitor labels in Russian
- [ ] Activity card titles in Russian

### Language Persistence
- [ ] Reload page (F5 or Ctrl+R)
- [ ] Page loads with last selected language
- [ ] Language persists across navigation
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify `preferred_locale` key exists with value: `en` or `ru`

**Notes:**
_________________________________________________________________

---

## Test Section 4: Real-Time Data Updates

### Setup
- [ ] Open browser DevTools → Network tab
- [ ] Filter for API calls
- [ ] Ensure dashboard is loaded

### Circular Progress Charts (5-second polling)
- [ ] Note initial CPU value: _______%
- [ ] Note initial RAM value: _______ MB
- [ ] Wait 6-7 seconds
- [ ] Observe network requests to `/api/admin/system/health`
- [ ] Charts update with new values (or stay same if unchanged)
- [ ] Animations are smooth (300ms transition)
- [ ] No flickering or layout shifts
- [ ] Check console for errors: None expected

### Activity Cards (10-second polling)
- [ ] Note initial Xray status: _____________
- [ ] Note initial traffic speed: _____________
- [ ] Wait 11-12 seconds
- [ ] Observe network requests to `/api/admin/system/xray`
- [ ] Cards update with new data
- [ ] Status indicators update if status changed
- [ ] No errors in console

### Extended Monitoring (5 minutes)
**Start Time:** __________ **End Time:** __________

- [ ] Monitor dashboard for 5 continuous minutes
- [ ] Charts continue updating every ~5 seconds
- [ ] Activity cards continue updating every ~10 seconds
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No excessive API calls (should be regular intervals)
- [ ] No JavaScript errors
- [ ] UI remains responsive throughout

### Error Handling
- [ ] Stop backend server (if possible)
- [ ] Wait for next polling cycle
- [ ] Verify error states display gracefully:
  - [ ] "Data unavailable" message OR
  - [ ] Last known values with warning indicator OR
  - [ ] Error icon with retry option
- [ ] Restart backend server
- [ ] Verify data updates resume automatically
- [ ] Exponential backoff occurs on failures (check network timing)

**Notes:**
_________________________________________________________________

---

## Test Section 5: Navigation and Xray Management

### Sidebar Navigation
- [ ] Sidebar is visible on left side
- [ ] All menu items are visible
- [ ] Icons are displayed correctly
- [ ] Active menu item is highlighted

### Xray Management Submenu
- [ ] Click "Xray Management" / "Управление Xray" menu item
- [ ] Submenu expands with animation
- [ ] Four submenu items appear:
  - [ ] Inbounds / Входящие
  - [ ] Clients / Клиенты
  - [ ] Nodes / Узлы
  - [ ] Routing / Маршрутизация
- [ ] Submenu items are indented/nested visually
- [ ] Icons are displayed for each submenu item

### Navigate to Inbounds
- [ ] Click "Inbounds" / "Входящие"
- [ ] URL changes to `/admin/xray/inbounds`
- [ ] Page loads successfully
- [ ] Page heading displays
- [ ] Table or list of inbounds displays (or empty state)
- [ ] "Xray Management" submenu stays expanded
- [ ] "Inbounds" submenu item is highlighted as active

### Navigate to Clients
- [ ] Click "Clients" / "Клиенты"
- [ ] URL changes to `/admin/xray/clients`
- [ ] Page loads successfully
- [ ] Page heading displays
- [ ] Table or list of clients displays (or empty state)
- [ ] "Clients" submenu item is highlighted as active

### Navigate to Nodes
- [ ] Click "Nodes" / "Узлы"
- [ ] URL changes to `/admin/xray/nodes`
- [ ] Page loads successfully
- [ ] Page heading displays
- [ ] Table or list of nodes displays (or empty state)
- [ ] "Nodes" submenu item is highlighted as active

### Navigate to Routing
- [ ] Click "Routing" / "Маршрутизация"
- [ ] URL changes to `/admin/xray/routing`
- [ ] Page loads successfully
- [ ] Page heading displays
- [ ] Table or list of routing rules displays (or empty state)
- [ ] "Routing" submenu item is highlighted as active

### Return to Dashboard
- [ ] Click "Dashboard" / "Панель управления" in sidebar
- [ ] URL changes to `/admin`
- [ ] Dashboard loads with all components
- [ ] "Dashboard" menu item is highlighted as active

**Notes:**
_________________________________________________________________

---

## Test Section 6: Xray Management CRUD Operations

### Inbounds Management
Navigate to `/admin/xray/inbounds`

#### View Operations
- [ ] Table displays existing inbounds (if any)
- [ ] Columns show relevant data (name, protocol, port, status)
- [ ] Each row has action buttons/menu

#### Create Operation (if supported)
- [ ] "Add" / "Create" / "New" button is visible
- [ ] Click create button
- [ ] Form or dialog opens
- [ ] Fill out inbound details
- [ ] Submit form
- [ ] Success message displays
- [ ] New inbound appears in list

#### Edit Operation (if supported)
- [ ] Click edit/pencil icon on existing inbound
- [ ] Form loads with current values
- [ ] Modify a field
- [ ] Save changes
- [ ] Success message displays
- [ ] Changes reflected in list

#### Delete Operation (if supported)
- [ ] Click delete/trash icon on an inbound
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Success message displays
- [ ] Inbound removed from list

### Clients Management
Navigate to `/admin/xray/clients`

#### View Operations
- [ ] Table displays existing clients (if any)
- [ ] Columns show relevant data (email, inbound, status)
- [ ] Each row has action buttons/menu

#### CRUD Operations (if supported)
- [ ] Create new client works
- [ ] Edit existing client works
- [ ] Delete client works
- [ ] All operations show appropriate feedback

### Nodes Management
Navigate to `/admin/xray/nodes`

#### View Operations
- [ ] Table displays existing nodes (if any)
- [ ] Columns show relevant data (name, address, status)
- [ ] Each row has action buttons/menu

#### CRUD Operations (if supported)
- [ ] Create new node works
- [ ] Edit existing node works
- [ ] Delete node works
- [ ] All operations show appropriate feedback

### Routing Management
Navigate to `/admin/xray/routing`

#### View Operations
- [ ] Table displays routing rules (if any)
- [ ] Columns show relevant data (name, type, action)
- [ ] Each row has action buttons/menu

#### CRUD Operations (if supported)
- [ ] Create new rule works
- [ ] Edit existing rule works
- [ ] Delete rule works
- [ ] All operations show appropriate feedback

**Notes:**
_________________________________________________________________

---

## Test Section 7: Mobile Responsive Layout

### Setup
- [ ] Use physical mobile device OR
- [ ] Use browser DevTools device emulation
- [ ] Set viewport to mobile size (375x812 iPhone 12)

### Mobile Dashboard
- [ ] Navigate to dashboard on mobile
- [ ] Page loads and renders correctly
- [ ] Circular charts display in 2x2 grid
- [ ] All 4 charts are visible without horizontal scroll
- [ ] Activity cards stack vertically
- [ ] Text is readable (not too small)
- [ ] Spacing is appropriate (12px gaps)

### Mobile Sidebar
- [ ] Sidebar is hidden by default
- [ ] Hamburger menu icon is visible in header
- [ ] Click hamburger menu
- [ ] Sidebar slides in (overlay or drawer)
- [ ] Navigation items are visible
- [ ] Can navigate to different pages
- [ ] Click outside sidebar or close button
- [ ] Sidebar closes smoothly

### Mobile Touch Interactions
- [ ] Tap targets are large enough (≥44x44px)
- [ ] Buttons respond to touch immediately
- [ ] No accidental double-taps needed
- [ ] Scrolling is smooth
- [ ] No horizontal scrolling issues
- [ ] Pinch-to-zoom works (or is disabled intentionally)

### Mobile Xray Management
- [ ] Navigate to Xray Inbounds on mobile
- [ ] Table adapts to mobile view (cards or responsive table)
- [ ] Data is readable on small screen
- [ ] Action buttons are accessible
- [ ] Can perform CRUD operations on mobile

**Notes:**
_________________________________________________________________

---

## Test Section 8: Tablet Responsive Layout

### Setup
- [ ] Use physical tablet device OR
- [ ] Use browser DevTools device emulation
- [ ] Set viewport to tablet size (1024x768 iPad Pro)

### Tablet Dashboard
- [ ] Navigate to dashboard on tablet
- [ ] Page loads and renders correctly
- [ ] Circular charts display in 2x2 grid
- [ ] Charts are appropriately sized
- [ ] Activity cards display in appropriate grid
- [ ] Layout uses available space efficiently

### Tablet Navigation
- [ ] Sidebar is visible or accessible
- [ ] Navigation works smoothly
- [ ] Can access all Xray management pages
- [ ] Touch interactions work well

**Notes:**
_________________________________________________________________

---

## Test Section 9: Dark Theme Verification

### Color Palette
- [ ] Main background is coal-black (#121212 - #141414)
- [ ] Cards have slightly lighter background (#1a1a1a - #1f1f1f)
- [ ] Text is soft white (#e4e4e7) or light gray (#a1a1aa)
- [ ] Borders are subtle gray (#2a2a2a - #333333)
- [ ] Primary accent color is visible and consistent

### Chart Colors
- [ ] Green charts (#22c55e) for low usage (< 70%)
- [ ] Yellow charts (#eab308) for medium usage (70-89%)
- [ ] Red charts (#ef4444) for high usage (≥ 90%)
- [ ] Colors are vibrant against dark background

### Interactive States
- [ ] Hover states lighten elements by ~5-10%
- [ ] Active menu items are highlighted
- [ ] Focus indicators are visible
- [ ] Buttons have clear hover feedback

### Accessibility
- [ ] Text contrast ratio meets WCAG AA (≥4.5:1)
- [ ] Can read all text comfortably
- [ ] Icons are visible and clear
- [ ] Status indicators are distinguishable

**Notes:**
_________________________________________________________________

---

## Test Section 10: Browser Compatibility

### Chrome/Edge (Latest)
- [ ] All features work correctly
- [ ] Layout renders properly
- [ ] Animations are smooth
- [ ] No console errors

### Firefox (Latest)
- [ ] All features work correctly
- [ ] SVG charts render correctly
- [ ] Layout matches Chrome
- [ ] LocalStorage persistence works

### Safari (Desktop & iOS)
- [ ] All features work correctly
- [ ] Mobile Safari works on iPhone
- [ ] Touch interactions work
- [ ] Layout is consistent

**Browser Issues Found:**
_________________________________________________________________

---

## Test Section 11: Performance Verification

### Load Time
- [ ] Dashboard loads in < 2 seconds (first visit)
- [ ] Dashboard loads in < 1 second (cached)
- [ ] Xray pages load quickly

### Runtime Performance
- [ ] Scrolling is smooth (60 fps)
- [ ] Animations don't stutter
- [ ] No lag when clicking buttons
- [ ] Real-time updates don't impact performance

### Network Performance
- [ ] API requests are appropriately sized
- [ ] No redundant requests
- [ ] Polling intervals are correct (5s for charts, 10s for cards)
- [ ] Request deduplication works

### Memory Usage
- [ ] Open DevTools → Memory/Performance tab
- [ ] Monitor for 5 minutes
- [ ] No significant memory leaks
- [ ] Memory usage stays stable

**Performance Issues Found:**
_________________________________________________________________

---

## Test Section 12: Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes modals/dropdowns

### Screen Reader (Optional)
- [ ] Use NVDA, JAWS, or VoiceOver
- [ ] Charts announce as progressbars with values
- [ ] Navigation items are announced correctly
- [ ] Button purposes are clear
- [ ] Form fields have proper labels

### ARIA Attributes
- [ ] Charts have `role="progressbar"`
- [ ] Charts have `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Buttons have appropriate `aria-label` if icon-only
- [ ] Live regions have `aria-live` for updates

**Accessibility Issues Found:**
_________________________________________________________________

---

## Summary and Sign-Off

### Critical Issues Found
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### Non-Critical Issues Found
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### Overall Assessment
- [ ] All critical features working
- [ ] Language switching functional
- [ ] Real-time updates working
- [ ] Mobile responsive layout confirmed
- [ ] Xray management pages accessible
- [ ] CRUD operations functional (if supported)
- [ ] Performance acceptable
- [ ] No blockers for release

### Recommendation
- [ ] **PASS** - Ready for deployment
- [ ] **PASS WITH MINOR ISSUES** - Can deploy with known issues
- [ ] **FAIL** - Requires fixes before deployment

**Tester Signature:** _______________________  
**Date:** _______________________

---

## Automated Test Execution

For automated validation of many of these scenarios, run:

```bash
# Run E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/user-journey.spec.ts

# Run on specific browser
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Desktop"
```

The automated tests cover:
- ✅ Login flow
- ✅ Dashboard component verification
- ✅ Language switching
- ✅ Real-time updates
- ✅ Mobile responsive layout
- ✅ Tablet responsive layout
- ✅ Navigation to Xray pages
- ✅ Language persistence
- ✅ Touch target sizes
- ✅ Error handling
