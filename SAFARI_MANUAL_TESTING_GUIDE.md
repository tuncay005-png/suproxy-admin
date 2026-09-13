# Safari Manual Testing Guide (macOS and iOS)

## Overview

This guide provides comprehensive manual testing procedures for the 3X-UI transformation feature on Safari browsers (macOS and iOS). Use this alongside the automated test suite to ensure complete compatibility.

**Task:** 13.3 - Test on Safari (macOS and iOS)  
**Requirements:** 12.2 - Browser compatibility

---

## Prerequisites

### Test Devices and Browsers

**macOS Safari:**
- Safari 17.x (macOS Sonoma)
- Safari 16.x (macOS Ventura)
- Screen sizes: 1920x1080, 1440x900, 2560x1440

**iOS Safari:**
- iPhone 14 Pro (iOS 17.x) - 393x852
- iPhone SE (iOS 17.x) - 375x667
- iPad Pro 12.9" (iOS 17.x) - 1024x1366
- iPad Mini (iOS 17.x) - 768x1024

### Test Environment Setup

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Access Application:**
   - Local: http://localhost:3000
   - For iOS testing: Use ngrok or your local IP address
     ```bash
     # Find your local IP
     ipconfig getifaddr en0  # macOS
     
     # Access from iOS: http://YOUR_IP:3000
     ```

3. **Login Credentials:**
   - Use valid admin credentials to access /admin dashboard

---

## Test Checklist

## Part 1: Core Features (macOS Safari)

### 1.1 Circular Progress Charts

**Test Procedure:**
1. Navigate to Dashboard (`/admin`)
2. Observe the four circular progress charts (CPU, RAM, Disk, Swap)

**Verification Points:**
- [ ] All four charts render correctly without visual glitches
- [ ] SVG circles are smooth and anti-aliased
- [ ] Percentage values display in the center of each chart
- [ ] Colors match thresholds:
  - Green (0-69%)
  - Yellow (70-89%)
  - Red (90-100%)
- [ ] Labels are clearly visible below each chart
- [ ] No rendering artifacts or jagged edges

**Expected Result:** Charts render smoothly with proper colors and values

---

### 1.2 Real-Time Data Updates

**Test Procedure:**
1. Stay on Dashboard for 30 seconds
2. Watch circular progress charts and activity cards
3. Open Network tab in Safari Developer Tools

**Verification Points:**
- [ ] Charts update every 5 seconds
- [ ] Activity cards update every 10 seconds
- [ ] Updates are smooth without flickering
- [ ] Network requests appear at correct intervals
- [ ] No JavaScript errors in console
- [ ] Values transition smoothly (300ms animation)

**Expected Result:** Data updates automatically without user interaction

---

### 1.3 Language Switching

**Test Procedure:**
1. Click language selector in header
2. Switch from English to Russian
3. Navigate to different pages
4. Refresh the page
5. Switch back to English

**Verification Points:**
- [ ] Language selector dropdown opens correctly
- [ ] Current language shows checkmark
- [ ] All text changes immediately (no page reload)
- [ ] Cyrillic characters render correctly
- [ ] Language persists after page refresh
- [ ] Navigation menu items translate correctly
- [ ] Dashboard labels translate correctly
- [ ] localStorage stores preferred_locale

**Expected Result:** Language switching works seamlessly with proper character encoding

---

### 1.4 Dark Theme Rendering

**Test Procedure:**
1. Inspect various UI elements
2. Check color contrast
3. Verify consistency across pages

**Verification Points:**
- [ ] Background is coal-black (#121212-#141414)
- [ ] Cards have slightly lighter background (#1a1a1a)
- [ ] Text is soft white/gray (#e4e4e7, #a1a1aa)
- [ ] Borders are subtle gray (#2a2a2a)
- [ ] No harsh white elements
- [ ] Hover states lighten by 5-10%
- [ ] Focus indicators are visible
- [ ] All text is readable (WCAG AA compliance)

**Expected Result:** Consistent premium dark theme throughout application

---

### 1.5 Navigation and Routing

**Test Procedure:**
1. Click each menu item in sidebar
2. Expand Xray Management submenu
3. Navigate to each Xray page
4. Use browser back/forward buttons

**Verification Points:**
- [ ] All menu items navigate correctly
- [ ] Xray submenu expands/collapses smoothly
- [ ] Active menu item is highlighted
- [ ] Parent menu stays expanded when on child page
- [ ] Browser back/forward work correctly
- [ ] Page titles update correctly
- [ ] No console errors during navigation

**Expected Result:** Navigation works flawlessly with proper highlighting

---

## Part 2: Mobile Responsive Layout (iOS Safari)

### 2.1 iPhone Testing (Portrait)

**Test Device:** iPhone 14 Pro (393x852) or iPhone SE (375x667)

**Test Procedure:**
1. Access application from iPhone
2. Navigate to Dashboard
3. Scroll through content
4. Test all interactive elements

**Verification Points:**
- [ ] Dashboard loads within 3 seconds
- [ ] Circular charts display in 2x2 grid
- [ ] Charts are properly sized (not too small)
- [ ] Activity cards stack vertically
- [ ] Sidebar is hidden initially
- [ ] Hamburger menu icon is visible
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Proper spacing (12px gaps)
- [ ] Safe area insets respected (notch/island)

**Expected Result:** Clean mobile layout with proper spacing and sizing

---

### 2.2 iPhone Testing (Landscape)

**Test Procedure:**
1. Rotate iPhone to landscape mode
2. Observe layout changes
3. Test navigation

**Verification Points:**
- [ ] Layout adapts to landscape orientation
- [ ] Charts remain visible and properly sized
- [ ] No content overflow
- [ ] Sidebar behavior adapts appropriately
- [ ] Text remains readable
- [ ] Navigation still accessible

**Expected Result:** Layout adapts gracefully to landscape orientation

---

### 2.3 iPad Testing

**Test Device:** iPad Pro 12.9" (1024x1366) or iPad Mini (768x1024)

**Test Procedure:**
1. Access application from iPad
2. Test in both portrait and landscape
3. Navigate through all sections

**Verification Points:**
- [ ] Charts display in 2x2 grid (portrait)
- [ ] Charts display in 1x4 row (landscape at >1024px)
- [ ] Sidebar shows properly at tablet width
- [ ] Activity cards use 3-column layout
- [ ] Touch targets are appropriate size
- [ ] Text is comfortable to read
- [ ] Spacing is balanced (16px gaps)

**Expected Result:** Tablet layout between mobile and desktop versions

---

## Part 3: Touch Interactions (iOS Safari)

### 3.1 Touch Targets

**Test Procedure:**
1. Tap various interactive elements
2. Try to hit small buttons/links
3. Test with different hand positions

**Verification Points:**
- [ ] All buttons are easy to tap (44x44px minimum)
- [ ] Language selector is touchable
- [ ] Menu items are easy to tap
- [ ] Card actions are accessible
- [ ] No accidental taps on nearby elements
- [ ] Links have sufficient padding
- [ ] No 300ms tap delay
- [ ] Visual feedback on tap (hover states)

**Expected Result:** All interactive elements are touch-friendly

---

### 3.2 Scrolling and Momentum

**Test Procedure:**
1. Scroll dashboard content rapidly
2. Use momentum scrolling (flick gesture)
3. Test at different scroll speeds

**Verification Points:**
- [ ] Scrolling is smooth (60fps)
- [ ] Momentum scrolling works naturally
- [ ] No janky animations during scroll
- [ ] Rubber band effect at top/bottom works
- [ ] Charts remain visible during scroll
- [ ] No horizontal bounce/scroll
- [ ] Scroll position persists correctly

**Expected Result:** Natural iOS scrolling behavior

---

### 3.3 Gesture Interactions

**Test Procedure:**
1. Test swipe to open sidebar (if implemented)
2. Pull-to-refresh (if implemented)
3. Pinch-to-zoom (should be disabled)
4. Long press on elements

**Verification Points:**
- [ ] Swipe gestures work smoothly
- [ ] No accidental zoom on double-tap
- [ ] Long press doesn't trigger unwanted actions
- [ ] Touch interactions don't interfere with scrolling
- [ ] No text selection on repeated taps
- [ ] Gestures feel responsive and natural

**Expected Result:** Gestures work as expected without conflicts

---

### 3.4 Keyboard and Input

**Test Procedure:**
1. Focus on search/filter inputs (if present)
2. Observe keyboard appearance
3. Test input while keyboard is visible

**Verification Points:**
- [ ] Keyboard appears smoothly
- [ ] Viewport adjusts for keyboard
- [ ] Input remains visible when typing
- [ ] Keyboard doesn't cover submit buttons
- [ ] Dismiss keyboard works properly
- [ ] Layout restores after keyboard dismiss
- [ ] No zoom on input focus

**Expected Result:** Smooth keyboard interactions without layout issues

---

## Part 4: Safari-Specific Features

### 4.1 SVG Rendering

**Test Procedure:**
1. Inspect circular progress charts closely
2. Zoom in/out using pinch gesture
3. Test at different zoom levels

**Verification Points:**
- [ ] SVG circles are crisp at all zoom levels
- [ ] No pixelation or blur
- [ ] Stroke widths are consistent
- [ ] Colors render accurately
- [ ] Animations are smooth
- [ ] No rendering artifacts
- [ ] ViewBox scales correctly

**Expected Result:** Perfect SVG rendering at all scales

---

### 4.2 CSS Features

**Test Procedure:**
1. Test various CSS effects
2. Check hover states (desktop)
3. Verify transitions and animations

**Verification Points:**
- [ ] CSS Grid layouts work correctly
- [ ] Flexbox layouts are proper
- [ ] CSS transitions are smooth (300ms)
- [ ] Transform animations work
- [ ] Backdrop filters work (if used)
- [ ] Custom properties (CSS vars) work
- [ ] Gradient backgrounds render correctly

**Expected Result:** All modern CSS features work properly

---

### 4.3 localStorage Behavior

**Test Procedure:**
1. Set language preference
2. Close Safari completely
3. Reopen Safari
4. Access application again

**Verification Points:**
- [ ] Language preference persists
- [ ] No localStorage errors in console
- [ ] Data retrieves correctly on reload
- [ ] Works in normal browsing mode
- [ ] Handles Private Browsing gracefully

**Expected Result:** localStorage works reliably

---

### 4.4 Date and Time Handling

**Test Procedure:**
1. Check timestamp displays
2. Verify relative time ("2 hours ago")
3. Test uptime formatting

**Verification Points:**
- [ ] Dates parse correctly (ISO 8601)
- [ ] Times display in correct timezone
- [ ] Relative time updates correctly
- [ ] Uptime format is readable (1d 2h 30m)
- [ ] No date parsing errors in console

**Expected Result:** All dates and times display correctly

---

### 4.5 Network and API Calls

**Test Procedure:**
1. Open Safari Developer Tools
2. Monitor Network tab
3. Watch API calls during polling

**Verification Points:**
- [ ] Fetch API works correctly
- [ ] Requests complete successfully
- [ ] Response parsing works
- [ ] Error handling works (test by disabling network)
- [ ] Retry logic functions correctly
- [ ] No CORS errors
- [ ] Request deduplication works

**Expected Result:** Network requests function properly

---

## Part 5: Performance Testing

### 5.1 Page Load Performance

**Test Procedure:**
1. Clear Safari cache
2. Load dashboard page
3. Measure time to interactive

**Verification Points:**
- [ ] Dashboard loads in <2 seconds
- [ ] First Contentful Paint <1.5s
- [ ] Largest Contentful Paint <2.0s
- [ ] No layout shift during load
- [ ] Charts animate in smoothly
- [ ] No blocking JavaScript
- [ ] Images load efficiently

**Expected Result:** Fast page load meeting performance targets

---

### 5.2 Runtime Performance

**Test Procedure:**
1. Keep dashboard open for 5 minutes
2. Monitor performance in Dev Tools
3. Check memory usage

**Verification Points:**
- [ ] Smooth animations (60fps)
- [ ] No memory leaks
- [ ] CPU usage is reasonable
- [ ] Battery usage is acceptable (iOS)
- [ ] Polling doesn't degrade performance
- [ ] No frame drops during updates

**Expected Result:** Consistent performance over time

---

### 5.3 Stress Testing

**Test Procedure:**
1. Open multiple dashboard tabs
2. Switch between tabs rapidly
3. Leave tabs inactive then return

**Verification Points:**
- [ ] Multiple tabs don't slow down browser
- [ ] Inactive tabs pause polling
- [ ] Returning to tab resumes correctly
- [ ] No crashed tabs
- [ ] Memory usage is reasonable

**Expected Result:** Application handles multiple tabs gracefully

---

## Part 6: Edge Cases and Error Handling

### 6.1 Network Errors

**Test Procedure:**
1. Enable Airplane Mode on iOS
2. Wait for failed requests
3. Re-enable network

**Verification Points:**
- [ ] Error states display properly
- [ ] Last known data persists
- [ ] Retry mechanism works
- [ ] Exponential backoff functions
- [ ] User is informed of issues
- [ ] Recovery is automatic

**Expected Result:** Graceful error handling and recovery

---

### 6.2 Slow Network

**Test Procedure:**
1. Enable network throttling (3G speed)
2. Navigate through application
3. Test all features

**Verification Points:**
- [ ] Application remains usable
- [ ] Loading indicators appear
- [ ] Timeouts are appropriate
- [ ] No frozen UI
- [ ] User can still interact
- [ ] Requests complete eventually

**Expected Result:** Application works on slow connections

---

### 6.3 Battery Saver Mode (iOS)

**Test Procedure:**
1. Enable Low Power Mode on iPhone
2. Use application normally
3. Monitor behavior

**Verification Points:**
- [ ] Application still functions
- [ ] Animations may be reduced (expected)
- [ ] Polling continues (may slow down)
- [ ] No crashes or errors
- [ ] User experience is acceptable

**Expected Result:** Works in Low Power Mode with minor degradation

---

## Part 7: Accessibility (Safari VoiceOver)

### 7.1 macOS VoiceOver

**Test Procedure:**
1. Enable VoiceOver (Cmd+F5)
2. Navigate using keyboard (Tab, Arrow keys)
3. Test interactive elements

**Verification Points:**
- [ ] All elements have proper labels
- [ ] Charts announce current values
- [ ] Status changes are announced
- [ ] Navigation is logical
- [ ] Focus indicators are visible
- [ ] Buttons are accessible
- [ ] Form inputs are labeled

**Expected Result:** Full keyboard and screen reader accessibility

---

### 7.2 iOS VoiceOver

**Test Procedure:**
1. Enable VoiceOver on iPhone
2. Swipe to navigate elements
3. Test touch interactions

**Verification Points:**
- [ ] All touch targets are accessible
- [ ] Swipe navigation works
- [ ] Elements announce correctly
- [ ] Status updates are announced
- [ ] Navigation is intuitive
- [ ] No inaccessible content
- [ ] Proper reading order

**Expected Result:** Complete iOS VoiceOver support

---

## Known Safari-Specific Issues and Solutions

### Issue 1: Date Parsing
**Problem:** Safari rejects dates not in strict ISO 8601 format  
**Solution:** Always use `new Date(isoString)` with proper format

### Issue 2: localStorage in Private Mode
**Problem:** localStorage throws exceptions in Private Browsing  
**Solution:** Wrapped in try-catch with feature detection

### Issue 3: 300ms Tap Delay
**Problem:** Default delay on touch events  
**Solution:** `touch-action: manipulation` in CSS

### Issue 4: Rubber Band Scrolling
**Problem:** Page bounces at scroll boundaries  
**Solution:** Expected iOS behavior, no fix needed

### Issue 5: Viewport Height on iOS
**Problem:** Viewport height changes with Safari chrome  
**Solution:** Use `min-height: 100vh` or `dvh` units

---

## Reporting Issues

### Bug Report Template

**Title:** [Safari] Brief description

**Environment:**
- Browser: Safari 17.1 (macOS) / Mobile Safari (iOS 17.1)
- Device: MacBook Pro M1 / iPhone 14 Pro
- Screen Size: 1920x1080 / 393x852
- OS Version: macOS 14.1 / iOS 17.1

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
Include screenshots if visual issue

**Console Errors:**
Any JavaScript errors from console

---

## Test Completion Checklist

### macOS Safari
- [ ] All core features work correctly
- [ ] Real-time polling functions
- [ ] Language switching works
- [ ] Dark theme renders properly
- [ ] SVG charts display correctly
- [ ] CSS features work
- [ ] Performance is acceptable
- [ ] No console errors

### iOS Safari (iPhone)
- [ ] Mobile layout is correct
- [ ] Touch targets are adequate
- [ ] Scrolling is smooth
- [ ] Gestures work properly
- [ ] Keyboard interactions work
- [ ] Portrait mode tested
- [ ] Landscape mode tested
- [ ] Performance is acceptable

### iOS Safari (iPad)
- [ ] Tablet layout is correct
- [ ] Touch interactions work
- [ ] Scrolling is smooth
- [ ] Portrait mode tested
- [ ] Landscape mode tested
- [ ] Performance is acceptable

### Edge Cases
- [ ] Network errors handled
- [ ] Slow network tested
- [ ] Battery saver mode tested
- [ ] Private browsing tested
- [ ] Multiple tabs tested

### Accessibility
- [ ] macOS VoiceOver tested
- [ ] iOS VoiceOver tested
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

---

## Sign-Off

**Tester Name:** _______________________  
**Date:** _______________________  
**Safari Version (macOS):** _______________________  
**iOS Version:** _______________________  
**Result:** ☐ Pass ☐ Pass with Issues ☐ Fail  

**Notes:**
_______________________
_______________________
_______________________

