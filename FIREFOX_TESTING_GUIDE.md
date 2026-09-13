# Firefox Compatibility Testing Guide

**Task 13.2**: Test on Firefox (latest 2 versions)  
**Spec**: 3x-ui-transformation  
**Requirements**: 12.2

## Test Environment

### Required Firefox Versions
- Firefox 133+ (latest stable)
- Firefox 132 (previous version)

### How to Check Firefox Version
1. Open Firefox
2. Click menu (☰) → Help → About Firefox
3. Version number will be displayed

## Pre-Testing Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Firefox Browser
Navigate to: `http://localhost:3000`

### 3. Open Developer Tools
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (macOS)

## Test Checklist

### ✅ Test 1: SVG Chart Rendering

#### 1.1 Circular Progress Charts Display
- [ ] Navigate to Dashboard (`/admin`)
- [ ] Verify 4 circular progress charts are visible:
  - CPU Usage
  - RAM Usage
  - Disk Usage
  - Swap Usage
- [ ] Charts should be perfectly circular (not elliptical)
- [ ] Progress arcs should be smooth (no jagged edges)

**How to Verify SVG Rendering:**
1. Right-click on a chart → Inspect Element
2. Verify the element is `<svg>` with nested `<circle>` elements
3. Check that `stroke-dasharray` and `stroke-dashoffset` attributes are present
4. Confirm no rendering errors in Console

**Expected Result:**
```html
<svg viewBox="0 0 120 120" role="img" aria-label="...">
  <circle cx="60" cy="60" r="54" class="stroke-muted" />
  <circle cx="60" cy="60" r="54" class="stroke-chart-green" 
          stroke-dasharray="339.292" stroke-dashoffset="..." />
</svg>
```

#### 1.2 Chart Color Thresholds
- [ ] Charts showing 0-69% should be **green**
- [ ] Charts showing 70-89% should be **yellow**
- [ ] Charts showing 90-100% should be **red**

**Test Steps:**
1. Observe current chart colors
2. If all are same color, wait for real-time updates (5 seconds)
3. Compare color against percentage value

#### 1.3 Chart Animations
- [ ] Wait for chart updates (every 5 seconds)
- [ ] Progress arcs should animate smoothly
- [ ] No flickering or stuttering
- [ ] Transition duration should be ~300ms

**How to Test:**
1. Open DevTools → Console
2. Run: `setInterval(() => console.log(new Date()), 5000)`
3. Watch for chart updates every 5 seconds
4. Animations should be smooth

#### 1.4 Chart Responsive Behavior
- [ ] Resize browser window to mobile width (<640px)
- [ ] Charts should display in 1 column
- [ ] Resize to tablet width (640-1024px)
- [ ] Charts should display in 2 columns
- [ ] Resize to desktop width (>1024px)
- [ ] Charts should display in 4 columns

### ✅ Test 2: localStorage Persistence

#### 2.1 Language Selection Persistence
1. [ ] Navigate to Dashboard
2. [ ] Click Language Selector (globe icon in header)
3. [ ] Select "Русский" (Russian)
4. [ ] Verify UI updates to Russian immediately
5. [ ] Open DevTools → Storage/Inspector → Local Storage
6. [ ] Verify key `preferred_locale` = `"ru"`
7. [ ] Refresh the page (`F5`)
8. [ ] Verify Russian language persists after reload
9. [ ] Switch back to English
10. [ ] Verify key updates to `"en"`

**How to Inspect localStorage in Firefox:**
1. Press `F12` to open Developer Tools
2. Click "Storage" tab
3. Expand "Local Storage" → `http://localhost:3000`
4. Look for `preferred_locale` key

**Expected localStorage:**
```
Key: preferred_locale
Value: "en" or "ru"
```

#### 2.2 localStorage Quota and Errors
Test that the app handles storage errors gracefully:

**Test A: Disable localStorage**
1. [ ] Open `about:config` in Firefox
2. [ ] Search for `dom.storage.enabled`
3. [ ] Set to `false`
4. [ ] Refresh the app
5. [ ] App should still load (default to English)
6. [ ] No JavaScript errors in Console
7. [ ] Re-enable storage: set back to `true`

**Test B: Clear Storage**
1. [ ] Open DevTools → Storage tab
2. [ ] Right-click "Local Storage" → Delete All
3. [ ] Refresh page
4. [ ] App should default to English
5. [ ] Select Russian language
6. [ ] Verify `preferred_locale` is created again

#### 2.3 Multiple Storage Keys
Verify multiple storage keys don't conflict:
1. [ ] Set language to Russian
2. [ ] Navigate to a page with table (e.g., `/admin/plans`)
3. [ ] Collapse sidebar (if implemented)
4. [ ] Open DevTools → Storage
5. [ ] Verify multiple keys exist without conflict:
   - `preferred_locale`
   - Other app-specific keys

### ✅ Test 3: Core Features Verification

#### 3.1 Navigation and Routing
- [ ] Click "Dashboard" in sidebar
- [ ] Navigate to `/admin` correctly
- [ ] Click "Users" → Navigate to `/admin/users`
- [ ] Click "Xray Management" → Submenu expands
- [ ] Click "Inbounds" → Navigate to `/admin/xray/inbounds`
- [ ] Click "Clients" → Navigate to `/admin/xray/clients`
- [ ] Click "Nodes" → Navigate to `/admin/xray/nodes`
- [ ] Click "Routing" → Navigate to `/admin/xray/routing`
- [ ] Active route is highlighted in sidebar
- [ ] Browser back/forward buttons work correctly

#### 3.2 Activity Cards Display
- [ ] Dashboard shows 3 activity cards:
  1. Xray Status (with green/red status dot)
  2. System Uptime (days, hours, minutes)
  3. Traffic Speed (MB/s or KB/s)
- [ ] Cards update every 10 seconds
- [ ] Icons render correctly (Lucide icons as SVG)
- [ ] Status dot colors match status (green = running, red = stopped)

#### 3.3 Real-Time Data Updates
1. [ ] Open Dashboard
2. [ ] Open DevTools → Network tab
3. [ ] Filter for "XHR" or "Fetch"
4. [ ] Observe API calls every 5 seconds (charts) and 10 seconds (cards)
5. [ ] Charts and cards should update with new data
6. [ ] No errors in Console
7. [ ] No failed network requests (or proper error handling)

**Expected Network Activity:**
- `/api/admin/system/health` - every 5 seconds
- `/api/admin/system/xray` - every 10 seconds

#### 3.4 Dark Theme Rendering
- [ ] Background color is very dark (#121212 range)
- [ ] Cards have slightly lighter background (#1a1a1a)
- [ ] Text is soft white (#e4e4e7)
- [ ] Borders are subtle gray (#2a2a2a)
- [ ] No harsh white borders or backgrounds
- [ ] Theme is consistent across all pages

**Visual Verification:**
1. Take a screenshot
2. Use color picker tool to verify colors
3. Compare against design spec colors

#### 3.5 Typography and Font Rendering
- [ ] Text is crisp and readable
- [ ] No font rendering issues
- [ ] No text overlapping
- [ ] Proper font weights (normal, medium, semibold)
- [ ] Icons align with text correctly

#### 3.6 Form Inputs and Interactions
- [ ] Navigate to `/admin/plans/new` or login page
- [ ] Click in text inputs
- [ ] Type text - characters appear correctly
- [ ] No input lag
- [ ] Placeholder text visible
- [ ] Focus rings visible
- [ ] Input validation works

#### 3.7 Dropdown Menus
- [ ] Click Language Selector
- [ ] Dropdown opens smoothly
- [ ] Both options visible (English, Russian)
- [ ] Click an option - dropdown closes
- [ ] Selected option is checked (✓)
- [ ] Click outside - dropdown closes

#### 3.8 Tables and Data Display
- [ ] Navigate to `/admin/plans`
- [ ] Table renders correctly
- [ ] Columns aligned properly
- [ ] Text not cut off
- [ ] Action buttons functional
- [ ] Sorting works (if implemented)
- [ ] Search works (if implemented)

### ✅ Test 4: Responsive Design

#### 4.1 Mobile View (320px - 640px)
1. [ ] Press `Ctrl+Shift+M` for Responsive Design Mode
2. [ ] Select "iPhone SE" or set width to 375px
3. [ ] Sidebar collapses to hamburger menu
4. [ ] Hamburger icon visible and clickable
5. [ ] Charts display in 1 column
6. [ ] Activity cards stack vertically
7. [ ] Text is readable (not too small)
8. [ ] Buttons are tap-friendly (44×44px minimum)
9. [ ] No horizontal scrolling

#### 4.2 Tablet View (641px - 1024px)
1. [ ] Set width to 768px
2. [ ] Charts display in 2 columns
3. [ ] Sidebar visible or collapsible
4. [ ] Activity cards in responsive grid
5. [ ] Tables readable and functional

#### 4.3 Desktop View (>1024px)
1. [ ] Set width to 1280px
2. [ ] Charts display in 4 columns
3. [ ] Activity cards in 3 columns
4. [ ] Sidebar fully visible
5. [ ] Proper spacing (24px gaps)
6. [ ] No wasted whitespace

### ✅ Test 5: Accessibility

#### 5.1 Keyboard Navigation
- [ ] Press `Tab` key repeatedly
- [ ] Focus moves through interactive elements in logical order
- [ ] Focus indicators visible (ring around elements)
- [ ] Press `Enter` on sidebar items - navigates correctly
- [ ] Press `Escape` on open dropdown - closes dropdown
- [ ] Press `Space` on buttons - triggers action
- [ ] No keyboard traps

#### 5.2 Screen Reader Compatibility
*Note: This requires Firefox with NVDA (Windows) or Orca (Linux) screen reader*

- [ ] Enable screen reader
- [ ] Navigate to Dashboard
- [ ] Circular charts have proper ARIA labels
- [ ] Charts announce as "progressbar"
- [ ] Percentages are announced
- [ ] Activity cards have meaningful labels
- [ ] Navigation items are announced correctly

#### 5.3 Focus Management
- [ ] Click language selector to open dropdown
- [ ] Focus should move to dropdown
- [ ] Select option with keyboard (Arrow keys + Enter)
- [ ] Focus returns to trigger button after closing

### ✅ Test 6: Performance

#### 6.1 Page Load Time
1. [ ] Open DevTools → Network tab
2. [ ] Refresh page (`Ctrl+Shift+R` for hard reload)
3. [ ] Check "DOMContentLoaded" event time
4. [ ] Should be < 2 seconds on broadband
5. [ ] All assets load without errors

#### 6.2 Animation Performance
1. [ ] Open DevTools → Performance tab
2. [ ] Click "Record"
3. [ ] Wait for chart animations (5 seconds)
4. [ ] Stop recording
5. [ ] Check frame rate - should be 60fps
6. [ ] No dropped frames or jank

#### 6.3 Memory Usage
1. [ ] Open DevTools → Memory tab
2. [ ] Take heap snapshot
3. [ ] Use the app for 2 minutes (navigate pages, update data)
4. [ ] Take another heap snapshot
5. [ ] Check for memory leaks (significant increase)
6. [ ] Memory should stabilize after initial load

### ✅ Test 7: Error Handling

#### 7.1 Network Errors
1. [ ] Open Dashboard
2. [ ] Open DevTools → Network tab
3. [ ] Set throttling to "Offline"
4. [ ] Wait for next polling request
5. [ ] App should show error state or retain last known data
6. [ ] Check Console for proper error logging
7. [ ] Set throttling back to "No throttling"
8. [ ] App should recover automatically

#### 7.2 Invalid Data Handling
- [ ] Charts with null/undefined values show fallback
- [ ] No "NaN" or "undefined" text visible
- [ ] No encoding artifacts like "â€"" displayed
- [ ] Zero values display as "0", not blank

### ✅ Test 8: Internationalization

#### 8.1 English Translations
- [ ] Set language to English
- [ ] Verify all text is in English:
  - Sidebar: "Dashboard", "Users", "Xray Management", etc.
  - Dashboard: "CPU Usage", "RAM Usage", "Xray Status", "Running"
  - Activity cards: "System Uptime", "Traffic Speed"

#### 8.2 Russian Translations
- [ ] Set language to Russian
- [ ] Verify all text is in Russian:
  - Sidebar: "Панель управления", "Пользователи", "Управление Xray"
  - Dashboard: "ЦПУ", "ОЗУ", "Статус Xray", "Работает"
  - Activity cards: "Время работы", "Скорость трафика"
- [ ] Cyrillic characters render correctly
- [ ] No font rendering issues with Cyrillic

#### 8.3 Language Switching
- [ ] Switch from English to Russian
- [ ] All visible text updates immediately (no page reload)
- [ ] Switch back to English
- [ ] Text updates again
- [ ] No missing translations (no translation keys visible like "nav.dashboard")

## Firefox-Specific Issues to Watch For

### Known Firefox Differences
1. **SVG Rendering**: Firefox may render SVG slightly differently than Chrome
   - Check for anti-aliasing differences
   - Verify stroke widths are consistent
   
2. **localStorage**: Firefox has stricter private browsing restrictions
   - Test in both normal and private mode
   
3. **CSS Grid**: Firefox has excellent CSS Grid support
   - Should work identically to Chrome
   
4. **Flexbox**: Minor differences in flex-shrink behavior
   - Verify no layout breaks

5. **Transitions**: Firefox may handle CSS transitions slightly differently
   - Animations should still be smooth

### Debugging Tools Specific to Firefox
- **3D View**: Visualize z-index and layer stacking
- **Accessibility Inspector**: Built-in a11y tree viewer
- **Network Monitor**: Detailed timing information
- **Storage Inspector**: More detailed than Chrome DevTools

## Test Results Documentation

### Pass Criteria
✅ **PASS** if:
- All SVG charts render correctly
- localStorage persists language selection
- All core features work correctly
- No JavaScript errors in Console
- Performance is acceptable (<2s load, 60fps animations)
- Responsive design works at all breakpoints
- Accessibility features are functional

❌ **FAIL** if:
- SVG charts don't render or look broken
- localStorage doesn't persist or throws errors
- Navigation doesn't work
- JavaScript errors occur
- Performance is poor (>3s load, <30fps animations)
- Layout breaks at any breakpoint
- Critical accessibility issues

### Test Report Template

```markdown
## Firefox Compatibility Test Report

**Date**: [YYYY-MM-DD]
**Firefox Version**: [e.g., 133.0]
**Tester**: [Your Name]
**Spec**: 3x-ui-transformation
**Task**: 13.2

### Test Results Summary
- Total Tests: 8 categories
- Tests Passed: X/8
- Tests Failed: Y/8
- Critical Issues: Z

### Detailed Results
1. SVG Chart Rendering: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
2. localStorage Persistence: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
3. Core Features: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
4. Responsive Design: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
5. Accessibility: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
6. Performance: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
7. Error Handling: ✅ PASS / ❌ FAIL
   - Notes: [Details]
   
8. Internationalization: ✅ PASS / ❌ FAIL
   - Notes: [Details]

### Issues Found
1. [Issue description]
   - Severity: Critical / Major / Minor
   - Steps to reproduce:
   - Expected: [...]
   - Actual: [...]
   
### Screenshots
[Attach screenshots of any issues]

### Recommendations
[Any suggestions for improvements or fixes]

### Conclusion
Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PASS WITH ISSUES
```

## Automated Test Execution

Run the automated Firefox compatibility tests:

```bash
npm run test -- firefox-compatibility.test.tsx
```

This will verify:
- SVG rendering logic
- localStorage operations
- Core component functionality
- CSS and layout

## Next Steps

After completing Firefox testing:
1. Document all test results
2. Create issues for any bugs found
3. Fix critical issues before proceeding
4. Proceed to Task 13.3 (Safari testing)

## References
- Requirements 12.2: Browser Compatibility
- Design Document: Browser Compatibility section
- Firefox Developer Edition: https://www.mozilla.org/firefox/developer/
