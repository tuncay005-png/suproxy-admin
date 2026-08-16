# Diagnostic Test Applied: localhost → 127.0.0.1

## Change Made

**File**: `.env.local`

**Before**:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**After**:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

## Hypothesis Being Tested

**Issue**: Browser fetch() throws TypeError when POSTing to `http://localhost:8080`
**Hypothesis**: localhost resolves to IPv6 (::1) in browser, but backend only listens on IPv4 (127.0.0.1)

### Why This Might Be the Problem

1. **PowerShell Success**:
   - `Invoke-RestMethod` to `http://localhost:8080/api/v1/auth/login` works
   - PowerShell on Windows typically uses IPv4 by default
   - Connects to `127.0.0.1:8080` → Success

2. **Browser Failure**:
   - Modern browsers prefer IPv6 when available
   - `localhost` can resolve to both `127.0.0.1` (IPv4) and `::1` (IPv6)
   - Browser tries `::1:8080` (IPv6) first
   - If backend only listens on IPv4, connection fails
   - fetch() throws TypeError: "Failed to fetch"

3. **OPTIONS Success, POST Failure**:
   - This pattern is consistent with connection retry behavior
   - OPTIONS (lighter weight) might succeed on retry to IPv4
   - POST (with body) might fail before retry happens
   - Or browser gives up after OPTIONS and doesn't send POST

## Next Steps

### 1. Restart Next.js Development Server

**IMPORTANT**: Environment variables are read at build/start time.

```bash
# Stop the current dev server (Ctrl+C or kill the process)

# Start fresh
npm run dev
```

### 2. Clear Browser Cache (Optional but Recommended)

```
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
```

Or in Chrome: Ctrl+Shift+Delete → Clear cache

### 3. Test Login

1. Navigate to `http://localhost:3000/login`
2. Open DevTools → Console tab
3. Open DevTools → Network tab
4. Enter any credentials
5. Click "Sign In"

### 4. Observe Results

#### Expected Console Output

```
[API-CLIENT] Constructor - Environment diagnostics:
[API-CLIENT] NEXT_PUBLIC_API_BASE_URL: http://127.0.0.1:8080  ← Should show 127.0.0.1
[API-CLIENT] this.baseURL: http://127.0.0.1:8080
[API-CLIENT] window.location.origin: http://localhost:3000
[API-CLIENT] window.location.hostname: localhost
...
[API-CLIENT] URL: http://127.0.0.1:8080/api/v1/auth/login  ← Should use 127.0.0.1
[API-CLIENT] About to call fetch() with URL: http://127.0.0.1:8080/api/v1/auth/login
```

#### Expected Network Tab

**If Fix Works**:
- OPTIONS `http://127.0.0.1:8080/api/v1/auth/login` → 204
- POST `http://127.0.0.1:8080/api/v1/auth/login` → 200/400 (backend response)

**If Still Fails**:
- OPTIONS `http://127.0.0.1:8080/api/v1/auth/login` → 204
- POST `http://127.0.0.1:8080/api/v1/auth/login` → (failed/not sent)

## Possible Outcomes

### Outcome A: Login Works ✅

**Evidence**:
- Console shows `[API-CLIENT] fetch() returned with status: 200`
- Network tab shows POST request with 200 response
- Backend receives POST request
- Login succeeds

**Conclusion**: 
The issue WAS localhost IPv4/IPv6 resolution mismatch.

**Explanation**:
- Backend binds to IPv4 only (`127.0.0.1:8080` or `0.0.0.0:8080` without IPv6)
- Browser tried IPv6 `::1:8080` when using `localhost`
- Connection failed because backend not listening on IPv6
- Using explicit `127.0.0.1` forces browser to use IPv4
- Connection succeeds

**Permanent Fix**:
Keep using `127.0.0.1` in configuration, OR configure backend to listen on both IPv4 and IPv6.

---

### Outcome B: Login Still Fails ❌

**Evidence**:
- Console shows TypeError after "About to call fetch()"
- Network tab shows no POST request (or failed POST)
- Backend never receives POST request

**Conclusion**: 
The issue is NOT localhost resolution. Continue debugging.

**Next Investigation Steps**:
1. Check exact TypeError message
2. Test without `credentials: 'include'`
3. Test in browser incognito mode
4. Check browser console for CORS errors
5. Verify OPTIONS response headers include `Access-Control-Allow-Credentials: true`
6. Check Windows Firewall logs
7. Test with different browser

---

## How to Verify After Restart

### Check Environment Variable Loaded

In browser console, look for:
```
[API-CLIENT] NEXT_PUBLIC_API_BASE_URL: http://127.0.0.1:8080
```

If it still shows `http://localhost:8080`, the dev server wasn't restarted properly.

### Check Fetch URL

Look for:
```
[API-CLIENT] URL: http://127.0.0.1:8080/api/v1/auth/login
```

Should explicitly use `127.0.0.1`, not `localhost`.

## Technical Background: Why localhost Can Fail

### localhost Resolution

The hostname `localhost` is special:
- Defined in RFC 6761
- Should resolve to loopback addresses
- Can resolve to **both** IPv4 and IPv6:
  - IPv4: `127.0.0.1`
  - IPv6: `::1`

### Browser Behavior

Modern browsers (Chrome, Firefox, Edge):
1. Prefer IPv6 when available (Happy Eyeballs algorithm)
2. Try IPv6 first: `::1:8080`
3. If connection fails, fall back to IPv4: `127.0.0.1:8080`
4. But fallback behavior varies by browser

### Why PowerShell Works

- Windows PowerShell networking APIs typically prefer IPv4
- `Invoke-RestMethod` likely uses IPv4 first or only
- Connects to `127.0.0.1:8080` directly
- Doesn't encounter the IPv6 issue

### Why Go Backend Might Only Listen on IPv4

If backend code has:
```go
http.ListenAndServe(":8080", handler)
```

On Windows, this might only bind to IPv4 `0.0.0.0:8080`, not IPv6 `[::]:8080`.

To listen on both:
```go
http.ListenAndServe("0.0.0.0:8080", handler)  // IPv4 only
http.ListenAndServe("[::]:8080", handler)     // IPv6 only
http.ListenAndServe(":8080", handler)         // May vary by OS
```

## Status

- ✅ Diagnostic change applied
- ⏳ Awaiting server restart and test results
- 📊 Enhanced logging still active
- 🎯 Testing specific hypothesis: IPv4/IPv6 resolution

## Action Required

1. **Restart dev server** (npm run dev)
2. **Test login** in browser
3. **Check console output** for URL being used
4. **Check Network tab** for POST request
5. **Report results**: Does it work or still fail?

---

**Date**: 2025-01-20
**Change**: NEXT_PUBLIC_API_BASE_URL from localhost to 127.0.0.1
**Status**: AWAITING TEST RESULTS
