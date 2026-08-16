# Test Suite Diagnosis & Action Plan

## Current Situation

**Test Suite Status**: CRITICAL - 59 failures + hanging/timeout issues

**Evidence-Based Analysis**:

### 1. Test Execution Hanging/Timeout
- **Symptom**: Tests queued indefinitely or timeout after 30-180s
- **Affected**: Multiple test files including dashboard-responsive, revoke-session-button
- **Root Cause Analysis**:
  - JSDOM limitation: "Not implemented: navigation to another Document"
  - Possible infinite loop or unresolved promises in async Server Components
  - Test setup may have introduced side effects

### 2. Confirmed Production Code Issues

#### ✅ FIXED: HTML Nesting (1 test failure)
**File**: `components/admin/sessions/revoke-session-button.tsx`  
**Issue**: `<p>` tags nested inside `AlertDialogDescription` (which renders `<p>`)  
**Fix Applied**: Changed inner `<p>` to `<div>` tags  
**Status**: Code fixed, test still hangs for other reasons

### 3. Environment Configuration
**File**: `vitest.setup.ts`  
**Change Applied**: Added `process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'`  
**Impact**: Unknown - suite hangs before we can verify
**Removed**: `global.fetch = vi.fn()` mock (caused immediate hanging)

### 4. Working Tests (Baseline)
✅ `components/admin/users/refresh-button.test.tsx` → 9/9 PASS  
✅ `components/admin/xray/instances/instance-stats-card.test.tsx` → 15/15 PASS  
✅ `components/admin/xray/instances/instance-health-card.test.tsx` → 14/14 PASS  

These confirm test infrastructure works for properly written tests.

## Root Cause Categories (From Earlier Analysis)

From initial `npm test` run before hanging:

### Category A: API Client URL/Fetch (10-15 tests)
**Error**: `Failed to parse URL from /api/admin/system/stats`  
**Tests Affected**:
- `app/admin/dashboard-responsive.test.tsx` (10/10 failures)
- Related Server Component tests

**Analysis**:
- API client tries to call `fetch()` with relative URLs
- In test environment (JSDOM), `typeof window !== 'undefined'`  
- But `window.location.origin` may not be properly set
- Server-side logic expects `NEXT_PUBLIC_SITE_URL` or localhost URL

### Category B: Async Server Component (10-15 tests)
**Error**: `<DashboardPage> is an async Client Component. Only Server Components can be async`  
**Tests Affected**:
- `app/admin/dashboard-responsive.test.tsx`
- Other Server Component page tests

**Analysis**:
- Tests try to render async Server Components directly
- React Testing Library cannot handle async Server Components
- Tests need to either:
  1. Mock the async data fetching
  2. Create sync wrapper components for testing
  3. Test the rendered HTML output (integration test approach)

### Category C: Router/Navigation Mock (13 tests)
**Error**: `Not implemented: navigation to another Document`  
**Tests Affected**:
- `app/admin/users/[id]/page.test.tsx` (13/15 failures)

**Analysis**:
- JSDOM doesn't support full browser navigation
- Next.js router methods need proper mocking
- Tests call router.push(), router.refresh() without proper mocks

### Category D: Component-Specific (~20 tests)
Various individual test failures in:
- `components/admin/logs/audit-filters.test.tsx` (7 failures)
- `components/admin/xray/inbounds/inbounds-table.test.tsx` (8/9 failures)
- `components/admin/plans/plans-table.test.tsx` (6/7 failures)
- `components/admin/dashboard/activity-feed.test.tsx` (4/12 failures)
- Others

## Critical Decision Point

**Problem**: Test suite hangs before we can gather detailed failure information.

**Cannot proceed with systematic fixes until hanging is resolved.**

## Immediate Action Required

### Option 1: Isolate Hanging Cause
1. Disable all test files
2. Enable one category at a time
3. Identify which test file/pattern causes hanging
4. Fix that specific issue first

### Option 2: Test Infrastructure Overhaul
1. Review vitest.config.ts for proper timeout/environment setup
2. Check if MSW (Mock Service Worker) should be used for API mocking
3. Verify Next.js specific test setup requirements
4. Compare with working Next.js test examples

### Option 3: Selective Testing
1. Skip problematic async Server Component tests temporarily
2. Fix component-level tests first (these are working)
3. Address Server Component testing strategy separately
4. Build comprehensive mock layer for API calls

## Recommendation

**I recommend Option 1** - Systematically isolate the hanging cause.

**Rationale**:
- 38 tests passed in earlier runs before hanging
- Working tests prove infrastructure is functional
- Something specific causes the hang (likely async/navigation related)
- Once hanging is fixed, we can see real failure messages
- Then apply evidence-based fixes category by category

## Next Steps if User Approves Option 1

1. Create a minimal vitest.config.ts with single test file
2. Test each category independently:
   - Component tests (known working)
   - Server Component page tests (likely hanging)
   - API route tests
3. Identify exact hanging test
4. Fix that specific test pattern
5. Re-enable all tests
6. Proceed with systematic category fixes

## Blocker Status

🔴 **BLOCKED**: Cannot proceed with 59 failure fixes until hanging is resolved  
🔴 **GO/NO-GO**: NO-GO - Test suite not stable enough to verify fixes

---

**Date**: 2026-08-16  
**Test Suite Target**: 0 failures, 0 timeouts, <60s total execution  
**Current**: 59 failures, infinite hangs, 180s+ timeout
