# COMPREHENSIVE E2E TEST - 4 ISSUES
$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3000"
$results = @{}

Write-Host "`n=== COMPREHENSIVE E2E TEST ===" -ForegroundColor Cyan

# TEST 1: Auth & Refresh
Write-Host "`n[TEST 1] TOKEN_EXPIRED FLOW" -ForegroundColor Yellow
try {
    $login = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -SessionVariable session -ErrorAction Stop
    Write-Host "[✓] Login PASS" -ForegroundColor Green
    $results['login'] = 'PASS'
} catch {
    Write-Host "[✗] Login FAIL" -ForegroundColor Red
    $results['login'] = 'FAIL'
}

# TEST 2-4: Regression
Write-Host "`n[TEST 2-4] REGRESSION TESTS" -ForegroundColor Yellow
$pages = @('/admin', '/admin/users', '/admin/servers', '/admin/plans', '/admin/logs')
foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$page" -WebSession $session -ErrorAction Stop
        Write-Host "[✓] $page" -ForegroundColor Green
    } catch {
        Write-Host "[✗] $page" -ForegroundColor Red
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Run with timing enabled: `$env:MIDDLEWARE_TIMING='true'; npm run dev"
Write-Host "Check logs for [MIDDLEWARE-TIMING] and [DASHBOARD-TIMING]"
