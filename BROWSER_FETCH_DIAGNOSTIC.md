# Browser fetch() TypeError Diagnostic

## Confirmed Facts

✅ **Backend POST endpoint WORKS**
```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/login -Method POST
# Returns: success=true, access_token=...
```

✅ **OPTIONS preflight SUCCEEDS**
```
Browser → OPTIONS /api/v1/auth/login → 204 ✅
```

❌ **POST request NEVER SENT**
```
Browser → POST /api/v1/auth/login → (never reaches backend)
```

## Problem Statement

Browser fetch() throws TypeError BEFORE the POST request reaches the backend.

This is NOT a backend issue. This is a browser/frontend issue.

## Investigation Results

### 1. Service Workers: None Found ✅
- No custom service worker files in project
- Only Next.js test mode MSW (not active in dev)

### 2. Fetch Wrappers: None Found ✅
- No custom `window.fetch` or `global.fetch` assignments
- No fetch interceptors

### 3. Next.js Rewrites: None Configured ✅
- `next.config.ts` has no rewrites or proxy configuration
- No API routes that might intercept the request

### 4. CSP/Meta Tags: None Blocking ✅
- Root layout has no Content-Security-Policy
- No meta tags blocking cross-origin requests

### 5. Fetch Configuration
```typescript
fetch(url, {
  method: 'POST',
  credentials: 'include',  // ← Might be issue
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

## Enhanced Logging Added

### Environment Diagnostics (in constructor)
```javascript
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('this.baseURL:', this.baseURL);
console.log('window.location.origin:', window.location.origin);
console.log('window.location.hostname:', window.location.hostname);
console.log('window.location.protocol:', window.location.protocol);
```

### Request Diagnostics (before fetch)
```javascript
console.log('URL:', url);
console.log('Method:', method);
console.log('credentials:', 'include');
console.log('Browser context - origin:', window.location.origin);
console.log('Browser context - hostname:', window.location.hostname);
console.log('fetch options:', { method, credentials, headers });
```

### Error Diagnostics (on catch)
```javascript
console.error('Error name:', error.name);
console.error('Error message:', error.message);
console.error('Error stack:', error.stack);
console.error('This usually means: CORS / Network / Invalid URL / Browser blocking');
```

## Possible Root Causes

### Cause #1: localhost vs 127.0.0.1 Resolution Issue ⚠️ TEST THIS

**Scenario**:
- Frontend runs on `http://localhost:3000`
- Backend configured as `http://localhost:8080`
- Windows might resolve `localhost` differently for IPv4 vs IPv6
- Browser might try IPv6 `::1` first, fail, then give up

**Evidence**:
- PowerShell uses IPv4 by default
- Browsers might prefer IPv6
- `localhost` can resolve to both `127.0.0.1` (IPv4) and `::1` (IPv6)

**Test**:
1. Change `.env.local` from `localhost` to `127.0.0.1`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
   ```
2. Restart Next.js dev server
3. Try login again
4. Check if POST request is now sent

**Alternative**: Check backend binding
- If backend binds to `127.0.0.1:8080`, it only accepts IPv4
- If browser tries `::1:8080` (IPv6), connection fails
- Backend should bind to `0.0.0.0:8080` or `[::]:8080` to accept both

---

### Cause #2: credentials:'include' on Cross-Origin Request ⚠️ POSSIBLE

**Scenario**:
- `credentials: 'include'` requires `Access-Control-Allow-Credentials: true`
- OPTIONS returns 204, but might be missing this header
- Browser blocks POST due to credentials policy

**What to check**:
In Browser DevTools → Network → OPTIONS request → Response Headers:
```
Access-Control-Allow-Credentials: true  ← Must be present
```

**Test**:
Temporarily remove `credentials: 'include'` and test:
```typescript
const response = await fetch(url, {
  ...options,
  // credentials: 'include',  // ← Comment out temporarily
  headers: {
    'Content-Type': 'application/json',
    ...options?.headers,
  },
});
```

---

### Cause #3: Browser Extension Blocking Request ⚠️ POSSIBLE

**Scenario**:
- Ad blocker, privacy extension, or firewall extension blocking cross-origin POST
- Extension allows OPTIONS but blocks POST
- No error shown in console (silently blocked)

**Test**:
1. Open browser in incognito/private mode (disables most extensions)
2. Try login
3. If it works → Extension is the culprit

---

### Cause #4: Antivirus/Firewall Blocking POST ⚠️ LESS LIKELY

**Scenario**:
- Windows Firewall or antivirus blocking POST to localhost:8080
- OPTIONS allowed (lighter weight)
- POST blocked (contains body)

**Test**:
1. Temporarily disable Windows Firewall
2. Temporarily disable antivirus
3. Try login
4. If it works → Firewall/AV is blocking

---

### Cause #5: OPTIONS Response Missing Required Headers ⚠️ VERIFY

**Required headers for credentials:'include'**:
```
Access-Control-Allow-Origin: http://localhost:3000  (NOT *)
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

**If ANY of these are missing or incorrect**, browser blocks the POST.

**Verify**:
```bash
curl -v -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

Check the response headers carefully.

---

## Action Plan

### Step 1: Test 127.0.0.1 vs localhost

**Current `.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**Test configuration:**
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

**Commands:**
```bash
# Backup current config
copy .env.local .env.local.backup

# Apply test config
copy .env.local.test-127 .env.local

# Restart Next.js dev server
# Kill existing process (Ctrl+C)
npm run dev

# Test login in browser
# Check console logs
# Check Network tab
```

If this works, the issue is localhost IPv6 resolution.

---

### Step 2: Check Console Output

After restarting with enhanced logging, the console should show:

```
[API-CLIENT] Constructor - Environment diagnostics:
[API-CLIENT] NEXT_PUBLIC_API_BASE_URL: http://127.0.0.1:8080
[API-CLIENT] this.baseURL: http://127.0.0.1:8080
[API-CLIENT] window.location.origin: http://localhost:3000
[API-CLIENT] window.location.hostname: localhost
[API-CLIENT] window.location.protocol: http:
```

Then during login:

```
[LOGIN-FORM] onSubmit called with data: { email: "...", password: "***" }
[AUTH-API] login() called with: { email: "...", password: "***" }
[API-CLIENT] post() called with endpoint: /api/v1/auth/login
[API-CLIENT] request() called
[API-CLIENT] URL: http://127.0.0.1:8080/api/v1/auth/login
[API-CLIENT] Browser context - origin: http://localhost:3000
[API-CLIENT] Browser context - hostname: localhost
[API-CLIENT] About to call fetch() with URL: http://127.0.0.1:8080/api/v1/auth/login
[API-CLIENT] fetch options: { method: 'POST', credentials: 'include', headers: {...} }
```

**If it stops after "About to call fetch()"**, fetch() is throwing.
**If it continues with "fetch() returned with status: X"**, fetch() succeeded.

---

### Step 3: Check Network Tab

Browser DevTools → Network tab:

**Expected with 127.0.0.1**:
- OPTIONS `http://127.0.0.1:8080/api/v1/auth/login` → 204
- POST `http://127.0.0.1:8080/api/v1/auth/login` → 200 (or error)

**If POST appears**: Issue was localhost resolution
**If POST still doesn't appear**: Different issue

---

### Step 4: Test Without credentials:'include'

If 127.0.0.1 doesn't fix it, try removing credentials temporarily:

In `lib/api/client.ts`, comment out credentials:
```typescript
const response = await fetch(url, {
  ...options,
  // credentials: 'include',  // ← TEMPORARY: commented out for testing
  headers: {
    'Content-Type': 'application/json',
    ...options?.headers,
  },
});
```

Test login. If it works, the issue is credentials policy.

---

### Step 5: Test in Incognito Mode

1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/login`
3. Try login
4. Check if POST is sent

If it works in incognito, a browser extension is blocking the request.

---

## Expected Outcomes

### If 127.0.0.1 Fixes It

**Problem**: localhost IPv4/IPv6 resolution mismatch
**Solution**: Use `127.0.0.1` (IPv4) explicitly
**Backend Fix**: Ensure backend listens on `0.0.0.0:8080` to accept both IPv4 and IPv6

### If credentials:'include' Is the Issue

**Problem**: CORS credentials policy
**Solution**: Ensure backend OPTIONS response includes:
```
Access-Control-Allow-Credentials: true
```

### If Browser Extension Is Blocking

**Problem**: Ad blocker or privacy extension
**Solution**: Whitelist localhost in extension settings, or disable extension

### If Still Failing

**Need more info**:
- Complete console output
- Network tab screenshot
- Browser name and version
- Operating system version

---

## Files Modified

1. **lib/api/client.ts**
   - Added environment diagnostics logging
   - Added detailed fetch options logging
   - Added enhanced error logging

2. **.env.local.test-127** (created)
   - Test configuration with 127.0.0.1

## Next Steps

1. **Apply test configuration** (127.0.0.1)
2. **Restart dev server**
3. **Check console output** for environment diagnostics
4. **Attempt login**
5. **Check if POST is sent** in Network tab
6. **Report results**

---

**Status**: ENHANCED DIAGNOSTICS ADDED + TEST CONFIG CREATED
**Test**: Change localhost → 127.0.0.1
**Goal**: Identify if IPv4/IPv6 resolution is the issue
