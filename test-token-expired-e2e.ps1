# TOKEN_EXPIRED E2E Test Script
# Tests: login → expired token → automatic refresh → retry → success

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3000"

Write-Host "`n=== TOKEN_EXPIRED E2E TEST ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n[1] Testing normal login..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}' `
    -SessionVariable session `
    -ErrorAction SilentlyContinue

if ($loginResponse.StatusCode -eq 200) {
    Write-Host "[✓] Login successful" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "    Access token present: $($loginData.data.access_token -ne $null)" -ForegroundColor Gray
} else {
    Write-Host "[✗] Login failed: $($loginResponse.StatusCode)" -ForegroundColor Red
    exit 1
}

# 2. Normal authenticated request
Write-Host "`n[2] Testing normal authenticated request..." -ForegroundColor Yellow
$statsResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/system/stats" `
    -WebSession $session `
    -ErrorAction SilentlyContinue

if ($statsResponse.StatusCode -eq 200) {
    Write-Host "[✓] Normal request successful" -ForegroundColor Green
} else {
    Write-Host "[✗] Normal request failed: $($statsResponse.StatusCode)" -ForegroundColor Red
}

# 3. Simulate expired token by clearing cookies and using old/invalid token
Write-Host "`n[3] Testing TOKEN_EXPIRED scenario..." -ForegroundColor Yellow
Write-Host "    Note: To properly test token expiration, we need to:" -ForegroundColor Gray
Write-Host "    - Wait for token to expire (15 min)" -ForegroundColor Gray
Write-Host "    - OR manually set expired token in browser cookies" -ForegroundColor Gray
Write-Host "    - OR backend needs test endpoint to expire tokens" -ForegroundColor Gray

# For now, check if refresh endpoint exists
Write-Host "`n[4] Verifying refresh endpoint exists..." -ForegroundColor Yellow
$refreshResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/refresh" `
    -Method POST `
    -WebSession $session `
    -ErrorAction SilentlyContinue

if ($refreshResponse.StatusCode -eq 200 -or $refreshResponse.StatusCode -eq 401) {
    Write-Host "[✓] Refresh endpoint exists (status: $($refreshResponse.StatusCode))" -ForegroundColor Green
} else {
    Write-Host "[✗] Refresh endpoint issue: $($refreshResponse.StatusCode)" -ForegroundColor Red
}

Write-Host "`n=== MANUAL TEST REQUIRED ===" -ForegroundColor Yellow
Write-Host "For complete TOKEN_EXPIRED flow test:" -ForegroundColor Gray
Write-Host "1. Login via browser: $baseUrl/login" -ForegroundColor Gray
Write-Host "2. Open DevTools → Application → Cookies" -ForegroundColor Gray
Write-Host "3. Note the session cookie value" -ForegroundColor Gray
Write-Host "4. Wait 15 minutes OR modify cookie to expired token" -ForegroundColor Gray
Write-Host "5. Navigate to $baseUrl/admin" -ForegroundColor Gray
Write-Host "6. Check Network tab for:" -ForegroundColor Gray
Write-Host "   - Initial request → 401 TOKEN_EXPIRED" -ForegroundColor Gray
Write-Host "   - Automatic /api/auth/refresh call" -ForegroundColor Gray
Write-Host "   - Retry of original request → 200 OK" -ForegroundColor Gray
Write-Host "7. Verify no redirect to /login" -ForegroundColor Gray

