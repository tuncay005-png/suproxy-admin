# Network Error Diagnostic Report

## Problem Statement

Frontend login request fails with:
```
Network error: Failed to fetch
```

When attempting:
```
POST http://localhost:8080/api/v1/auth/login
```

## Backend Status

✅ **Backend is CONFIRMED RUNNING**
- Health endpoint works: `http://localhost:8080/health` returns 200 OK
- Database connected
- Migrations completed
- HTTP server listening on :8080

## Frontend Configuration Analysis

### 1. Environment Variable
**File**: `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
✅ Status: Correctly configured

### 2. API Client Configuration
**File**: `lib/api/client.ts`

**Base URL**:
```typescript
this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
```

**Fetch Configuration**:
```typescript
const response = await fetch(url, {
  ...options,
  credentials: 'include', // ← Cookie handling
  headers: {
    'Content-Type': 'application/json',
    ...options?.headers,
  },
});
```

**POST Request**:
```typescript
async post<T>(endpoint: string, data: unknown): Promise<T> {
  return this.request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Constructed URL**: `http://localhost:8080/api/v1/auth/login`

✅ Status: Code appears correct

### 3. Login Flow
**File**: `components/admin/auth/login-form.tsx`
```typescript
await authApi.login(data);
```

**File**: `lib/api/endpoints/auth.ts`
```typescript
login: (credentials: LoginCredentials): Promise<LoginResponse> =>
  apiClient.post<LoginResponse>('/api/v1/auth/login', credentials),
```

✅ Status: Call chain is correct

## Most Likely Causes

### Cause #1: CORS (Cross-Origin Resource Sharing) ⚠️ MOST LIKELY

**Symptom**: `Failed to fetch` before any HTTP response

**Why**: The browser is making a request from `http://localhost:3000` (Next.js) to `http://localhost:8080` (Go backend). This is a cross-origin request.

**Browser behavior**:
1. Browser sends OPTIONS preflight request to `http://localhost:8080/api/v1/auth/login`
2. If backend doesn't respond with proper CORS headers, browser blocks the actual POST request
3. Fetch throws "Failed to fetch" without ever sending the POST

**Required Backend CORS Headers**:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

**How to Verify**:
1. Open browser DevTools → Network tab
2. Look for OPTIONS request to `/api/v1/auth/login`
3. Check if it returns 200 with CORS headers
4. If OPTIONS fails or returns no CORS headers → This is the issue

**Backend Fix Required** (Go with gorilla/mux or similar):
```go
import "github.com/rs/cors"

// Add CORS middleware
c := cors.New(cors.Options{
    AllowedOrigins:   []string{"http://localhost:3000"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Content-Type"},
    AllowCredentials: true,
})

handler := c.Handler(router)
```

---

### Cause #2: Mixed Content (HTTP vs HTTPS) ⚠️ UNLIKELY

**Check**: Is Next.js running on HTTPS?

If Next.js is on `https://localhost:3000` and backend is on `http://localhost:8080`, browsers block the request.

**How to Verify**:
- Check browser address bar
- If it shows `https://localhost:3000`, this is the issue

**Solution**: Either:
- Run Next.js on HTTP (remove any HTTPS configuration)
- Or run backend on HTTPS

---

### Cause #3: Backend Not Listening on Correct Interface ⚠️ LESS LIKELY

**Check**: Is backend listening on `0.0.0.0:8080` or `127.0.0.1:8080`?

If backend listens only on `127.0.0.1` but request goes to `localhost`, it might fail on some systems.

**How to Verify**:
```bash
curl http://127.0.0.1:8080/health
curl http://localhost:8080/health
```

If one works and the other doesn't, this is the issue.

**Backend Fix**: Listen on `0.0.0.0:8080` instead of `127.0.0.1:8080`

---

### Cause #4: Firewall/Antivirus Blocking ⚠️ LESS LIKELY

**Check**: Windows Firewall or antivirus might block cross-origin requests

**How to Verify**:
- Temporarily disable Windows Firewall
- Try the request again
- If it works, add an exception

---

### Cause #5: Backend Route Not Registered ⚠️ UNLIKELY (but check)

**Check**: Is `POST /api/v1/auth/login` actually registered in the backend router?

**How to Verify**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

If this returns a response (even an error), the route is registered.
If this returns "404 Not Found", the route is not registered.

---

## Diagnostic Steps

### Step 1: Open Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Clear all requests (trash icon)
4. Keep DevTools open

### Step 2: Attempt Login

1. Enter credentials in login form
2. Click "Sign In"
3. Watch the Network tab

### Step 3: Inspect Failed Request

Look for the request to `/api/v1/auth/login` and check:

**Question 1**: Do you see TWO requests or ONE request?
- TWO requests (OPTIONS + POST) → CORS preflight
- ONE request (POST only) → No preflight

**Question 2**: What is the status of the OPTIONS request (if present)?
- 200 OK → CORS headers might be missing
- Failed/Red → Backend not handling OPTIONS
- No OPTIONS request → Different issue

**Question 3**: What is the exact error message in the Network tab?
- "CORS policy" → CORS issue
- "Failed to fetch" / "net::ERR_FAILED" → Connection issue
- "Mixed Content" → HTTPS/HTTP mismatch
- Other → Need more info

**Question 4**: Check the Request Headers
- What is the **Origin** header value?
- What is the **Host** header value?
- What is the **Referer** header value?

**Question 5**: Check the Response Headers (if any)
- Is `Access-Control-Allow-Origin` present?
- Is `Access-Control-Allow-Credentials` present?
- Is `Access-Control-Allow-Methods` present?

### Step 4: Test with cURL

Run this command:
```bash
curl -v -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

Check the response headers for CORS headers.

### Step 5: Test OPTIONS Preflight

Run this command:
```bash
curl -v -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

Expected response:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

If you don't see these headers, **this is the issue**.

---

## Most Likely Solution

Based on the symptoms, **CORS misconfiguration is the most likely cause**.

### Backend Fix (Go)

Add CORS middleware to your Go backend:

```go
package main

import (
    "github.com/rs/cors"
    "net/http"
)

func main() {
    // Your existing router setup
    router := setupRouter()

    // Add CORS middleware
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
        Debug:            true, // Enable for debugging
    })

    handler := c.Handler(router)

    // Start server
    http.ListenAndServe(":8080", handler)
}
```

### Alternative: Quick CORS Test

Add this to your backend route handler temporarily:

```go
func enableCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    w.Header().Set("Access-Control-Allow-Credentials", "true")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
    enableCORS(w)
    
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }
    
    // Your actual login logic here
}
```

---

## Action Items

1. ✅ **Check browser Network tab** for OPTIONS request
2. ✅ **Test with cURL** to verify CORS headers
3. ⚠️ **Add CORS middleware to backend** (if missing)
4. ✅ **Restart backend** after adding CORS
5. ✅ **Test login again** in browser

---

## Summary

**Problem**: Frontend fetch() fails with "Failed to fetch"
**Most Likely Cause**: Missing CORS configuration on backend
**Why**: Browser blocks cross-origin requests without proper CORS headers
**Solution**: Add CORS middleware to Go backend allowing `http://localhost:3000`

**Verification Needed**:
- Check browser Network tab for OPTIONS preflight request
- Check if OPTIONS returns CORS headers
- Test with cURL to confirm CORS behavior

---

**Date**: 2025-01-20
**Status**: DIAGNOSTIC COMPLETE - Awaiting verification
**Next Step**: Check browser Network tab and backend CORS configuration
