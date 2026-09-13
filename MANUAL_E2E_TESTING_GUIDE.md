# Manual End-to-End Testing Guide - 3X-UI Transformation

**Task:** 16.3 Manual end-to-end testing  
**Date:** 2025-01-XX  
**Tester:** [Your Name]  
**Environment:** Development (localhost:3000)

---

## Test Environment Setup

### Prerequisites
- [ ] Development server running (`npm run dev`)
- [ ] Backend API accessible
- [ ] Test user credentials available
- [ ] Chrome/Edge browser (latest version)
- [ ] Mobile device or browser dev tools for responsive testing

### Server Status
```bash
# Start development server
npm run dev

# Expected output:
# ✓ Ready in Xs
# ○ Local: http://localhost:3000
```

---

## Test Suite 1: Complete User Journey (Login → Dashboard → Xray Pages)

### 1.1 Login Flow
**URL:** http://localhost:3000/login

- [ ] **Test:** Navigate to login page
  - **Expected:** Login form displays with dark theme
  - **Expected:** All text is readable (WCAG AA contrast)
  - **Expected:** Form fields have proper labels
  - **Actual:**

- [ ] **Test:** Enter valid credentials and submit
  - **Credentials:** [Use test credentials]
  - **Expected:** Successful authentication
  - **Expected:** Redirect to /admin dashboard
  - **Expected:** No JavaScript errors in console
  - **Actual:**

- [ ] **Test:** Verify session persistence
  - **Action:** Refresh page
  - **Expected:** User remains logged in
  - **Expected:** No redirect to login page
  - **Actual:**

### 1.2 Dashboard Navigation
**URL:** http://localhost:3000/admin

- [ ] **Test:** Dashboard loads successfully
  - **Expected:** Page loads within 2 seconds
  - **Expected:** Three distinct sections visible:
    1. System Monitors (4 circular progress charts)
    2. Activity Cards (3 cards: Xray Status, Uptime, Traffic)
    3. Recent Activity Feed
  - **Expected:** No loading errors
  - **Actual:**

- [ ] **Test:** Verify sidebar navigation structure
  - **Expected:** Sidebar visible on left
  - **Expected:** Menu items in correct order:
    - 📊 Dashboard
    - 👥 Users
    - 📥 Sessions
    - 🚀 Xray Management (expandable)
      - 📥 Inbounds
      - 🔑 Clients
      - ⚙️ Nodes
      - 🗺️ Routing
    - 📦 Plans
    - 📝 Logs
    - 🖥️ Monitoring
  - **Expected:** Dashboard item is highlighted (active state)
  - **Actual:**

### 1.3 Xray Management Pages Navigation

#### Test: Inbounds Page
**URL:** http://localhost:3000/admin/xray/inbounds

- [ ] Navigate to Xray Management → Inbounds
  - **Expected:** Xray Management submenu expands
  - **Expected:** Inbounds item is highlighted
  - **Expected:** Inbounds table displays
  - **Expected:** Table columns: Name, Protocol, Port, Status
  - **Expected:** Action buttons: View, Edit, Delete
  - **Actual:**

#### Test: Clients Page
**URL:** http://localhost:3000/admin/xray/clients

- [ ] Navigate to Xray Management → Clients
  - **Expected:** Clients item is highlighted
  - **Expected:** Clients table displays
  - **Expected:** Table columns: Email, Inbound, Status
  - **Expected:** Action buttons available
  - **Actual:**

#### Test: Nodes Page
**URL:** http://localhost:3000/admin/xray/nodes

- [ ] Navigate to Xray Management → Nodes
  - **Expected:** Nodes item is highlighted
  - **Expected:** Nodes table displays
  - **Expected:** Table columns: Name, Address, Status
  - **Expected:** Action buttons available
  - **Actual:**

#### Test: Routing Page
**URL:** http://localhost:3000/admin/xray/routing

- [ ] Navigate to Xray Management → Routing
  - **Expected:** Routing item is highlighted
  - **Expected:** Routing rules table displays
  - **Expected:** Table columns: Name, Type, Action
  - **Expected:** Action buttons available
  - **Actual:**

---

## Test Suite 2: Language Switching Throughout Session

### 2.1 Language Selector Availability

- [ ] **Test:** Locate language selector
  - **Location:** Admin header (top-right area)
  - **Expected:** Dropdown button visible
  - **Expected:** Current language displayed (🇺🇸 English or 🇷🇺 Русский)
  - **Actual:**

### 2.2 Switch to Russian

- [ ] **Test:** Change language from English to Russian
  - **Action:** Click language selector
  - **Action:** Select "🇷🇺 Русский"
  - **Expected:** All visible text updates immediately (no reload)
  - **Expected:** Sidebar items in Russian:
    - Dashboard → Панель управления
    - Users → Пользователи
    - Sessions → Сессии
    - Xray Management → Управление Xray
    - Plans → Тарифы
    - Logs → Логи
    - Monitoring → Мониторинг
  - **Expected:** Language persisted in localStorage
  - **Actual:**

- [ ] **Test:** Verify dashboard content in Russian
  - **Expected:** Page header: "Панель управления"
  - **Expected:** Chart labels translated:
    - CPU → ЦП
    - RAM → ОЗУ
    - Disk → Диск
    - Swap → Своп
  - **Expected:** Activity card labels translated:
    - Xray Status → Статус Xray
    - System Uptime → Время работы
    - Traffic Speed → Скорость трафика
  - **Actual:**

### 2.3 Navigate Through Pages in Russian

- [ ] **Test:** Navigate to Xray Management → Inbounds (in Russian)
  - **Expected:** Submenu label: "Управление Xray"
  - **Expected:** Submenu items in Russian:
    - Inbounds → Входящие
    - Clients → Клиенты
    - Nodes → Узлы
    - Routing → Маршрутизация
  - **Expected:** Page content in Russian
  - **Actual:**

### 2.4 Switch Back to English

- [ ] **Test:** Change language from Russian to English
  - **Action:** Click language selector
  - **Action:** Select "🇺🇸 English"
  - **Expected:** All text updates back to English
  - **Expected:** No page reload required
  - **Actual:**

### 2.5 Language Persistence Across Session

- [ ] **Test:** Refresh page after language change
  - **Action:** Set language to Russian
  - **Action:** Hard refresh (Ctrl+Shift+R)
  - **Expected:** Language remains Russian after reload
  - **Expected:** localStorage contains "preferred_locale": "ru"
  - **Actual:**

---

## Test Suite 3: Real-Time Data Updates (5 Minutes)

### 3.1 Initial State Verification

**Time:** 00:00 (Start)

- [ ] **Test:** Record initial values
  - **CPU:** _____%
  - **RAM:** _____MB / _____MB
  - **Disk:** _____GB / _____GB
  - **Swap:** _____MB / _____MB
  - **Xray Status:** Running / Stopped
  - **System Uptime:** _____
  - **Traffic Speed:** _____KB/s or MB/s
  - **Total Traffic:** _____GB

### 3.2 Monitor Circular Progress Charts (5-second interval)

**Expected Behavior:** Charts update every 5 seconds

- [ ] **Test at 00:15:** Check for first update
  - **Expected:** At least one value has changed
  - **Expected:** Smooth animation (300ms transition)
  - **Expected:** No page flicker
  - **Actual:**

- [ ] **Test at 01:00:** Verify consistent updates
  - **Expected:** Values updating regularly
  - **Expected:** Colors change based on thresholds:
    - Green: 0-69%
    - Yellow: 70-89%
    - Red: 90%+
  - **Actual:**

- [ ] **Test at 02:30:** Check animation quality
  - **Expected:** Smooth transitions between values
  - **Expected:** No visual glitches
  - **Expected:** 60fps animations (check with browser dev tools)
  - **Actual:**

### 3.3 Monitor Activity Cards (10-second interval)

**Expected Behavior:** Cards update every 10 seconds

- [ ] **Test at 00:20:** Check for first update
  - **Expected:** Xray Status may change
  - **Expected:** Uptime increments
  - **Expected:** Traffic Speed may fluctuate
  - **Actual:**

- [ ] **Test at 01:30:** Verify traffic unit conversion
  - **Expected:** If speed > 1024 KB/s → displays in MB/s
  - **Expected:** If total > 1024 GB → displays in TB
  - **Expected:** Proper decimal formatting (e.g., 1.5 MB/s)
  - **Actual:**

### 3.4 Error Handling Test

- [ ] **Test:** Simulate network interruption
  - **Action:** Open Network tab in dev tools
  - **Action:** Throttle to "Offline" for 30 seconds
  - **Expected:** Last known values still displayed
  - **Expected:** Warning indicator appears
  - **Expected:** Error logged to console
  - **Actual:**

- [ ] **Test:** Restore network connection
  - **Action:** Set throttling back to "No throttling"
  - **Expected:** Data updates resume within 5-10 seconds
  - **Expected:** Warning indicator disappears
  - **Expected:** Exponential backoff resets
  - **Actual:**

### 3.5 Page Visibility API Test

- [ ] **Test:** Switch to another tab
  - **Action:** Open browser console, keep Network tab visible
  - **Action:** Switch to another browser tab for 1 minute
  - **Expected:** API polling pauses (no network requests)
  - **Actual:**

- [ ] **Test:** Return to admin tab
  - **Action:** Switch back to admin dashboard tab
  - **Expected:** Polling resumes immediately
  - **Expected:** Fresh data fetched within 5 seconds
  - **Actual:**

### 3.6 Final Verification (5:00)

- [ ] **Test:** Record final values and compare
  - **CPU:** _____%
  - **RAM:** _____MB
  - **Disk:** _____GB
  - **Swap:** _____MB
  - **Xray Status:** Running / Stopped
  - **Uptime increased by:** ~5 minutes
  - **Traffic total increased:** Yes / No
  - **Total updates observed:** Approximately 60 chart updates, 30 card updates
  - **Actual:**

---

## Test Suite 4: Mobile Responsive Layout

### 4.1 Responsive Testing Setup

**Tools:** Chrome DevTools Device Mode or Physical Device

**Test Viewports:**
- Mobile: 375×667 (iPhone SE)
- Tablet: 768×1024 (iPad)
- Desktop: 1920×1080 (Full HD)

### 4.2 Mobile View (375×667)

- [ ] **Test:** Sidebar behavior
  - **Expected:** Sidebar hidden by default
  - **Expected:** Hamburger menu button visible in header
  - **Expected:** Tap hamburger → sidebar slides in from left
  - **Expected:** Sidebar overlay darkens background
  - **Expected:** Tap outside sidebar → sidebar closes
  - **Actual:**

- [ ] **Test:** Dashboard layout (mobile)
  - **Expected:** Circular progress charts in 2×2 grid
  - **Expected:** Each chart fills ~45% width (with gap)
  - **Expected:** Activity cards stacked vertically (full width)
  - **Expected:** Recent activity section full width
  - **Expected:** Spacing: 12px gaps
  - **Actual:**

- [ ] **Test:** Touch targets
  - **Expected:** All interactive elements ≥ 44×44px
  - **Expected:** Easy to tap without mis-clicks
  - **Expected:** Language selector dropdown works on touch
  - **Expected:** Sidebar menu items easy to tap
  - **Actual:**

- [ ] **Test:** Xray tables (mobile)
  - **Expected:** Tables convert to card layout
  - **Expected:** Each row is a card with stacked fields
  - **Expected:** Action buttons accessible
  - **Expected:** Horizontal scrolling if needed
  - **Actual:**

### 4.3 Tablet View (768×1024)

- [ ] **Test:** Dashboard layout (tablet)
  - **Expected:** Circular progress charts in 2×2 grid
  - **Expected:** Larger chart size than mobile
  - **Expected:** Activity cards may show 2 columns
  - **Expected:** Spacing: 16px gaps
  - **Actual:**

- [ ] **Test:** Sidebar behavior (tablet)
  - **Expected:** Sidebar visible if width ≥ 768px
  - **Expected:** No hamburger menu (or optional)
  - **Actual:**

### 4.4 Desktop View (1920×1080)

- [ ] **Test:** Dashboard layout (desktop)
  - **Expected:** Circular progress charts in 1×4 row
  - **Expected:** Charts evenly spaced across width
  - **Expected:** Activity cards in 3-column grid
  - **Expected:** Recent activity section: 4:3 split layout
  - **Expected:** Spacing: 24px gaps
  - **Actual:**

- [ ] **Test:** Sidebar behavior (desktop)
  - **Expected:** Sidebar always visible
  - **Expected:** Fixed position on left
  - **Expected:** Width: ~256px
  - **Actual:**

### 4.5 Viewport Resize Transitions

- [ ] **Test:** Smooth transitions between breakpoints
  - **Action:** Slowly resize browser from 375px → 1920px
  - **Expected:** Layout transitions smoothly
  - **Expected:** No content jumps or layout shifts
  - **Expected:** Charts maintain aspect ratio
  - **Expected:** No horizontal scrollbar except at very small widths
  - **Actual:**

### 4.6 Physical Device Testing (If Available)

**Device:** _______________ (iOS/Android)

- [ ] **Test:** Load on actual mobile device
  - **URL:** http://[your-local-ip]:3000/admin
  - **Expected:** Page loads correctly
  - **Expected:** Touch interactions work smoothly
  - **Expected:** Pinch-to-zoom disabled (viewport meta tag)
  - **Expected:** Sidebar swipe gestures work (if implemented)
  - **Actual:**

---

## Test Suite 5: Xray Management CRUD Operations

### 5.1 Inbounds CRUD

#### Create Inbound
- [ ] **Test:** Create new inbound
  - **Action:** Navigate to Inbounds page
  - **Action:** Click "Create New" or "+" button
  - **Action:** Fill form with test data:
    - Name: Test Inbound 001
    - Protocol: VMess
    - Port: 10001
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** New inbound appears in table
  - **Expected:** Redirect to inbounds list
  - **Actual:**

#### Read Inbound
- [ ] **Test:** View inbound details
  - **Action:** Click "View" on "Test Inbound 001"
  - **Expected:** Detail page displays
  - **Expected:** All fields populated correctly
  - **Actual:**

#### Update Inbound
- [ ] **Test:** Edit inbound
  - **Action:** Click "Edit" on "Test Inbound 001"
  - **Action:** Change name to "Test Inbound 001 - Updated"
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** Changes reflected in table
  - **Actual:**

#### Delete Inbound
- [ ] **Test:** Delete inbound
  - **Action:** Click "Delete" on "Test Inbound 001 - Updated"
  - **Action:** Confirm deletion in modal/dialog
  - **Expected:** Confirmation prompt appears
  - **Expected:** Item removed from table after confirmation
  - **Expected:** Success message displayed
  - **Actual:**

### 5.2 Clients CRUD

#### Create Client
- [ ] **Test:** Create new client
  - **Action:** Navigate to Clients page
  - **Action:** Click "Create New" or "+" button
  - **Action:** Fill form with test data:
    - Email: test@example.com
    - Inbound: (select existing)
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** New client appears in table
  - **Actual:**

#### Read Client
- [ ] **Test:** View client details
  - **Action:** Click "View" on "test@example.com"
  - **Expected:** Detail page displays
  - **Expected:** All fields populated correctly
  - **Actual:**

#### Update Client
- [ ] **Test:** Edit client
  - **Action:** Click "Edit" on "test@example.com"
  - **Action:** Change email to "test-updated@example.com"
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** Changes reflected in table
  - **Actual:**

#### Delete Client
- [ ] **Test:** Delete client
  - **Action:** Click "Delete" on "test-updated@example.com"
  - **Action:** Confirm deletion
  - **Expected:** Client removed from table
  - **Expected:** Success message displayed
  - **Actual:**

### 5.3 Nodes CRUD

#### Create Node
- [ ] **Test:** Create new node
  - **Action:** Navigate to Nodes page
  - **Action:** Click "Create New" or "+" button
  - **Action:** Fill form with test data:
    - Name: Test Node 001
    - Address: 192.168.1.100
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** New node appears in table
  - **Actual:**

#### Read, Update, Delete Node
- [ ] **Test:** Perform read, update, delete operations on node
  - **Similar to Inbounds/Clients tests**
  - **Expected:** All CRUD operations work correctly
  - **Actual:**

### 5.4 Routing Rules CRUD

#### Create Routing Rule
- [ ] **Test:** Create new routing rule
  - **Action:** Navigate to Routing page
  - **Action:** Click "Create New" or "+" button
  - **Action:** Fill form with test data:
    - Name: Test Rule 001
    - Type: Domain
    - Action: Direct
  - **Action:** Submit form
  - **Expected:** Success message displayed
  - **Expected:** New rule appears in table
  - **Actual:**

#### Read, Update, Delete Rule
- [ ] **Test:** Perform read, update, delete operations on rule
  - **Similar to previous CRUD tests**
  - **Expected:** All CRUD operations work correctly
  - **Actual:**

---

## Test Suite 6: Dark Theme Verification

### 6.1 Color Scheme Verification

- [ ] **Test:** Background colors
  - **Expected:** Main background: #121212 - #141414 (coal-black)
  - **Expected:** Card backgrounds: #1a1a1a - #1f1f1f (slightly lighter)
  - **Expected:** Borders: #2a2a2a - #333333 (subtle gray)
  - **Actual (inspect with DevTools):**

- [ ] **Test:** Text colors
  - **Expected:** Primary text: #e4e4e7 (soft white)
  - **Expected:** Muted text: #a1a1aa (light gray)
  - **Expected:** All text readable without strain
  - **Actual:**

- [ ] **Test:** Interactive element hover states
  - **Action:** Hover over sidebar menu items
  - **Expected:** Background lightens by 5-10%
  - **Expected:** Smooth transition (200ms)
  - **Expected:** Cursor changes to pointer
  - **Actual:**

### 6.2 WCAG AA Contrast Verification

- [ ] **Test:** Use contrast checker tool
  - **Tool:** Chrome DevTools Accessibility panel or online tool
  - **Check combinations:**
    - Foreground (#e4e4e7) on Background (#121212): Expected ≥ 4.5:1
    - Muted text (#a1a1aa) on Background (#121212): Expected ≥ 4.5:1
    - Chart green (#22c55e) on Card (#1a1a1a): Expected ≥ 4.5:1
    - Chart yellow (#eab308) on Card (#1a1a1a): Expected ≥ 4.5:1
    - Chart red (#ef4444) on Card (#1a1a1a): Expected ≥ 4.5:1
  - **Actual:**

---

## Test Suite 7: Performance Verification

### 7.1 Initial Load Performance

- [ ] **Test:** Measure load time (cold cache)
  - **Action:** Clear browser cache
  - **Action:** Open DevTools Network tab
  - **Action:** Navigate to http://localhost:3000/admin
  - **Expected:** DOMContentLoaded < 1.5s
  - **Expected:** Load complete < 2.0s
  - **Expected:** First Contentful Paint < 1.5s
  - **Expected:** Largest Contentful Paint < 2.0s
  - **Actual:**

### 7.2 Lighthouse Audit

- [ ] **Test:** Run Lighthouse audit
  - **Action:** Open Chrome DevTools → Lighthouse
  - **Action:** Run audit on /admin page
  - **Expected:** Performance score ≥ 85
  - **Expected:** Accessibility score ≥ 90
  - **Expected:** Best Practices score ≥ 90
  - **Expected:** SEO score (not critical for admin panel)
  - **Actual Scores:**
    - Performance: _____
    - Accessibility: _____
    - Best Practices: _____
    - SEO: _____

### 7.3 Animation Performance

- [ ] **Test:** Check frame rate during animations
  - **Action:** Open DevTools → Performance/Rendering
  - **Action:** Enable "FPS meter"
  - **Action:** Trigger chart updates (wait for real-time polling)
  - **Expected:** Steady 60 fps during animations
  - **Expected:** No dropped frames
  - **Expected:** CPU usage remains reasonable
  - **Actual:**

---

## Test Suite 8: Browser Console Verification

### 8.1 Console Errors

- [ ] **Test:** Check for JavaScript errors
  - **Action:** Open browser console (F12)
  - **Action:** Navigate through all pages
  - **Expected:** No errors (red messages)
  - **Expected:** Only info/debug logs (if any)
  - **Actual (list any errors):**

### 8.2 Network Requests

- [ ] **Test:** Monitor API calls
  - **Action:** Open Network tab
  - **Action:** Filter to XHR/Fetch
  - **Expected:** Successful API responses (200 OK)
  - **Expected:** Polling requests every 5s (charts) and 10s (cards)
  - **Expected:** Proper request headers (Authorization, Content-Type)
  - **Actual:**

### 8.3 LocalStorage Inspection

- [ ] **Test:** Verify localStorage usage
  - **Action:** Open Application/Storage tab → Local Storage
  - **Expected:** Key "preferred_locale" present
  - **Expected:** Value: "en" or "ru"
  - **Expected:** No sensitive data stored (passwords, tokens)
  - **Actual:**

---

## Summary and Sign-off

### Test Execution Summary

| Test Suite | Total Tests | Passed | Failed | Blocked | Notes |
|------------|-------------|--------|--------|---------|-------|
| 1. User Journey | ___ | ___ | ___ | ___ | |
| 2. Language Switching | ___ | ___ | ___ | ___ | |
| 3. Real-Time Updates | ___ | ___ | ___ | ___ | |
| 4. Responsive Layout | ___ | ___ | ___ | ___ | |
| 5. CRUD Operations | ___ | ___ | ___ | ___ | |
| 6. Dark Theme | ___ | ___ | ___ | ___ | |
| 7. Performance | ___ | ___ | ___ | ___ | |
| 8. Console Verification | ___ | ___ | ___ | ___ | |
| **TOTAL** | **___** | **___** | **___** | **___** | |

### Critical Issues Found

1. ____________________________________________________________
2. ____________________________________________________________
3. ____________________________________________________________

### Non-Critical Issues Found

1. ____________________________________________________________
2. ____________________________________________________________
3. ____________________________________________________________

### Recommendations

1. ____________________________________________________________
2. ____________________________________________________________
3. ____________________________________________________________

### Sign-off

- [ ] All critical tests passed
- [ ] All known issues documented
- [ ] Ready for deployment / Further testing required

**Tester Name:** _________________  
**Date:** _________________  
**Signature:** _________________

---

## Appendix: Quick Reference

### Test Credentials
- Username: _______________
- Password: _______________

### API Endpoints
- System Stats: `/api/admin/system/stats`
- System Health: `/api/admin/system/health`
- Xray Status: `/api/admin/system/xray`

### Key Files
- Main Dashboard: `app/admin/page.tsx`
- Circular Charts: `components/admin/dashboard/circular-progress-chart.tsx`
- Activity Cards: `components/admin/dashboard/activity-card.tsx`
- Language Selector: `components/admin/layout/language-selector.tsx`
- i18n Context: `lib/i18n/context.tsx`

### Browser DevTools Shortcuts
- Open Console: `F12` or `Ctrl+Shift+I`
- Network Tab: `Ctrl+Shift+E`
- Device Mode: `Ctrl+Shift+M`
- Performance: `Ctrl+Shift+P` → "Performance"
