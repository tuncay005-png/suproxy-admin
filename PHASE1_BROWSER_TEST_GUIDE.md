# Phase 1 Browser Testing Guide

This guide walks you through testing the Phase 1 user management features in the browser.

## Prerequisites

1. **Backend Running**: `http://127.0.0.1:8080` (Terminal ID: 16)
2. **Admin UI Running**: `http://localhost:3000` (Terminal ID: 3)
3. **Admin Credentials**: admin@suproxy.com / Admin123!

---

## Test 1: User Creation

**URL**: http://localhost:3000/admin/users/new

1. Login to Admin UI with admin credentials
2. Navigate to Admin → Users → New User
3. Fill in the form:
   - Email: `browsertest@example.com`
   - Password: `Test123!`
   - Role: User
4. Click "Create User"
5. **Expected**: Redirects to users list, new user appears

✅ **Success Indicator**: User appears in the list with "active" status

---

## Test 2: Status Update

**URL**: http://localhost:3000/admin/users/[id]

1. Go to Admin → Users
2. Click on the `browsertest@example.com` user
3. In the user detail page, find the "Status" dropdown
4. Change status from "Active" to "Inactive"
5. **Expected**: Toast shows "User status updated successfully"
6. Page refreshes, status shows "inactive"

✅ **Success Indicator**: Status dropdown displays "Inactive"

---

## Test 3: Role Update

**URL**: http://localhost:3000/admin/users/[id]

1. On the same user detail page
2. Find the "Role" dropdown (currently "User")
3. Change role from "User" to "Admin"
4. **Expected**: Toast shows "User role updated successfully"
5. Page refreshes, role shows "admin"

✅ **Success Indicator**: Role dropdown displays "Admin"

---

## Test 4: Self-Demotion Protection

**URL**: http://localhost:3000/admin/users/[admin-id]

1. Go to Admin → Users
2. Click on your own admin user (admin@suproxy.com)
3. Try to change role from "Admin" to "User"
4. **Expected**: Error toast appears
5. Error message: "administrators cannot demote themselves" or similar

✅ **Success Indicator**: Error displayed, role unchanged

---

## Test 5: User Deletion

**URL**: http://localhost:3000/admin/users/[id]

1. Go back to the test user detail page (browsertest@example.com)
2. Scroll to the "Danger Zone" section
3. Click "Delete User" button
4. **Expected**: Confirmation dialog appears
5. Dialog asks "Are you absolutely sure?"
6. Click "Delete User" in the dialog
7. **Expected**: Toast shows "User deleted successfully"
8. Redirects to users list
9. Test user no longer appears in the list

✅ **Success Indicator**: User removed from list

---

## Test 6: Self-Deletion Protection

**URL**: http://localhost:3000/admin/users/[admin-id]

1. Go to Admin → Users
2. Click on your own admin user (admin@suproxy.com)
3. Try to delete your own account
4. **Expected**: Error toast appears
5. Error message: "administrators cannot delete themselves" or similar

✅ **Success Indicator**: Error displayed, account not deleted

---

## Expected Console Behavior

### Successful Operations
- Backend logs should show audit entries
- Browser console should be clean (no errors)
- Network tab shows 200 responses

### Self-Protection Violations
- Backend returns 400 or 403
- Browser displays error toast
- Network tab shows error response with message

---

## Troubleshooting

### "Failed to create user" (404)
- Check backend is running on port 8080
- Check Admin UI proxy routes exist

### "Authentication required" (401)
- Login again
- Check session cookie exists

### Status/Role updates don't save
- Check browser console for errors
- Check backend logs for database issues
- Verify PUT endpoints are registered

### Delete button not working
- Check AlertDialog component is installed
- Check browser console for React errors
- Verify DELETE endpoint is registered

---

## Quick Verification Commands

### Check Backend Running
```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/v1/health
```

### Check Admin UI Running
```powershell
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

### Login to Backend
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/v1/auth/login" -Method POST -Body '{"email":"admin@suproxy.com","password":"Admin123!"}' -ContentType "application/json"
```

---

## After Testing

Once all tests pass:
1. Clean up test users if desired
2. Review audit logs in the database
3. Mark Phase 1 as complete
4. Plan Phase 2 features

---

## Summary Checklist

- [ ] User creation works through UI
- [ ] Status updates work and persist
- [ ] Role updates work and persist
- [ ] Self-demotion is prevented
- [ ] User deletion works
- [ ] Self-deletion is prevented
- [ ] All operations show appropriate toasts
- [ ] Backend audit logs are created
- [ ] No console errors during normal operation

✅ **When all items checked**: Phase 1 is fully verified!
