# Accessibility Manual Testing Guide - Task 17.4

## Overview

This guide provides step-by-step instructions for manually testing the accessibility features implemented in Task 17.4 to ensure compliance with Requirements 15.8-15.9 and WCAG 2.1 Level AA standards.

## Prerequisites

- Admin dashboard running locally (npm run dev)
- Keyboard only (no mouse for keyboard navigation tests)
- Screen reader software:
  - **Windows**: NVDA (free) - https://www.nvaccess.org/
  - **macOS**: VoiceOver (built-in) - Cmd+F5 to toggle
  - **Browser**: ChromeVox extension (optional)

## Test Suite 1: Keyboard Navigation

### Test 1.1: Tab Navigation Through All Elements

**Objective**: Verify all interactive elements are keyboard accessible

**Steps**:
1. Navigate to http://localhost:3000/admin
2. Press **Tab** repeatedly
3. Verify focus moves through elements in this order:
   - Skip to main content link (if present)
   - Theme toggle button
   - Logout button
   - Stat cards (if clickable)
   - Recent activity links
   - Quick action buttons
   - Sidebar navigation items

**Expected Result**:
- ✅ Focus indicator (ring) is visible on each element
- ✅ Focus order is logical (top to bottom, left to right)
- ✅ No elements are skipped or unreachable
- ✅ Focus ring has sufficient contrast against background

**Pass Criteria**: All interactive elements receive focus in a logical order with visible indicators.

---

### Test 1.2: Shift+Tab Backward Navigation

**Objective**: Verify reverse tab navigation works correctly

**Steps**:
1. On dashboard, press **Tab** several times to move focus forward
2. Press **Shift+Tab** to move focus backward
3. Verify focus moves in reverse order

**Expected Result**:
- ✅ Focus moves backward through elements
- ✅ Same elements are reached in reverse order

**Pass Criteria**: Shift+Tab navigates backward correctly.

---

### Test 1.3: Enter Key Activation

**Objective**: Verify Enter key activates buttons and links

**Steps**:
1. Navigate to dashboard
2. Press **Tab** until "Users" stat card is focused
3. Press **Enter**
4. Verify navigation to /admin/users page

**Expected Result**:
- ✅ Enter key activates focused link/button
- ✅ Page navigation occurs

**Pass Criteria**: Enter key successfully activates focused elements.

---

### Test 1.4: Escape Key to Close Sidebar

**Objective**: Verify Escape key closes mobile sidebar

**Steps**:
1. Resize browser to mobile width (< 768px)
2. Click hamburger menu button to open sidebar
3. Press **Escape** key

**Expected Result**:
- ✅ Sidebar closes when Escape is pressed
- ✅ Focus returns to menu button

**Pass Criteria**: Escape key closes the mobile sidebar.

---

### Test 1.5: Escape Key to Close Dialogs

**Objective**: Verify Escape key closes modal dialogs

**Steps**:
1. Navigate to /admin/users
2. Click "View" on any user
3. Click "Delete User" button
4. Press **Escape** key in confirmation dialog

**Expected Result**:
- ✅ Dialog closes when Escape is pressed
- ✅ Focus returns to trigger button

**Pass Criteria**: Escape key closes all dialogs.

---

### Test 1.6: Arrow Key Navigation in Dropdowns

**Objective**: Verify arrow keys navigate select dropdowns

**Steps**:
1. Navigate to /admin/users/new (Create User page)
2. Press **Tab** until "Role" dropdown is focused
3. Press **Enter** or **Space** to open dropdown
4. Press **Down Arrow** and **Up Arrow** keys
5. Press **Enter** to select an option

**Expected Result**:
- ✅ Down arrow moves to next option
- ✅ Up arrow moves to previous option
- ✅ Enter selects focused option and closes dropdown
- ✅ Escape closes dropdown without selection

**Pass Criteria**: Arrow keys navigate dropdown options correctly.

---

### Test 1.7: Form Submission with Enter Key

**Objective**: Verify Enter key submits forms

**Steps**:
1. Navigate to /admin/users/new
2. Fill in all required fields using Tab and typing
3. With focus in any text field, press **Enter**

**Expected Result**:
- ✅ Form submits when Enter is pressed in a text field
- ✅ Form validation runs if present
- ✅ Success/error message appears

**Pass Criteria**: Enter key submits the form.

---

## Test Suite 2: Screen Reader Announcements

### Test 2.1: Page Title Announcement

**Objective**: Verify page titles are announced by screen readers

**Steps**:
1. Start screen reader (NVDA or VoiceOver)
2. Navigate to http://localhost:3000/admin
3. Listen for heading announcement

**Expected Result**:
- ✅ Screen reader announces "Dashboard" heading level 1
- ✅ Screen reader announces page description

**Pass Criteria**: Screen reader correctly announces page title.

---

### Test 2.2: Navigation Landmark

**Objective**: Verify navigation landmark is announced

**Steps**:
1. With screen reader active, navigate to dashboard
2. Use landmarks navigation (NVDA: D key, VoiceOver: rotor)
3. Find "Main navigation" landmark

**Expected Result**:
- ✅ Screen reader announces "Main navigation" landmark
- ✅ Navigation items are listed properly

**Pass Criteria**: Navigation landmark is correctly identified.

---

### Test 2.3: Main Content Landmark

**Objective**: Verify main content landmark is announced

**Steps**:
1. With screen reader active, navigate to dashboard
2. Use landmarks navigation
3. Find "main" landmark

**Expected Result**:
- ✅ Screen reader announces "main" region
- ✅ Main content is inside this landmark

**Pass Criteria**: Main content landmark is correctly identified.

---

### Test 2.4: Form Label Announcements

**Objective**: Verify form labels are read correctly

**Steps**:
1. With screen reader active, navigate to /admin/users/new
2. Press **Tab** to move through form fields
3. Listen for label announcements

**Expected Result**:
- ✅ Screen reader announces "Email" for email field
- ✅ Screen reader announces "First Name" for first name field
- ✅ Screen reader announces "Password" for password field
- ✅ All labels are associated with their inputs

**Pass Criteria**: Screen reader announces all form labels correctly.

---

### Test 2.5: Button Label Announcements

**Objective**: Verify button labels are descriptive

**Steps**:
1. With screen reader active, navigate to dashboard
2. Press **Tab** to reach logout button (icon only)
3. Listen for button label

**Expected Result**:
- ✅ Screen reader announces "Logout button"
- ✅ Button purpose is clear from label

**Pass Criteria**: Icon-only buttons have descriptive labels.

---

### Test 2.6: Section Announcements

**Objective**: Verify major sections are announced

**Steps**:
1. With screen reader active, navigate to dashboard
2. Use region navigation (NVDA: R key)
3. Find stat cards section

**Expected Result**:
- ✅ Screen reader announces "System statistics" region
- ✅ Screen reader announces "Recent activity and quick actions" region

**Pass Criteria**: Sections have proper aria-labels.

---

### Test 2.7: Table Structure

**Objective**: Verify table structure is announced correctly

**Steps**:
1. With screen reader active, navigate to /admin/users
2. Navigate to the users table
3. Move through table cells with screen reader

**Expected Result**:
- ✅ Screen reader announces "table with X rows"
- ✅ Column headers are announced
- ✅ Cell contents are read correctly

**Pass Criteria**: Table structure is properly conveyed.

---

## Test Suite 3: Focus Indicators

### Test 3.1: Button Focus Indicators

**Objective**: Verify buttons have visible focus rings

**Steps**:
1. Navigate to dashboard
2. Press **Tab** to focus various buttons
3. Observe focus ring visibility

**Expected Result**:
- ✅ Focus ring appears on all buttons
- ✅ Ring color contrasts with background (light and dark mode)
- ✅ Ring is 2px wide with offset

**Pass Criteria**: All buttons have visible focus indicators.

---

### Test 3.2: Link Focus Indicators

**Objective**: Verify links have visible focus rings

**Steps**:
1. Navigate to dashboard
2. Press **Tab** to focus stat card links
3. Observe focus ring visibility

**Expected Result**:
- ✅ Focus ring appears on all links
- ✅ Ring color contrasts with background

**Pass Criteria**: All links have visible focus indicators.

---

### Test 3.3: Form Input Focus Indicators

**Objective**: Verify form inputs have visible focus rings

**Steps**:
1. Navigate to /admin/users/new
2. Press **Tab** to focus form inputs
3. Observe focus ring visibility

**Expected Result**:
- ✅ Focus ring appears on all inputs
- ✅ Ring color contrasts with input background

**Pass Criteria**: All form inputs have visible focus indicators.

---

### Test 3.4: Dark Mode Focus Indicators

**Objective**: Verify focus indicators work in dark mode

**Steps**:
1. Click theme toggle to switch to dark mode
2. Repeat focus indicator tests from 3.1-3.3

**Expected Result**:
- ✅ Focus rings remain visible in dark mode
- ✅ Contrast is maintained

**Pass Criteria**: Focus indicators work in both light and dark modes.

---

## Test Suite 4: Touch Targets (Mobile)

### Test 4.1: Button Size on Mobile

**Objective**: Verify buttons meet 44px minimum touch target

**Steps**:
1. Resize browser to mobile width (< 768px)
2. Inspect button elements
3. Measure height using browser DevTools

**Expected Result**:
- ✅ All buttons are at least 44px in height
- ✅ Icon buttons are 44px × 44px

**Pass Criteria**: All buttons meet minimum touch target size.

---

### Test 4.2: Touch Target Spacing

**Objective**: Verify adequate spacing between touch targets

**Steps**:
1. On mobile view, observe button spacing
2. Try tapping buttons with finger (if on device)

**Expected Result**:
- ✅ Adequate spacing prevents accidental taps
- ✅ Gap between buttons is at least 8px

**Pass Criteria**: Touch targets have adequate spacing.

---

## Test Suite 5: ARIA Labels

### Test 5.1: Icon Button ARIA Labels

**Objective**: Verify all icon-only buttons have aria-label

**Steps**:
1. Inspect the following buttons in browser DevTools:
   - Header menu toggle
   - Sidebar close button
   - Logout button
   - Theme toggle button
   - Back buttons on detail pages

**Expected Result**:
- ✅ All icon-only buttons have `aria-label` attribute
- ✅ Labels are descriptive (e.g., "Open menu", "Logout")

**Pass Criteria**: All icon-only buttons have descriptive aria-labels.

---

### Test 5.2: Decorative Icons

**Objective**: Verify decorative icons are hidden from screen readers

**Steps**:
1. Inspect stat card icons in DevTools
2. Check for `aria-hidden="true"` attribute

**Expected Result**:
- ✅ Decorative icons have `aria-hidden="true"`
- ✅ Screen reader skips these icons

**Pass Criteria**: Decorative icons are marked as aria-hidden.

---

## Test Results Tracking

Use this table to track test results:

| Test ID | Test Name | Result | Notes |
|---------|-----------|--------|-------|
| 1.1 | Tab Navigation | ☐ Pass ☐ Fail | |
| 1.2 | Shift+Tab Navigation | ☐ Pass ☐ Fail | |
| 1.3 | Enter Key Activation | ☐ Pass ☐ Fail | |
| 1.4 | Escape Key (Sidebar) | ☐ Pass ☐ Fail | |
| 1.5 | Escape Key (Dialogs) | ☐ Pass ☐ Fail | |
| 1.6 | Arrow Key Navigation | ☐ Pass ☐ Fail | |
| 1.7 | Form Submission | ☐ Pass ☐ Fail | |
| 2.1 | Page Title Announcement | ☐ Pass ☐ Fail | |
| 2.2 | Navigation Landmark | ☐ Pass ☐ Fail | |
| 2.3 | Main Content Landmark | ☐ Pass ☐ Fail | |
| 2.4 | Form Label Announcements | ☐ Pass ☐ Fail | |
| 2.5 | Button Label Announcements | ☐ Pass ☐ Fail | |
| 2.6 | Section Announcements | ☐ Pass ☐ Fail | |
| 2.7 | Table Structure | ☐ Pass ☐ Fail | |
| 3.1 | Button Focus Indicators | ☐ Pass ☐ Fail | |
| 3.2 | Link Focus Indicators | ☐ Pass ☐ Fail | |
| 3.3 | Form Input Focus Indicators | ☐ Pass ☐ Fail | |
| 3.4 | Dark Mode Focus Indicators | ☐ Pass ☐ Fail | |
| 4.1 | Button Size on Mobile | ☐ Pass ☐ Fail | |
| 4.2 | Touch Target Spacing | ☐ Pass ☐ Fail | |
| 5.1 | Icon Button ARIA Labels | ☐ Pass ☐ Fail | |
| 5.2 | Decorative Icons | ☐ Pass ☐ Fail | |

## Common Issues and Fixes

### Issue: Focus indicator not visible
**Fix**: Ensure element has `focus-visible:ring-2 focus-visible:ring-ring` classes

### Issue: Screen reader not announcing label
**Fix**: Verify `aria-label` or associated `<label>` element exists

### Issue: Keyboard navigation skips element
**Fix**: Ensure element is focusable (button, link, or tabindex="0")

### Issue: Escape key not closing dialog
**Fix**: Verify Dialog component from shadcn/ui is used correctly

## Accessibility Tools

### Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Visual accessibility evaluation
- **Lighthouse**: Accessibility audit in Chrome DevTools

### Testing Commands
```bash
# Run automated accessibility tests
npm run test app/admin/accessibility.test.tsx

# Run all tests
npm run test
```

## References

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- NVDA User Guide: https://www.nvaccess.org/documentation/
- VoiceOver User Guide: https://support.apple.com/guide/voiceover/

## Completion Criteria

All tests in this guide must pass for Task 17.4 to be considered complete:
- ✅ Keyboard navigation works throughout the application
- ✅ Screen readers announce all content correctly
- ✅ Focus indicators are visible on all interactive elements
- ✅ Touch targets meet minimum 44px size
- ✅ All icon-only buttons have descriptive ARIA labels
