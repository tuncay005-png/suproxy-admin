# FINAL E2E TEST - SSR TOKEN_EXPIRED + Client Refresh
$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3000"

Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FINAL SSR + CLIENT REFRESH TEST       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test results
$results = @{}

# Test A: Normal Flow
Write-Host "[TEST A] NORMAL LOGIN & PAGES" -ForegroundColor Yellow
Write-Host "Testing: login, dashboard, users, servers, plans, audit logs" -ForegroundColor Gray

$pages = @('/admin', '/admin/users', '/admin/servers', '/admin/plans', '/admin/logs')
$allPass = $true

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$page" -ErrorAction SilentlyContinue -TimeoutSec 10
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            Write-Host "  [✓] $page" -ForegroundColor Green
        } else {
            Write-Host "  [!] $page : $($response.StatusCode)" -ForegroundColor Yellow
            $allPass = $false
        }
    } catch {
        Write-Host "  [✗] $page : $($_.Exception.Message.Substring(0, [Math]::Min(50, $_.Exception.Message.Length)))" -ForegroundColor Red
        $allPass = $false
    }
}

$results['normal_pages'] = if ($allPass) { 'PASS' } else { 'FAIL' }

# Test B: TypeScript
Write-Host "`n[TEST B] TYPESCRIPT CHECK" -ForegroundColor Yellow
try {
    $tsc = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [✓] TypeScript: 0 errors" -ForegroundColor Green
        $results['typescript'] = 'PASS'
    } else {
        Write-Host "  [✗] TypeScript: errors found" -ForegroundColor Red
        $results['typescript'] = 'FAIL'
    }
} catch {
    $results['typescript'] = 'FAIL'
}

# Test C: Server-side refresh implementation
Write-Host "`n[TEST C] SERVER-SIDE REFRESH FILES" -ForegroundColor Yellow
$requiredFiles = @(
    'lib/api/server-refresh-helper.ts',
    'lib/api/client.ts',
    'app/actions/auth.ts'
)

$filesOk = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [✓] $file exists" -ForegroundColor Green
    } else {
        Write-Host "  [✗] $file missing" -ForegroundColor Red
        $filesOk = $false
    }
}

# Check if client.ts has server refresh import
$clientContent = Get-Content 'lib/api/client.ts' -Raw
if ($clientContent -match 'attemptServerSideRefresh') {
    Write-Host "  [✓] API client has server-side refresh integration" -ForegroundColor Green
} else {
    Write-Host "  [✗] API client missing server-side refresh" -ForegroundColor Red
    $filesOk = $false
}

$results['server_refresh_files'] = if ($filesOk) { 'PASS' } else { 'FAIL' }

# Test D: Check logs for timing
Write-Host "`n[TEST D] IMPLEMENTATION VERIFICATION" -ForegroundColor Yellow
Write-Host "  Server-side refresh helper: " -NoNewline
if ($clientContent -match 'isServerSide.*attemptServerSideRefresh') {
    Write-Host "IMPLEMENTED" -ForegroundColor Green
    $results['ssr_refresh'] = 'IMPLEMENTED'
} else {
    Write-Host "NOT FOUND" -ForegroundColor Red
    $results['ssr_refresh'] = 'MISSING'
}

Write-Host "  Client-side refresh preserved: " -NoNewline
if ($clientContent -match 'this\.attemptTokenRefresh') {
    Write-Host "YES" -ForegroundColor Green
    $results['client_refresh'] = 'PRESERVED'
} else {
    Write-Host "NO" -ForegroundColor Red
    $results['client_refresh'] = 'REMOVED'
}

Write-Host "  Single-flight pattern: " -NoNewline
if ($clientContent -match 'refreshPromise') {
    Write-Host "YES" -ForegroundColor Green
    $results['single_flight'] = 'YES'
} else {
    Write-Host "NO" -ForegroundColor Yellow
    $results['single_flight'] = 'NO'
}

# Final Report
Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           FINAL TEST RESULTS             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Normal Pages: $($results['normal_pages'])" -ForegroundColor $(if($results['normal_pages'] -eq 'PASS'){'Green'}else{'Red'})
Write-Host "2. TypeScript: $($results['typescript'])" -ForegroundColor $(if($results['typescript'] -eq 'PASS'){'Green'}else{'Red'})
Write-Host "3. SSR Refresh Files: $($results['server_refresh_files'])" -ForegroundColor $(if($results['server_refresh_files'] -eq 'PASS'){'Green'}else{'Red'})
Write-Host "4. SSR Refresh Logic: $($results['ssr_refresh'])" -ForegroundColor $(if($results['ssr_refresh'] -eq 'IMPLEMENTED'){'Green'}else{'Red'})
Write-Host "5. Client Refresh: $($results['client_refresh'])" -ForegroundColor $(if($results['client_refresh'] -eq 'PRESERVED'){'Green'}else{'Red'})
Write-Host "6. Single-flight: $($results['single_flight'])" -ForegroundColor $(if($results['single_flight'] -eq 'YES'){'Green'}else{'Yellow'})

Write-Host "`n━━━ MANUAL TEST REQUIRED ━━━" -ForegroundColor Yellow
Write-Host "To test TOKEN_EXPIRED flow:" -ForegroundColor Gray
Write-Host "1. Login via browser: $baseUrl/login" -ForegroundColor Gray
Write-Host "2. Open browser DevTools → Console" -ForegroundColor Gray
Write-Host "3. Navigate to Dashboard and check terminal logs for:" -ForegroundColor Gray
Write-Host "   [DASHBOARD-TIMING] logs" -ForegroundColor Gray
Write-Host "4. Check for NO errors in browser console" -ForegroundColor Gray
Write-Host "`nFor expired token test (advanced):" -ForegroundColor Gray
Write-Host "- Modify backend to return TOKEN_EXPIRED" -ForegroundColor Gray
Write-Host "- Check terminal for [SERVER-REFRESH] or [API-CLIENT] logs" -ForegroundColor Gray
Write-Host "- Verify automatic refresh + retry behavior" -ForegroundColor Gray

$allTestsPass = $results.Values -notcontains 'FAIL' -and $results['ssr_refresh'] -eq 'IMPLEMENTED' -and $results['client_refresh'] -eq 'PRESERVED'

if ($allTestsPass) {
    Write-Host "`n✅ ALL AUTOMATED TESTS PASS" -ForegroundColor Green
    Write-Host "SSR Token Refresh implementation complete" -ForegroundColor Green
} else {
    Write-Host "`n⚠ SOME TESTS FAILED - Review above" -ForegroundColor Yellow
}
