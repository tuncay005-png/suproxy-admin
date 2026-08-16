# Test Failure Analysis

## Failed Test Files (from partial output)

### 1. app/admin/dashboard-responsive.test.tsx - 10/10 FAILED
- **Root Cause**: URL parsing error in test environment
- **Error**: `Failed to parse URL from /api/admin/system/stats`
- **Pattern**: NETWORK_ERROR for all API calls
- **Issue**: Test setup problem - async Client Component + act() warnings

### 2. components/admin/logs/audit-filters.test.tsx - 7 FAILED
- **Pattern**: Date filter and pagination related

### 3. components/admin/users/user-edit-form.test.tsx - 1 FAILED
- **Test**: "should show validation error for invalid email"

### 4. components/admin/users/user-list-table-with-search.test.tsx - 1 FAILED  
- **Test**: "filters users by role"

### 5. components/admin/sessions/revoke-session-button.test.tsx - 1 FAILED
- **Error**: HTML validation - `<p>` cannot be descendant of `<p>`
- **Test**: "opens confirmation dialog when clicked"

### 6. app/admin/users/[id]/page.test.tsx - 13/15 FAILED
- **Error**: `Not implemented: navigation to another Document`
- **Pattern**: Navigation/routing not mocked properly

### 7. components/admin/layout/admin-nav.test.tsx - 1 FAILED
- **Test**: 'renders disabled items with "Coming Soon" label'

### 8. components/admin/xray/inbounds/inbounds-table.test.tsx - 8/9 FAILED

### 9. components/admin/plans/plans-table.test.tsx - 6/7 FAILED

### 10. app/admin/monitoring/page.test.tsx - 1/4 FAILED
- **Test**: "renders page header with correct title and description"

### 11. components/admin/dashboard/activity-feed.test.tsx - 4/12 FAILED

### 12. components/admin/xray/clients/clients-table.test.tsx - 5/6 FAILED

### 13. app/api/auth/sessions/route.test.ts - 1/6 FAILED

## Root Cause Categories

### Category A: Test Environment URL/Fetch Issues
- dashboard-responsive.test.tsx (10 failures)
- **Fix**: Mock fetch or setup test base URL properly

### Category B: HTML Structure Validation
- revoke-session-button.test.tsx (nested `<p>` tags)
- **Fix**: AlertDialog structure issue - remove nested paragraphs

### Category C: Navigation/Router Mocking
- app/admin/users/[id]/page.test.tsx (13 failures)
- **Fix**: Proper Next.js router mock setup

### Category D: Test Assertion/Logic Issues
- Various component tests with specific assertion failures
- Need individual investigation

## Next Steps
1. Fix Category A (URL/fetch setup) - will fix ~10 tests
2. Fix Category B (HTML structure) - will fix ~1 test  
3. Fix Category C (router mocking) - will fix ~13 tests
4. Investigate remaining ~35 failures individually
