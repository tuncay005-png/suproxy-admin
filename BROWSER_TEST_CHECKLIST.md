# Cross-Browser Testing Checklist - Task 16.5

**Quick Reference Guide for Manual Testing**

## Pre-Testing Setup

- [ ] Start development server: `npm run dev`
- [ ] Open application at: `http://localhost:3000`
- [ ] Have 3 browser windows ready: Chrome/Edge, Firefox, Safari (if available)
- [ ] Clear browser cache and localStorage before testing
- [ ] Enable browser dev tools (F12)

---

## 🌐 Chrome/Edge Testing

### Core Functionality (10 min)
- [ ] Navigate to `/admin` - Dashboard loads within 2 seconds
- [ ] Verify 4 circular progress charts display (CPU, RAM, Disk, Swap)
- [ ] Verify 3 activity cards display (Xray Status, Uptime, Traffic)
- [ ] Observe real-time updates:
  - Wait 5 seconds → charts should update
  - Wait 10 seconds → activity cards should update
- [ ] Switch language: EN → RU → EN
  - All text updates immediately
  - Refresh page → language persists
- [ ] Navigate to all pages:
  - Dashboard, Users, Sessions, Plans, Logs, Monitoring
  - Xray: Inbounds, Clients, Nodes, Routing
- [ ] Verify active menu item highlights correctly

### Visual Rendering (5 min)
- [ ] Dark theme renders correctly:
  - Background: coal-black (#121212)
  - Text: soft white (#e4e4e7)
  - Borders: subtle gray (#2a2a2a)
- [ ] SVG circular charts render without artifacts
- [ ] Chart colors correct:
  - Green (0-69%), Yellow (70-89%), Red (90-100%)
- [ ] Hover effects work on navigation and cards
- [ ] No console errors or warnings

### Responsive Testing (5 min)
- [ ] Desktop (1920×1080): 4-column chart layout, fixed sidebar
- [ ] Tablet (768×1024): 2×2 chart grid, collapsible sidebar
- [ ] Mobile (375×667): 2×2 chart grid, overlay sidebar

**Chrome/Edge Result**: ⬜ PASS / ⬜ FAIL  
**Issues Found**: _________________________________

---

## 🦊 Firefox Testing

### Core Functionality (10 min)
- [ ] Navigate to `/admin` - Dashboard loads within 2 seconds
- [ ] Verify 4 circular progress charts display
- [ ] Verify 3 activity cards display
- [ ] Observe real-time updates (5s charts, 10s cards)
- [ ] Switch language: EN → RU → EN
- [ ] Navigate to all pages
- [ ] Verify active menu item highlights

### Visual Rendering (5 min)
- [ ] Dark theme renders correctly
- [ ] SVG circular charts render without artifacts
- [ ] Chart colors correct (Green/Yellow/Red)
- [ ] Hover effects work
- [ ] No console errors or warnings

### Responsive Testing (5 min)
- [ ] Desktop (1920×1080): Layout matches Chrome
- [ ] Tablet (768×1024): Layout matches Chrome
- [ ] Mobile (375×667): Layout matches Chrome

### Firefox-Specific Checks
- [ ] Compare CPU usage vs. Chrome (should be similar)
- [ ] Verify animations are smooth (60fps)
- [ ] Check localStorage persistence works

**Firefox Result**: ⬜ PASS / ⬜ FAIL  
**Issues Found**: _________________________________

---

## 🧭 Safari Testing (macOS/iOS)

⚠️ **If Safari not available, skip this section and note "SKIPPED - Platform unavailable"**

### Core Functionality (10 min)
- [ ] Navigate to `/admin` - Dashboard loads within 2 seconds
- [ ] Verify 4 circular progress charts display
- [ ] Verify 3 activity cards display
- [ ] Observe real-time updates
- [ ] Switch language: EN → RU → EN
- [ ] Navigate to all pages
- [ ] Verify active menu item highlights

### Visual Rendering (5 min)
- [ ] Dark theme renders correctly
- [ ] SVG circular charts render correctly
- [ ] Chart colors correct
- [ ] Hover effects work
- [ ] No console errors or warnings

### Safari-Specific Checks
- [ ] Touch targets ≥44×44px on iOS
- [ ] Swipe gestures don't interfere with navigation
- [ ] localStorage persistence works
- [ ] Private browsing mode works
- [ ] iOS Safari: Test on actual iPhone/iPad
  - Verify touch interactions
  - Test portrait and landscape orientations
  - Check hamburger menu works smoothly

**Safari Result**: ⬜ PASS / ⬜ FAIL / ⬜ SKIPPED  
**Issues Found**: _________________________________

---

## Performance Checks (All Browsers)

### Page Load Performance
- [ ] **Chrome**: Dashboard loads <2s
- [ ] **Firefox**: Dashboard loads <2s
- [ ] **Safari**: Dashboard loads <2s

### Runtime Performance (10-minute test)
- [ ] No memory leaks (check Task Manager/Activity Monitor)
- [ ] CPU usage reasonable (<10% idle, <15% with polling)
- [ ] Animations maintain 60fps
- [ ] No UI blocking during API updates

### Network Performance
- [ ] Throttle to "Slow 3G" in dev tools
- [ ] Dashboard still loads within 5 seconds
- [ ] Polling continues to work
- [ ] Error handling works on network failure

---

## Comparison Matrix

| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| Dashboard Load | ⬜ | ⬜ | ⬜ | <2s target |
| SVG Rendering | ⬜ | ⬜ | ⬜ | No artifacts |
| Real-time Updates | ⬜ | ⬜ | ⬜ | 5s/10s intervals |
| Language Switch | ⬜ | ⬜ | ⬜ | Instant update |
| Dark Theme | ⬜ | ⬜ | ⬜ | Identical colors |
| Responsive Layout | ⬜ | ⬜ | ⬜ | All breakpoints |
| localStorage | ⬜ | ⬜ | ⬜ | Persistence |
| CSS Animations | ⬜ | ⬜ | ⬜ | 60fps smooth |
| Touch Interactions | ⬜ | ⬜ | ⬜ | iOS only |

---

## Critical Issues to Report

### Block Deployment 🚨
- [ ] Dashboard doesn't load
- [ ] Real-time updates completely broken
- [ ] Navigation doesn't work
- [ ] Major visual corruption
- [ ] Data loss or corruption

### Fix Before Launch ⚠️
- [ ] Language switching broken
- [ ] SVG charts not rendering
- [ ] Responsive layout broken
- [ ] Performance <2s target
- [ ] localStorage not persisting

### Fix Post-Launch ℹ️
- [ ] Minor visual inconsistencies
- [ ] Animation stuttering
- [ ] Console warnings (non-blocking)
- [ ] Minor browser differences

---

## Test Results Summary

**Date**: _______________  
**Tester**: _______________

### Browser Status
- **Chrome/Edge**: ⬜ PASS ⬜ FAIL
- **Firefox**: ⬜ PASS ⬜ FAIL  
- **Safari**: ⬜ PASS ⬜ FAIL ⬜ SKIPPED

### Overall Result
⬜ **APPROVE** - All browsers pass  
⬜ **APPROVE with caveats** - Safari not tested  
⬜ **REJECT** - Critical issues found

### Critical Issues Found
1. _________________________________
2. _________________________________
3. _________________________________

### Recommendations
_________________________________
_________________________________
_________________________________

---

## Quick Test (5 minutes per browser)

If time is limited, run this abbreviated test:

1. ✅ Load dashboard
2. ✅ Verify charts display and update
3. ✅ Switch language EN ↔ RU
4. ✅ Navigate to 2-3 pages
5. ✅ Test one responsive breakpoint
6. ✅ Check for console errors

**Result**: All browsers behave identically ⬜ YES ⬜ NO
