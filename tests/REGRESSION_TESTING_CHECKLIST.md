# Task 18.10: Final Regression Testing Checklist

This document provides a comprehensive manual testing checklist to verify that all existing functionality still works correctly after implementing the Full Admin Control Center.

## Test Execution Summary

- **Automated Tests**: 48 tests in `tests/integration/regression.test.tsx` ✅
- **Manual Tests**: Complete the checklist below
- **Test Environment**: Development server with backend running

## Prerequisites

Before starting manual tests:

1. ✅ Backend Go server is running on configured port
2. ✅ Database is populated with test data
3. ✅ Admin user credentials are available
4. ✅ Development server is running (`npm run dev`)
5. ✅ Browser console is open (F12) to check for errors

---

## 1. Existing User List and View Functionality (Admin Dashboard Spec)

### User List Page (`/admin/users`)

- [ ] **Test 1.1**: Navigate to `/admin/users` - Page loads without errors
- [ ] **Test 1.2**: User list displays with real data (not placeholder "—" values)
- [ ] **Test 1.3**: User table shows columns: Name, Email, Role, Status, Last Login, Actions
- [ ] **Test 1.4**: Search box filters users by name or email
- [ ] **Test 1.5**: Status badges display correct colors (active=green, inactive=gray, suspended=red)
- [ ] **Test 1.6**: Role badges display correctly (user/admin)
- [ ] **Test 1.7**: Click on user name/email navigates to user detail page
- [ ] **Test 1.8**: Actions dropdown shows: View, Edit, Delete options
- [ ] **Test 1.9**: Empty state displays when no users exist

### User Detail Page (`/admin/users/[id]`)

- [ ] **Test 1.10**: Navigate to user detail page - All user data displays correctly
- [ ] **Test 1.11**: User profile information is visible (name, email, phone, status, role)
- [ ] **Test 1.12**: Last login information displays correctly
- [ ] **Test 1.13**: Subscription information displays (if user has subscription)
- [ ] **Test 1.14**: "No Subscription" message shows when user has no plan
- [ ] **Test 1.15**: Edit button navigates to edit form
- [ ] **Test 1.16**: Delete button shows confirmation dialog
- [ ] **Test 1.17**: Status change dropdown works correctly
- [ ] **Test 1.18**: Role change dropdown works correctly

**Status**: ⬜ All user list/view tests passed

---

## 2. Login and Logout Functionality

### Login Flow

- [ ] **Test 2.1**: Navigate to `/login` - Login form displays
- [ ] **Test 2.2**: Enter valid admin credentials and click Login
- [ ] **Test 2.3**: Successful login redirects to `/admin` dashboard
- [ ] **Test 2.4**: Session cookie is set (check browser DevTools > Application > Cookies)
- [ ] **Test 2.5**: Enter invalid credentials - Error message displays
- [ ] **Test 2.6**: Validation errors show for empty email/password
- [ ] **Test 2.7**: Password field is masked (type="password")

### Logout Flow

- [ ] **Test 2.8**: Click logout button in navigation/user menu
- [ ] **Test 2.9**: Confirmation dialog appears (if implemented)
- [ ] **Test 2.10**: After logout, redirected to `/login` page
- [ ] **Test 2.11**: Session cookie is cleared
- [ ] **Test 2.12**: Attempting to access `/admin` redirects to login

### Session Persistence

- [ ] **Test 2.13**: Navigate between admin pages - Session persists
- [ ] **Test 2.14**: Refresh page - Session persists (no re-login needed)
- [ ] **Test 2.15**: Session expires after timeout - Redirects to login with message

**Status**: ⬜ All login/logout tests passed

---

## 3. Dashboard Layout Integrity

### Dashboard Page (`/admin`)

- [ ] **Test 3.1**: Dashboard loads without layout breaks
- [ ] **Test 3.2**: All 6 stat cards display correctly:
  - Total Users
  - Active Users
  - Servers
  - Plans
  - Xray Instances
  - Recent Actions
- [ ] **Test 3.3**: Stat cards show real numbers (not "—" placeholders)
- [ ] **Test 3.4**: Stat cards are clickable and navigate to correct pages
- [ ] **Test 3.5**: Activity feed shows recent audit logs (up to 10 items)
- [ ] **Test 3.6**: Activity feed displays timestamps, actions, and actors
- [ ] **Test 3.7**: Quick action buttons work (if present)
- [ ] **Test 3.8**: System health indicator shows correct status
- [ ] **Test 3.9**: Dashboard is responsive on mobile/tablet/desktop

### Navigation Sidebar

- [ ] **Test 3.10**: All navigation items are visible:
  - Dashboard
  - Users
  - Sessions
  - Xray (with submenu)
  - Servers
  - Plans
  - Logs
  - Monitoring
- [ ] **Test 3.11**: Active route is highlighted correctly
- [ ] **Test 3.12**: Xray submenu expands/collapses correctly
- [ ] **Test 3.13**: Icons display correctly for all items
- [ ] **Test 3.14**: Mobile: Hamburger menu shows/hides sidebar
- [ ] **Test 3.15**: Mobile: Clicking outside sidebar closes it

**Status**: ⬜ All dashboard layout tests passed

---

## 4. User CRUD Operations End-to-End

### Create User

- [ ] **Test 4.1**: Click "Create User" button on users list page
- [ ] **Test 4.2**: Navigate to `/admin/users/new` - Form displays
- [ ] **Test 4.3**: Fill in all required fields:
  - Email: `testuser@example.com`
  - Password: `SecurePass123`
  - First Name: `Test`
  - Last Name: `User`
  - Role: `user`
- [ ] **Test 4.4**: Click "Create User" button
- [ ] **Test 4.5**: Success toast notification appears
- [ ] **Test 4.6**: Redirected to users list page
- [ ] **Test 4.7**: New user appears in the list

### View User

- [ ] **Test 4.8**: Click on newly created user
- [ ] **Test 4.9**: User detail page displays all information correctly
- [ ] **Test 4.10**: Email matches created user
- [ ] **Test 4.11**: Status shows as "Active"
- [ ] **Test 4.12**: Role shows as "User"

### Edit User

- [ ] **Test 4.13**: Click "Edit" button on user detail page
- [ ] **Test 4.14**: Edit form loads with pre-populated data
- [ ] **Test 4.15**: Update first name to `UpdatedTest`
- [ ] **Test 4.16**: Update last name to `UpdatedUser`
- [ ] **Test 4.17**: Click "Save" button
- [ ] **Test 4.18**: Success toast notification appears
- [ ] **Test 4.19**: User detail page shows updated name
- [ ] **Test 4.20**: Changes persist after page refresh

### Change User Status

- [ ] **Test 4.21**: On user detail page, change status to "Inactive"
- [ ] **Test 4.22**: Success toast appears
- [ ] **Test 4.23**: Status badge updates to gray/inactive

### Change User Role

- [ ] **Test 4.24**: Change user role from "user" to "admin"
- [ ] **Test 4.25**: Success toast appears
- [ ] **Test 4.26**: Role badge updates

### Delete User

- [ ] **Test 4.27**: Click "Delete" button
- [ ] **Test 4.28**: Confirmation dialog appears with user email
- [ ] **Test 4.29**: Click "Cancel" - Dialog closes, user not deleted
- [ ] **Test 4.30**: Click "Delete" again, confirm deletion
- [ ] **Test 4.31**: Success toast appears
- [ ] **Test 4.32**: Redirected to users list
- [ ] **Test 4.33**: Deleted user no longer appears in list

### Self-Modification Prevention

- [ ] **Test 4.34**: View your own admin user profile
- [ ] **Test 4.35**: Try to change your own role to "user" - Error message displays
- [ ] **Test 4.36**: Try to delete your own account - Error message displays
- [ ] **Test 4.37**: Can edit your own name/email successfully

**Status**: ⬜ All user CRUD tests passed

---

## 5. Plan CRUD Operations End-to-End

### Create Plan

- [ ] **Test 5.1**: Navigate to `/admin/plans`
- [ ] **Test 5.2**: Click "Create Plan" button
- [ ] **Test 5.3**: Navigate to `/admin/plans/new` - Form displays
- [ ] **Test 5.4**: Fill in all required fields:
  - Name: `Test Plan`
  - Description: `Test plan description`
  - Price: `19.99`
  - Currency: `USD`
  - Duration: `30` days
  - Data Limit: `100` GB
  - Active: Checked
- [ ] **Test 5.5**: Click "Create Plan" button
- [ ] **Test 5.6**: Success toast notification appears
- [ ] **Test 5.7**: Redirected to plans list page
- [ ] **Test 5.8**: New plan appears in the list

### View Plan

- [ ] **Test 5.9**: Click on newly created plan
- [ ] **Test 5.10**: Plan detail page displays all information correctly
- [ ] **Test 5.11**: Price shows as "$19.99"
- [ ] **Test 5.12**: Duration shows as "30 days"
- [ ] **Test 5.13**: Data limit shows as "100 GB"
- [ ] **Test 5.14**: Active subscriptions count displays (should be 0)

### Edit Plan

- [ ] **Test 5.15**: Click "Edit" button on plan detail page
- [ ] **Test 5.16**: Edit form loads with pre-populated data
- [ ] **Test 5.17**: Update name to `Updated Test Plan`
- [ ] **Test 5.18**: Update price to `24.99`
- [ ] **Test 5.19**: Click "Save" button
- [ ] **Test 5.20**: Success toast notification appears
- [ ] **Test 5.21**: Plan detail page shows updated values
- [ ] **Test 5.22**: Changes persist after page refresh

### Toggle Plan Status

- [ ] **Test 5.23**: Toggle plan active status to "Inactive"
- [ ] **Test 5.24**: Success toast appears
- [ ] **Test 5.25**: Status badge updates

### Delete Plan (Without Subscriptions)

- [ ] **Test 5.26**: Click "Delete" button
- [ ] **Test 5.27**: Confirmation dialog appears showing 0 active subscriptions
- [ ] **Test 5.28**: Click "Cancel" - Dialog closes, plan not deleted
- [ ] **Test 5.29**: Click "Delete" again, confirm deletion
- [ ] **Test 5.30**: Success toast appears
- [ ] **Test 5.31**: Redirected to plans list
- [ ] **Test 5.32**: Deleted plan no longer appears in list

### Delete Plan (With Subscriptions) - If Test Data Available

- [ ] **Test 5.33**: View plan with active subscriptions
- [ ] **Test 5.34**: Click "Delete" button
- [ ] **Test 5.35**: Warning shows: "X active subscriptions will be affected"
- [ ] **Test 5.36**: Requires typing plan name for confirmation
- [ ] **Test 5.37**: Type incorrect name - Delete button stays disabled
- [ ] **Test 5.38**: Type correct name - Delete button enables
- [ ] **Test 5.39**: Or backend prevents deletion with error message

**Status**: ⬜ All plan CRUD tests passed

---

## 6. Xray Instance Operations End-to-End

### List Xray Instances

- [ ] **Test 6.1**: Navigate to `/admin/xray/instances`
- [ ] **Test 6.2**: Instances list displays with real data
- [ ] **Test 6.3**: Each instance shows: Name, Status, Server, Uptime, Actions
- [ ] **Test 6.4**: Status badges show correct colors (running=green, stopped=gray, error=red)
- [ ] **Test 6.5**: Uptime formats correctly (e.g., "2d 5h 30m")

### View Instance Detail

- [ ] **Test 6.6**: Click on an instance
- [ ] **Test 6.7**: Instance detail page loads
- [ ] **Test 6.8**: Health card displays status and last check time
- [ ] **Test 6.9**: Stats card shows connections, traffic, clients
- [ ] **Test 6.10**: Traffic numbers formatted with units (KB, MB, GB)
- [ ] **Test 6.11**: Auto-refresh toggle works (if implemented)

### Start Instance (If Stopped Instance Available)

- [ ] **Test 6.12**: Find a stopped instance
- [ ] **Test 6.13**: Click "Start" button
- [ ] **Test 6.14**: Button shows loading state
- [ ] **Test 6.15**: Success toast appears
- [ ] **Test 6.16**: Instance status updates to "starting" or "running"
- [ ] **Test 6.17**: Page refreshes with new status

### Stop Instance

- [ ] **Test 6.18**: Find a running instance
- [ ] **Test 6.19**: Click "Stop" button
- [ ] **Test 6.20**: Confirmation dialog appears with service interruption warning
- [ ] **Test 6.21**: Click "Cancel" - No change
- [ ] **Test 6.22**: Click "Stop" again, confirm
- [ ] **Test 6.23**: Button shows loading state
- [ ] **Test 6.24**: Success toast appears
- [ ] **Test 6.25**: Instance status updates to "stopping" or "stopped"

### Restart Instance

- [ ] **Test 6.26**: Find a running instance
- [ ] **Test 6.27**: Click "Restart" button
- [ ] **Test 6.28**: Button shows loading state
- [ ] **Test 6.29**: Success toast appears
- [ ] **Test 6.30**: Instance status briefly shows "starting" then "running"

### Reload Configuration

- [ ] **Test 6.31**: Click "Reload Config" button
- [ ] **Test 6.32**: Button shows loading state
- [ ] **Test 6.33**: Success toast appears
- [ ] **Test 6.34**: No downtime (status stays "running")

### Instance Health Check

- [ ] **Test 6.35**: Health status displays (healthy/unhealthy/unknown)
- [ ] **Test 6.36**: Uptime displayed in seconds
- [ ] **Test 6.37**: Last check timestamp displays
- [ ] **Test 6.38**: Error message shows if unhealthy

### Instance Statistics

- [ ] **Test 6.39**: Active connections count displays
- [ ] **Test 6.40**: Total connections count displays
- [ ] **Test 6.41**: Upload traffic displays with units
- [ ] **Test 6.42**: Download traffic displays with units
- [ ] **Test 6.43**: Active clients count displays
- [ ] **Test 6.44**: Total clients count displays

**Status**: ⬜ All Xray instance tests passed

---

## 7. No Console Errors During Normal Usage

### Clean Console During Navigation

- [ ] **Test 7.1**: Open browser console (F12)
- [ ] **Test 7.2**: Navigate to Dashboard - No errors in console
- [ ] **Test 7.3**: Navigate to Users - No errors
- [ ] **Test 7.4**: Navigate to Sessions - No errors
- [ ] **Test 7.5**: Navigate to Xray > Instances - No errors
- [ ] **Test 7.6**: Navigate to Xray > Inbounds - No errors
- [ ] **Test 7.7**: Navigate to Xray > Clients - No errors
- [ ] **Test 7.8**: Navigate to Servers - No errors
- [ ] **Test 7.9**: Navigate to Plans - No errors
- [ ] **Test 7.10**: Navigate to Logs - No errors
- [ ] **Test 7.11**: Navigate to Monitoring - No errors

### Clean Console During Form Operations

- [ ] **Test 7.12**: Open create user form - No errors
- [ ] **Test 7.13**: Fill and submit user form - No errors
- [ ] **Test 7.14**: Open edit user form - No errors
- [ ] **Test 7.15**: Submit edit form - No errors
- [ ] **Test 7.16**: Delete user - No errors
- [ ] **Test 7.17**: Create plan - No errors
- [ ] **Test 7.18**: Edit plan - No errors
- [ ] **Test 7.19**: Delete plan - No errors

### Clean Console During Data Fetching

- [ ] **Test 7.20**: Load users list - No errors
- [ ] **Test 7.21**: Load plans list - No errors
- [ ] **Test 7.22**: Load Xray instances - No errors
- [ ] **Test 7.23**: Load servers list - No errors
- [ ] **Test 7.24**: Load audit logs - No errors
- [ ] **Test 7.25**: Load monitoring page - No errors

### Console Checks

- [ ] **Test 7.26**: No 404 errors for assets (images, fonts, etc.)
- [ ] **Test 7.27**: No CORS errors
- [ ] **Test 7.28**: No "undefined" errors
- [ ] **Test 7.29**: No React warnings (key props, etc.)
- [ ] **Test 7.30**: No hydration errors
- [ ] **Test 7.31**: No Tailwind CSS warnings

**Status**: ⬜ Console is clean (no errors or warnings)

---

## 8. Additional Regression Checks

### Data Display (Not Placeholders)

- [ ] **Test 8.1**: Dashboard stat cards show numbers (not "—")
- [ ] **Test 8.2**: User list shows real data
- [ ] **Test 8.3**: Plans list shows real data
- [ ] **Test 8.4**: Servers list shows real data
- [ ] **Test 8.5**: Audit logs show real entries
- [ ] **Test 8.6**: Activity feed shows real logs

### Responsive Design

- [ ] **Test 8.7**: Test on mobile (320px-767px) - All pages work
- [ ] **Test 8.8**: Test on tablet (768px-1023px) - All pages work
- [ ] **Test 8.9**: Test on desktop (1024px+) - All pages work
- [ ] **Test 8.10**: Sidebar behavior correct on all viewports

### Keyboard Navigation

- [ ] **Test 8.11**: Tab through navigation items - Focus visible
- [ ] **Test 8.12**: Tab through form fields - Focus visible
- [ ] **Test 8.13**: Press Enter on buttons - Actions trigger
- [ ] **Test 8.14**: Press Escape - Dialogs close

### Loading States

- [ ] **Test 8.15**: Skeleton loaders display during navigation
- [ ] **Test 8.16**: Button loading spinners show during operations
- [ ] **Test 8.17**: Empty states display when no data

### Error Handling

- [ ] **Test 8.18**: Stop backend - Network error shows friendly message
- [ ] **Test 8.19**: Invalid session - Redirects to login
- [ ] **Test 8.20**: Validation errors - Show inline field errors
- [ ] **Test 8.21**: Server errors - Show generic error (not raw backend error)

**Status**: ⬜ All additional regression checks passed

---

## Overall Test Results

### Summary

- **Total Manual Tests**: ~150
- **Tests Passed**: ___
- **Tests Failed**: ___
- **Tests Blocked**: ___

### Issues Found

List any issues discovered during testing:

1. 
2. 
3. 

### Sign-Off

- [ ] All critical functionality works correctly
- [ ] No existing features are broken
- [ ] No console errors during normal usage
- [ ] Dashboard displays real data
- [ ] Authentication and session management working
- [ ] All CRUD operations functional
- [ ] Ready for production deployment

**Tester Name**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## Notes

- Run automated tests first: `npm run test tests/integration/regression.test.tsx -- --run`
- Keep browser console open during all manual tests
- Test with fresh database or known test data
- Document any issues found with screenshots
- Re-test any failed tests after fixes
