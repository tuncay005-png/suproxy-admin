# End-to-End Manual Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the Admin Dashboard application.

**Test Environment**: Development (http://localhost:3000)
**Backend**: Go backend running (http://localhost:8080)
**Test User**: admin@suproxy.com

---

## 1. Authentication Flow Testing

### 1.1 Login - Valid Credentials
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter email: `admin@suproxy.com`
- [ ] Enter valid password
- [ ] Click "Sign in to your account" button
- [ ] **Expected**: Redirect to `/admin` dashboard
- [ ] **Expected**: No console errors
- [ ] **Expected**: session_token cookie set

### 1.2 Login - Invalid Credentials
- [ ] Navigate to `/login`
- [ ] Enter email: `admin@suproxy.com`
- [ ] Enter wrong password: `wrongpassword`
- [ ] Click "Sign in"
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Stay on login page
- [ ] **Expected**: No console errors

### 1.3 Login - Validation Errors
- [ ] Navigate to `/login`
- [ ] Leave email empty, click "Sign in"
- [ ] **Expected**: Email validation error shown
- [ ] Enter invalid email: `notanemail`
- [ ] **Expected**: "Invalid email address" error
- [ ] Enter valid email, leave password empty
- [ ] **Expected**: Password validation error shown

### 1.4 Protected Route Access
- [ ] Clear cookies/logout if logged in
- [ ] Navigate to `/admin` without authentication
- [ ] **Expected**: Redirect to `/login?from=/admin`
- [ ] Navigate to `/admin/users`
- [ ] **Expected**: Redirect to `/login?from=/admin/users`

### 1.5 Logout Flow
- [ ] Login successfully
- [ ] Navigate to `/admin`
- [ ] Click logout button (icon in header)
- [ ] **Expected**: Redirect to `/login`
- [ ] **Expected**: session_token cookie cleared
- [ ] Try to access `/admin` again
- [ ] **Expected**: Redirect to `/login`

---

## 2. Dashboard Page Testing

### 2.1 Dashboard Display
- [ ] Login and navigate to `/admin`
- [ ] **Expected**: Dashboard page loads
- [ ] **Expected**: No console errors
- [ ] **Expected**: Four stat cards visible
- [ ] **Expected**: Activity feed section visible
- [ ] **Expected**: Quick actions section visible

### 2.2 Stat Cards
- [ ] Verify "Total Users" card shows number or "—"
- [ ] Verify "Active Servers" card shows number or "—"
- [ ] Verify "Active Plans" card shows number or "—"
- [ ] Verify "System Status" card shows status or "—"
- [ ] Check descriptions under each stat
- [ ] **Expected**: No "undefined" or "null" text

### 2.3 Activity Feed
- [ ] Check "Recent Activity" card
- [ ] **Expected**: Either activity list or "No recent activity" message
- [ ] **Expected**: Clean display (no errors)

### 2.4 Quick Actions
- [ ] Check "Quick Actions" card
- [ ] Click "Create User" button
- [ ] **Expected**: Navigate to `/admin/users/new`

### 2.5 Dashboard Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Expected**: Stat cards stack vertically (1 column)
- [ ] **Expected**: Sidebar hidden, menu button visible
- [ ] Resize to tablet width (768px - 1024px)
- [ ] **Expected**: 2 stat cards per row
- [ ] Resize to desktop width (> 1024px)
- [ ] **Expected**: 4 stat cards in a row

---

## 3. Users List Page Testing

### 3.1 User List Display
- [ ] Navigate to `/admin/users`
- [ ] **Expected**: User list table visible
- [ ] **Expected**: At least one user (admin@suproxy.com) shown
- [ ] **Expected**: Table columns: Email, Name, Role, Created, Actions

### 3.2 User Table Data
- [ ] Verify admin user shows correct email
- [ ] Verify name displayed (or "—" if not set)
- [ ] Verify role badge displays "admin"
- [ ] Verify created date formatted correctly
- [ ] Verify "View" button present for each user

### 3.3 Search Functionality
- [ ] Type in search box: "admin"
- [ ] **Expected**: Filter updates (debounced after ~300ms)
- [ ] **Expected**: Only matching users shown
- [ ] Clear search box
- [ ] **Expected**: All users shown again
- [ ] Type non-existent email: "nonexistent@test.com"
- [ ] **Expected**: "No users found" empty state

### 3.4 Refresh Functionality
- [ ] Click refresh button in page header
- [ ] **Expected**: Loading state shown briefly
- [ ] **Expected**: User list reloads
- [ ] **Expected**: No console errors

### 3.5 Empty State
(Skip if users exist - test only if list is empty)
- [ ] If no users shown (after filter or naturally empty)
- [ ] **Expected**: "No users found" message
- [ ] **Expected**: "Create User" button visible
- [ ] Click "Create User"
- [ ] **Expected**: Navigate to `/admin/users/new`

### 3.6 User List Responsive
- [ ] Resize to mobile width
- [ ] **Expected**: Table scrolls horizontally if needed
- [ ] **Expected**: Some columns hidden on small screens
- [ ] Resize to desktop
- [ ] **Expected**: All columns visible

---

## 4. User Detail Page Testing

### 4.1 View User Details
- [ ] From users list, click "View" for admin user
- [ ] **Expected**: Navigate to `/admin/users/[uuid]`
- [ ] **Expected**: User detail page loads
- [ ] **Expected**: No 404 error
- [ ] **Expected**: No console errors

### 4.2 User Detail Display
- [ ] Verify user email displayed
- [ ] Verify full name displayed (or N/A)
- [ ] Verify role displayed with badge
- [ ] Verify "Member Since" date displayed
- [ ] Verify User ID (UUID) displayed

### 4.3 Navigation
- [ ] Click back button (arrow icon)
- [ ] **Expected**: Return to `/admin/users`
- [ ] Navigate back to user detail page
- [ ] Click "Users" in sidebar
- [ ] **Expected**: Return to users list

### 4.4 Actions Section
- [ ] Check "Actions" card
- [ ] **Expected**: Three disabled buttons: Edit User, Reset Password, Delete User
- [ ] **Expected**: Message explaining functionality is view-only

---

## 5. User Creation Page Testing

### 5.1 Navigate to Create User
- [ ] Navigate to `/admin/users/new`
- [ ] **Expected**: User creation form visible
- [ ] **Expected**: Form fields: Email, Password, First Name, Last Name, Role
- [ ] **Expected**: Submit button present

### 5.2 Form Validation - Empty Fields
- [ ] Leave all fields empty
- [ ] Click "Create User" button
- [ ] **Expected**: Validation errors for required fields
- [ ] **Expected**: Submit button disabled until errors resolved

### 5.3 Form Validation - Invalid Email
- [ ] Enter invalid email: "notanemail"
- [ ] Fill other fields
- [ ] **Expected**: Email validation error
- [ ] Enter valid email
- [ ] **Expected**: Error clears

### 5.4 Form Validation - Weak Password
- [ ] Enter password less than 8 characters: "pass"
- [ ] **Expected**: Password validation error
- [ ] Enter valid password (8+ characters)
- [ ] **Expected**: Error clears

### 5.5 Form Validation - Invalid Names
- [ ] Enter first name with 1 character: "A"
- [ ] **Expected**: Name validation error (min 2 chars)
- [ ] Enter valid names
- [ ] **Expected**: Errors clear

### 5.6 Successful User Creation
Note: Backend must support POST /api/v1/admin/users or creation will fail with 404

- [ ] Fill all fields with valid data:
  - Email: `testuser@example.com`
  - Password: `SecurePass123!`
  - First Name: `Test`
  - Last Name: `User`
  - Role: `user` (dropdown)
- [ ] Click "Create User"
- [ ] **Expected**: Loading state shown on button
- [ ] **Expected**: Success toast notification appears
- [ ] **Expected**: Redirect to `/admin/users` OR form clears
- [ ] Navigate to users list
- [ ] **Expected**: New user appears in table

### 5.7 Duplicate User Error
- [ ] Try to create user with existing email: `admin@suproxy.com`
- [ ] **Expected**: Error toast/message about duplicate
- [ ] **Expected**: Form input preserved for correction
- [ ] **Expected**: No navigation away from form

### 5.8 Network Error Handling
- [ ] Fill form with valid data
- [ ] Stop backend server temporarily
- [ ] Click "Create User"
- [ ] **Expected**: Error toast about network/server error
- [ ] **Expected**: Form input preserved
- [ ] Restart backend
- [ ] Click "Create User" again
- [ ] **Expected**: Success

---

## 6. Navigation and Layout Testing

### 6.1 Sidebar Navigation
- [ ] Click "Dashboard" in sidebar
- [ ] **Expected**: Navigate to `/admin`
- [ ] **Expected**: "Dashboard" highlighted
- [ ] Click "Users"
- [ ] **Expected**: Navigate to `/admin/users`
- [ ] **Expected**: "Users" highlighted
- [ ] Try clicking disabled items (Servers, Plans, etc.)
- [ ] **Expected**: No action (items disabled)

### 6.2 Mobile Navigation
- [ ] Resize to mobile width (< 768px)
- [ ] **Expected**: Sidebar hidden
- [ ] **Expected**: Menu button visible in header
- [ ] Click menu button
- [ ] **Expected**: Sidebar appears
- [ ] Click outside sidebar or menu button again
- [ ] **Expected**: Sidebar closes

### 6.3 Header User Menu
- [ ] Check header shows "Administrator" and "admin@suproxy.com"
- [ ] **Expected**: User info hidden on mobile, visible on desktop

---

## 7. Theme Testing (Dark Mode)

### 7.1 Theme Toggle
- [ ] Click sun/moon icon in header
- [ ] **Expected**: Dropdown menu appears
- [ ] **Expected**: Three options: Light, Dark, System

### 7.2 Switch to Dark Mode
- [ ] Select "Dark" from theme menu
- [ ] **Expected**: Background turns dark
- [ ] **Expected**: Text turns light
- [ ] **Expected**: All UI elements adapt
- [ ] **Expected**: Good contrast maintained
- [ ] Check all pages in dark mode:
  - [ ] Dashboard
  - [ ] Users list
  - [ ] User detail
  - [ ] Create user form
  - [ ] Login page

### 7.3 Switch to Light Mode
- [ ] Select "Light" from theme menu
- [ ] **Expected**: Background turns light
- [ ] **Expected**: Text turns dark
- [ ] **Expected**: All UI elements adapt

### 7.4 System Theme
- [ ] Select "System" from theme menu
- [ ] **Expected**: Theme matches OS preference
- [ ] Change OS theme (if possible)
- [ ] **Expected**: App theme updates automatically

### 7.5 Theme Persistence
- [ ] Switch to dark mode
- [ ] Refresh page
- [ ] **Expected**: Dark mode persists

---

## 8. Error Handling Testing

### 8.1 Global Error Boundary
- [ ] Test scenario that triggers React error (if possible)
- [ ] **Expected**: Error boundary catches error
- [ ] **Expected**: User-friendly error message
- [ ] **Expected**: "Try again" button present

### 8.2 API Error Logging
- [ ] Open browser console
- [ ] Trigger any API error (stop backend, then try to refresh users list)
- [ ] **Expected**: Detailed error logged to console with:
  - Endpoint URL
  - HTTP Method
  - Status code
  - Error message
  - Timestamp
- [ ] **Expected**: NO passwords or tokens logged
- [ ] **Expected**: User-friendly error shown in UI

### 8.3 Network Errors
- [ ] Stop backend server
- [ ] Try to refresh dashboard or users list
- [ ] **Expected**: Network error message displayed
- [ ] **Expected**: No "undefined" or raw error objects in UI
- [ ] Restart backend
- [ ] Refresh page
- [ ] **Expected**: Data loads correctly

### 8.4 Toast Notifications
- [ ] Create a user successfully (if backend supports it)
- [ ] **Expected**: Success toast appears
- [ ] **Expected**: Toast auto-dismisses after a few seconds
- [ ] Trigger an error (duplicate email)
- [ ] **Expected**: Error toast appears
- [ ] **Expected**: Toast auto-dismisses

---

## 9. Accessibility Testing

### 9.1 Keyboard Navigation
- [ ] Use Tab key to navigate through login form
- [ ] **Expected**: Focus indicators visible
- [ ] **Expected**: Logical tab order
- [ ] Use Tab through dashboard and users page
- [ ] **Expected**: All interactive elements reachable

### 9.2 Screen Reader (Optional)
- [ ] Enable screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Navigate through pages
- [ ] **Expected**: Labels and headings announced
- [ ] **Expected**: Form fields have proper labels
- [ ] **Expected**: Buttons have accessible names

### 9.3 ARIA Labels
- [ ] Inspect elements in DevTools
- [ ] Check buttons have aria-label where needed:
  - Logout button
  - Theme toggle
  - Menu button
  - Refresh button

---

## 10. Browser Console Testing

### 10.1 No Console Errors
During ALL testing above:
- [ ] Monitor browser console (F12)
- [ ] **Expected**: NO React hydration errors
- [ ] **Expected**: NO undefined variable errors
- [ ] **Expected**: NO API errors (except when intentionally triggered for testing)
- [ ] **Expected**: API errors (when they occur) are properly formatted

### 10.2 Network Tab
- [ ] Open Network tab
- [ ] Perform login
- [ ] **Expected**: POST to `/api/auth/login` succeeds (200)
- [ ] **Expected**: Cookies set correctly
- [ ] Navigate to dashboard
- [ ] **Expected**: API requests show proper status codes
- [ ] Check failed requests (if any)
- [ ] **Expected**: 401 for auth errors, 404 for missing endpoints, 500 for server errors

---

## 11. Security Testing

### 11.1 Session Cookie Inspection
- [ ] Open DevTools → Application → Cookies
- [ ] Find `session_token` cookie
- [ ] **Expected**: HttpOnly flag checked ✓
- [ ] **Expected**: SameSite = Lax
- [ ] **Expected**: Secure flag (in production only)
- [ ] In Console, run: `document.cookie`
- [ ] **Expected**: session_token NOT visible (httpOnly works)

### 11.2 XSS Prevention
- [ ] In any text input, enter: `<script>alert('XSS')</script>`
- [ ] **Expected**: Script NOT executed
- [ ] **Expected**: Displayed as text or sanitized

### 11.3 SQL Injection Prevention  
(Backend handles this, but test frontend input)
- [ ] In email field, enter: `admin' OR '1'='1`
- [ ] **Expected**: Treated as literal string
- [ ] **Expected**: Validation rejects invalid email format

---

## 12. Performance Testing

### 12.1 Page Load Times
- [ ] Navigate to `/admin`
- [ ] **Expected**: Page loads in < 2 seconds (dev mode)
- [ ] Navigate to `/admin/users`
- [ ] **Expected**: Reasonable load time

### 12.2 Interactions
- [ ] Type in search box
- [ ] **Expected**: Debounced, no lag
- [ ] Click buttons
- [ ] **Expected**: Immediate response or loading indicator

---

## Test Results Summary

### Pass/Fail Tracking
- Total Tests: ~100+
- Passed: ___
- Failed: ___
- Skipped: ___

### Critical Issues Found
(List any blocking issues)

### Non-Critical Issues Found
(List minor issues, nice-to-haves)

### Browser Tested
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

### Viewport Sizes Tested
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px+)

---

## Task 9.5 Status: ⚠️ REQUIRES USER EXECUTION

This is a manual testing checklist. The user must execute these tests in their browser to complete Task 9.5.

**Recommendation**: Go through each section systematically and check off completed items. Report any failures or issues discovered during testing.
