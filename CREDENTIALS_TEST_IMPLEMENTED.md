# credentials:'include' Test Implemented

## Evidence-Based Testing

I've implemented a two-stage test to determine if `credentials:'include'` is causing fetch() to throw.

## Test Implementation

### Test Sequence

The code now attempts fetch() twice:

**TEST 1**: WITHOUT `credentials:'include'`
```typescript
await fetch(url, {
  method: 'POST',
  // credentials: 'include',  ← OMITTED
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

**TEST 2**: WITH `credentials:'include'` (only if TEST 1 fails)
```typescript
await fetch(url, {
  method: 'POST',
  credentials: 'include',  ← INCLUDED
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

## Expected Console Output

### Scenario A: credentials:'include' IS the problem

```
[API-CLIENT] TEST 1: Attempting fetch WITHOUT credentials
[API-CLIENT] TEST 1 SUCCESS: fetch() returned with status: 200
[API-CLIENT] TEST 1: credentials was the problem
[API-CLIENT] JSON parsed successfully: { ... }
```

**Conclusion**: `credentials:'include'` was blocking the request
**Backend receives**: POST request (without credentials)
**Fix**: Remove `credentials:'include'` or fix CORS headers

### Scenario B: credentials:'include' is NOT the problem

```
[API-CLIENT] TEST 1: Attempting fetch WITHOUT credentials
[API-CLIENT] TEST 1 FAILED: fetch without credentials threw: TypeError: Failed to fetch
[API-CLIENT] Error type: TypeError
[API-CLIENT] Error message: Failed to fetch
[API-CLIENT] TEST 2: Attempting fetch WITH credentials:include
[API-CLIENT] TEST 2 FAILED: fetch with credentials threw: TypeError: Failed to fetch
[API-CLIENT] CONCLUSION: Both tests failed, issue is NOT credentials-related
```

**Conclusion**: Something else is blocking fetch() before it reaches the network
**Backend receives**: Nothing (neither TEST 1 nor TEST 2)
**Next steps**: Investigate browser security policy, URL format, mixed content

### Scenario C: Only TEST 1 fails, TEST 2 succeeds

```
[API-CLIENT] TEST 1: Attempting fetch WITHOUT credentials
[API-CLIENT] TEST 1 FAILED: fetch without credentials threw: TypeError: Failed to fetch
[API-CLIENT] TEST 2: Attempting fetch WITH credentials:include
[API-CLIENT] TEST 2 SUCCESS: fetch() returned with status: 200
[API-CLIENT] TEST 2: credentials is NOT the problem
```

**Conclusion**: Request requires `credentials:'include'` to succeed (unusual but possible)
**Backend receives**: POST request (with credentials)
**Current code works**: No change needed

## Why credentials:'include' Might Block

### CORS Requirements for credentials:'include'

When using `credentials:'include'` on cross-origin requests, the server MUST respond with:

```
Access-Control-Allow-Origin: http://localhost:3000  (NOT * wildcard)
Access-Control-Allow-Credentials: true
```

**If either is missing**, browser blocks the request and fetch() throws TypeError.

### Current Situation

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8080` (after diagnostic change)
- This IS cross-origin (different host)
- Requires CORS headers

### OPTIONS Preflight

- OPTIONS request succeeds → 204
- But OPTIONS might not check credentials policy
- POST with `credentials:'include'` has stricter requirements
- Browser might block POST even if OPTIONS succeeded

## What Backend Logs Will Show

### If TEST 1 succeeds

Backend should log:
```
POST /api/v1/auth/login - 200 OK
```

This proves fetch() reached the backend without credentials.

### If both tests fail

Backend logs:
```
(nothing - no POST request received)
```

This proves fetch() never left the browser.

## Next Steps Based on Results

### If TEST 1 succeeds

**Fix**: Remove `credentials:'include'` from the code

```typescript
const response = await fetch(url, {
  ...options,
  // Remove this line:
  // credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...options?.headers,
  },
});
```

**Why this works**:
- Backend doesn't need credentials for login (credentials are IN the request body)
- Session token is returned in response, not from existing cookie
- No need for `credentials:'include'` on login endpoint

**Impact**:
- Login will work
- Session cookie will be set by backend response
- Subsequent requests can use `credentials:'include'` (after login)

### If both tests fail

**Investigation needed**:
1. Check browser console for mixed content warnings
2. Test with `http://localhost:8080` instead of `http://127.0.0.1:8080`
3. Test in different browser
4. Test in incognito mode
5. Check if browser extension is blocking
6. Verify URL is valid HTTP (not HTTPS mixed with HTTP)
7. Check Windows Firewall

### If TEST 2 succeeds (unlikely)

**Current code works**: No change needed, but investigate why TEST 1 failed.

## How to Test

1. **Restart dev server** (if you changed 127.0.0.1)
   ```bash
   npm run dev
   ```

2. **Open browser** to `http://localhost:3000/login`

3. **Open DevTools** → Console tab

4. **Attempt login** with any credentials

5. **Read console output** to see which test succeeds/fails

6. **Check backend logs** to see if POST request arrived

## Evidence to Collect

From console output, determine:

- ✅ Does TEST 1 succeed? → credentials was the problem
- ✅ Does TEST 1 fail? → Continue to TEST 2
- ✅ Does TEST 2 succeed? → credentials is required (unusual)
- ✅ Do both fail? → Different issue, not credentials-related

From backend logs:

- ✅ Does backend receive POST? → Frontend issue resolved
- ❌ Does backend NOT receive POST? → Issue still exists

From Network tab:

- ✅ Does POST appear in Network tab? → Request was sent
- ❌ Does POST not appear? → Browser blocked before network

## Code Location

**File**: `lib/api/client.ts`
**Method**: `private async request<T>()`
**Lines**: ~220-320 (approximately)

## Rollback Plan

If this test causes issues, restore original code:

```typescript
const response = await fetch(url, {
  ...options,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...options?.headers,
  },
});
```

## Status

- ✅ Test code implemented
- ⏳ Awaiting test execution
- 📊 Will produce definitive evidence
- 🎯 Tests specific hypothesis: credentials:'include' blocking

---

**Date**: 2025-01-20
**Test**: credentials:'include' vs without
**Goal**: Determine if credentials option is blocking fetch()
**Method**: Try both options, log results
**Evidence**: Console output will show which succeeds/fails
