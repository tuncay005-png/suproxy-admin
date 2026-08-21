# Task 18.4: Manual E2E CRUD Operations Testing Checklist

## Overview

This checklist complements the automated test suite and provides step-by-step instructions for manually testing all CRUD operations in a real browser environment with the Go backend running.

**Prerequisites:**
- ✅ Go backend running on http://localhost:8080
- ✅ Admin UI running on http://localhost:3000
- ✅ Logged in as admin user (admin@suproxy.com)
- ✅ Browser console open for monitoring

---

## 1. User Management CRUD Operations

### 1.1 Create User
- [ ] Navigate to `/admin/users`
- [ ] Click "Create User" button
- [ ] Fill form with valid data:
  - Email: `testuser-{timestamp}@example.com`
  - Password: `SecurePass123!`
  - First Name: `Test`
  - Last Name: `User`
  - Role: `user`
- [ ] Click "Create User"
- [ ] **Expected:** Success toast appears with message
- [ ] **Expected:** Redirect to users list OR form clears
- [ ] **Expected:** New user appears in users table
- [ ] **Expected:** No console errors

### 1.2 Edit User
- [ ] From users list, click "View" on the newly created user
- [ ] Click "Edit User" button (if available)
- [ ] Update First Name to `UpdatedTest`
- [ ] Update Last Name to `UpdatedUser`
- [ ] Click "Save Changes"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** User details update on page
- [ ] **Expected:** No console errors

### 1.3 Change User Status
- [ ] View user detail page
- [ ] Find status selector/button
- [ ] Change status from `active` to `inactive`
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Status badge updates to show "Inactive"
- [ ] **Expected:** No console errors
- [ ] Change status back to `active`
- [ ] **Expected:** Success toast appears again

### 1.4 Change User Role
- [ ] View user detail page
- [ ] Find role selector/button
- [ ] Change role from `user` to `admin`
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Role badge updates to show "Admin"
- [ ] **Expected:** No console errors
- [ ] Change role back to `user`
- [ ] **Expected:** Success toast appears again

### 1.5 Delete User
- [ ] From users list or detail page, click "Delete" button
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog shows user's email
- [ ] Click "Cancel"
- [ ] **Expected:** Dialog closes, user not deleted
- [ ] Click "Delete" again
- [ ] Confirm deletion
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirect to users list (if on detail page)
- [ ] **Expected:** User no longer appears in users table
- [ ] **Expected:** No console errors

### 1.6 Verify Data Refresh
- [ ] Navigate away from users page (e.g., to Dashboard)
- [ ] Navigate back to `/admin/users`
- [ ] **Expected:** Users list shows current data
- [ ] **Expected:** Deleted user is not in the list
- [ ] **Expected:** No console errors

---

## 2. Plan Management CRUD Operations

### 2.1 Create Plan
- [ ] Navigate to `/admin/plans`
- [ ] Click "Create Plan" button
- [ ] Fill form with valid data:
  - Name: `Test Plan {timestamp}`
  - Description: `Test subscription plan`
  - Price: `29.99`
  - Currency: `USD`
  - Duration Days: `30`
  - Data Limit GB: `100`
  - Active: `checked`
- [ ] Click "Create Plan"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirect to plans list OR form clears
- [ ] **Expected:** New plan appears in plans table
- [ ] **Expected:** No console errors

### 2.2 Edit Plan
- [ ] From plans list, click "View" or "Edit" on the newly created plan
- [ ] Update Name to `Updated Test Plan`
- [ ] Update Price to `39.99`
- [ ] Click "Save Changes"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Plan details update on page
- [ ] **Expected:** No console errors

### 2.3 Delete Plan (Without Subscriptions)
- [ ] From plans list or detail page, click "Delete" button
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog shows plan name
- [ ] **Expected:** Dialog shows "0 active subscriptions" or similar
- [ ] Click "Cancel"
- [ ] **Expected:** Dialog closes, plan not deleted
- [ ] Click "Delete" again
- [ ] Confirm deletion
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirect to plans list (if on detail page)
- [ ] **Expected:** Plan no longer appears in plans table
- [ ] **Expected:** No console errors

### 2.4 Attempt to Delete Plan (With Subscriptions)
**Note:** Skip if you don't have a plan with active subscriptions

- [ ] Try to delete a plan with active subscriptions
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog shows number of active subscriptions
- [ ] **Expected:** Dialog shows strong warning message
- [ ] **Expected:** May require typing plan name for confirmation
- [ ] Cancel the operation
- [ ] **Expected:** Plan remains in list

### 2.5 Verify Data Refresh
- [ ] Navigate away from plans page
- [ ] Navigate back to `/admin/plans`
- [ ] **Expected:** Plans list shows current data
- [ ] **Expected:** Deleted plan is not in the list
- [ ] **Expected:** No console errors

---

## 3. Xray Inbound Management CRUD Operations

### 3.1 Create Inbound
- [ ] Navigate to `/admin/xray/inbounds`
- [ ] Click "Create Inbound" button
- [ ] Fill form with valid data:
  - Instance: Select from dropdown
  - Protocol: `vless`
  - Port: `10443`
  - Tag: `test-inbound-{timestamp}`
  - Settings: (protocol-specific fields)
- [ ] Click "Create Inbound"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirect to inbounds list OR form clears
- [ ] **Expected:** New inbound appears in inbounds table
- [ ] **Expected:** No console errors

### 3.2 Edit Inbound
- [ ] From inbounds list, click "Edit" on the newly created inbound
- [ ] Update Port to `10444`
- [ ] Click "Save Changes"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Inbound details update
- [ ] **Expected:** No console errors

### 3.3 Enable Inbound
- [ ] From inbounds list, find the inbound
- [ ] If disabled, click toggle/enable button
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Enabled status updates to show "Enabled" or green indicator
- [ ] **Expected:** No console errors

### 3.4 Disable Inbound
- [ ] From inbounds list, find the same inbound
- [ ] Click toggle/disable button
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Enabled status updates to show "Disabled" or gray indicator
- [ ] **Expected:** No console errors

### 3.5 Delete Inbound
- [ ] From inbounds list, click "Delete" button on the inbound
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog may show number of affected clients (if any)
- [ ] Confirm deletion
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Inbound removed from table
- [ ] **Expected:** No console errors

### 3.6 Verify Data Refresh
- [ ] Navigate away and back to `/admin/xray/inbounds`
- [ ] **Expected:** Inbounds list shows current data
- [ ] **Expected:** No console errors

---

## 4. Xray Client Management CRUD Operations

### 4.1 Create Client
- [ ] Navigate to `/admin/xray/clients`
- [ ] Click "Create Client" button
- [ ] Fill form with valid data:
  - Email: `testclient-{timestamp}@example.com`
  - Inbound: Select from dropdown
- [ ] Click "Create Client"
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Client configuration displayed (connection URL, QR code)
- [ ] **Expected:** New client appears in clients list
- [ ] **Expected:** No console errors

### 4.2 Enable Client
- [ ] From clients list, find the newly created client
- [ ] If disabled, click toggle/enable button
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Enabled status updates
- [ ] **Expected:** No console errors

### 4.3 Disable Client
- [ ] From clients list, find the same client
- [ ] Click toggle/disable button
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Enabled status updates to show disabled
- [ ] **Expected:** No console errors

### 4.4 Regenerate UUID
- [ ] From clients list or detail page, click "Regenerate UUID" button
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Warning about invalidating existing configs
- [ ] Confirm action
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Client UUID updates in table/detail view
- [ ] **Expected:** No console errors

### 4.5 Reprovision Client
- [ ] From clients list or detail page, click "Reprovision" button
- [ ] **Expected:** Confirmation dialog appears
- [ ] Confirm action
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Client data refreshes
- [ ] **Expected:** No console errors

### 4.6 Delete Client
- [ ] From clients list, click "Delete" button on the client
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog shows client email
- [ ] Confirm deletion
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Client removed from table
- [ ] **Expected:** No console errors

### 4.7 Verify Data Refresh
- [ ] Navigate away and back to `/admin/xray/clients`
- [ ] **Expected:** Clients list shows current data
- [ ] **Expected:** No console errors

---

## 5. Session Management Operations

### 5.1 View Sessions
- [ ] Navigate to `/admin/sessions`
- [ ] **Expected:** Sessions table displays
- [ ] **Expected:** Current session is highlighted or marked
- [ ] **Expected:** Shows username, IP, user agent, timestamps
- [ ] **Expected:** No console errors

### 5.2 Revoke Single Session
**Note:** Only test on a non-current session if available

- [ ] From sessions list, click "Revoke" on a session (not your own)
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Warning if attempting to revoke own session
- [ ] Confirm revocation
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Session removed from table
- [ ] **Expected:** No console errors

### 5.3 Revoke All Sessions for User
- [ ] From user detail page or sessions page, click "Revoke All Sessions" for a user
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Dialog shows number of sessions to be revoked
- [ ] Confirm action
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Message shows number of revoked sessions
- [ ] **Expected:** Sessions list updates
- [ ] **Expected:** No console errors

### 5.4 Verify Data Refresh
- [ ] Navigate away and back to `/admin/sessions`
- [ ] **Expected:** Sessions list shows current data
- [ ] **Expected:** No console errors

---

## 6. Xray Instance Management Operations

### 6.1 View Instances
- [ ] Navigate to `/admin/xray/instances`
- [ ] **Expected:** Instances table displays
- [ ] **Expected:** Shows instance name, status, uptime, server
- [ ] **Expected:** No console errors

### 6.2 Start Instance
**Note:** Only if an instance is stopped

- [ ] From instances list, click "Start" on a stopped instance
- [ ] **Expected:** Button shows loading state
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Instance status updates to "running" or "starting"
- [ ] **Expected:** No console errors

### 6.3 Stop Instance
**Note:** Use with caution on production instances

- [ ] From instances list, click "Stop" on a running instance
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Warning about service interruption
- [ ] Confirm action
- [ ] **Expected:** Button shows loading state
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Instance status updates to "stopped" or "stopping"
- [ ] **Expected:** No console errors

### 6.4 Restart Instance
- [ ] From instances list, click "Restart" on a running instance
- [ ] **Expected:** Button shows loading state
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Instance status may briefly show "restarting"
- [ ] **Expected:** Instance returns to "running" status
- [ ] **Expected:** No console errors

### 6.5 Reload Configuration
- [ ] From instances list or detail page, click "Reload Config"
- [ ] **Expected:** Button shows loading state
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Message confirms configuration reloaded
- [ ] **Expected:** No console errors

### 6.6 View Instance Detail with Health and Stats
- [ ] Click on an instance to view details
- [ ] **Expected:** Instance detail page loads
- [ ] **Expected:** Health card displays (healthy/unhealthy/unknown)
- [ ] **Expected:** Stats card displays (connections, traffic, clients)
- [ ] **Expected:** Auto-refresh toggle available
- [ ] **Expected:** No console errors

### 6.7 Verify Data Refresh
- [ ] Navigate away and back to `/admin/xray/instances`
- [ ] **Expected:** Instances list shows current data
- [ ] **Expected:** Status reflects recent changes
- [ ] **Expected:** No console errors

---

## 7. Cross-Module Validation

### 7.1 Toast Notification Consistency
- [ ] Verify all successful operations show toast notifications
- [ ] Verify toasts auto-dismiss after a few seconds
- [ ] Verify toast messages are clear and descriptive
- [ ] Verify toasts have appropriate styling (success = green)

### 7.2 Loading States
- [ ] Verify buttons show loading spinners during operations
- [ ] Verify buttons are disabled during operations
- [ ] Verify loading states are removed after completion

### 7.3 Data Refresh Behavior
- [ ] Verify all list pages refresh after create operations
- [ ] Verify all list pages refresh after delete operations
- [ ] Verify detail pages refresh after update operations
- [ ] Verify state changes are immediately reflected

### 7.4 Error Handling
- [ ] Stop Go backend temporarily
- [ ] Try any CRUD operation
- [ ] **Expected:** User-friendly error message (network error)
- [ ] Restart Go backend
- [ ] Retry operation
- [ ] **Expected:** Operation succeeds

### 7.5 Confirmation Dialogs
- [ ] Verify all destructive actions show confirmation dialogs
- [ ] Verify dialogs can be cancelled
- [ ] Verify dialogs show relevant information (resource name, affected items)
- [ ] Verify confirming actually performs the action

---

## 8. Browser Console Check

### Throughout All Testing
- [ ] Monitor browser console (F12)
- [ ] **Expected:** No React errors
- [ ] **Expected:** No undefined/null errors
- [ ] **Expected:** No 500 errors (unless testing error handling)
- [ ] **Expected:** API requests show proper status codes
- [ ] **Expected:** No authentication errors (401)

---

## Test Results Summary

### Module Test Status

| Module | Create | Edit | Enable/Disable | Special Ops | Delete | Toast | Refresh |
|--------|--------|------|----------------|-------------|--------|-------|---------|
| Users | [ ] | [ ] | [ ] Status/Role | - | [ ] | [ ] | [ ] |
| Plans | [ ] | [ ] | - | - | [ ] | [ ] | [ ] |
| Inbounds | [ ] | [ ] | [ ] | - | [ ] | [ ] | [ ] |
| Clients | [ ] | - | [ ] | [ ] UUID/Reprov | [ ] | [ ] | [ ] |
| Sessions | - | - | - | [ ] Revoke/All | [ ] | [ ] | [ ] |
| Instances | - | - | - | [ ] Start/Stop/Restart/Reload | - | [ ] | [ ] |

### Overall Status
- **Total Checklist Items:** ~80
- **Completed:** ___
- **Failed:** ___
- **Skipped:** ___

### Issues Found
(Document any issues discovered during manual testing)

### Browser Information
- **Browser:** _______________
- **Version:** _______________
- **OS:** _______________
- **Screen Size:** _______________

---

## Conclusion

After completing this manual testing checklist:

1. ✅ All automated tests have passed (39/39)
2. ⬜ All manual tests have been executed
3. ⬜ All issues have been documented
4. ⬜ All CRUD operations verified working

**Task 18.4 Status:** To be confirmed after manual testing completion

---

**Related Documents:**
- Automated Test Report: `TASK_18.4_E2E_CRUD_TEST_REPORT.md`
- Automated Test Suite: `__tests__/e2e-crud-operations.test.tsx`
- General E2E Checklist: `E2E_MANUAL_TESTING_CHECKLIST.md`
