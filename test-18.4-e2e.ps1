# Task 18.4 E2E Test Script

Write-Host "`n=== TASK 18.4 FRONTEND E2E VERIFICATION ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[1/6] LOGIN TEST..." -ForegroundColor Yellow
$loginBody = @{email='admin@suproxy.com'; password='Admin123!'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -SessionVariable 'session' -UseBasicParsing
if ($loginResponse.StatusCode -eq 200) {
    Write-Host "✅ LOGIN PASS (200 OK)" -ForegroundColor Green
} else {
    Write-Host "❌ LOGIN FAIL" -ForegroundColor Red; exit 1
}

# Step 2: List Users
Write-Host "`n[2/6] GET USERS LIST..." -ForegroundColor Yellow
$usersResponse = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/users' -Method GET -WebSession $session -UseBasicParsing
if ($usersResponse.StatusCode -eq 200) {
    $usersData = $usersResponse.Content | ConvertFrom-Json
    Write-Host "✅ GET USERS PASS (200 OK) - Total: $($usersData.data.total)" -ForegroundColor Green
} else {
    Write-Host "❌ GET USERS FAIL" -ForegroundColor Red; exit 1
}

# Step 3: Create User
Write-Host "`n[3/6] CREATE NEW USER..." -ForegroundColor Yellow
$createBody = @{email='e2e' + (Get-Random) + '@test.com'; password='Test123!'; role='user'} | ConvertTo-Json
$createResponse = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/users' -Method POST -Body $createBody -ContentType 'application/json' -WebSession $session -UseBasicParsing
if ($createResponse.StatusCode -in @(200,201)) {
    $newUser = ($createResponse.Content | ConvertFrom-Json).data
    $global:userId = $newUser.id
    Write-Host "✅ CREATE USER PASS ($($createResponse.StatusCode)) - ID: $global:userId" -ForegroundColor Green
} else {
    Write-Host "❌ CREATE USER FAIL" -ForegroundColor Red; exit 1
}

# Step 4: Update User Status
Write-Host "`n[4/6] UPDATE USER STATUS..." -ForegroundColor Yellow
$statusBody = @{status='suspended'} | ConvertTo-Json
$statusResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/users/$global:userId/status" -Method PUT -Body $statusBody -ContentType 'application/json' -WebSession $session -UseBasicParsing
if ($statusResponse.StatusCode -eq 200) {
    Write-Host "✅ UPDATE STATUS PASS (200 OK)" -ForegroundColor Green
} else {
    Write-Host "❌ UPDATE STATUS FAIL" -ForegroundColor Red; exit 1
}

# Step 5: Update User Role
Write-Host "`n[5/6] UPDATE USER ROLE..." -ForegroundColor Yellow
$roleBody = @{role='admin'} | ConvertTo-Json
$roleResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/users/$global:userId/role" -Method PUT -Body $roleBody -ContentType 'application/json' -WebSession $session -UseBasicParsing
if ($roleResponse.StatusCode -eq 200) {
    Write-Host "✅ UPDATE ROLE PASS (200 OK)" -ForegroundColor Green
} else {
    Write-Host "❌ UPDATE ROLE FAIL" -ForegroundColor Red; exit 1
}

# Step 6: Other Modules
Write-Host "`n[6/6] OTHER MODULES..." -ForegroundColor Yellow
try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/plans' -Method GET -WebSession $session -UseBasicParsing; Write-Host "   Plans: ✅" -ForegroundColor Green } catch { Write-Host "   Plans: ❌" -ForegroundColor Red }
try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/xray/instances' -Method GET -WebSession $session -UseBasicParsing; Write-Host "   Xray Instances: ✅" -ForegroundColor Green } catch { Write-Host "   Xray Instances: ❌" -ForegroundColor Red }
try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/xray/inbounds' -Method GET -WebSession $session -UseBasicParsing; Write-Host "   Xray Inbounds: ✅" -ForegroundColor Green } catch { Write-Host "   Xray Inbounds: ❌" -ForegroundColor Red }
try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/xray/clients' -Method GET -WebSession $session -UseBasicParsing; Write-Host "   Xray Clients: ✅" -ForegroundColor Green } catch { Write-Host "   Xray Clients: ❌" -ForegroundColor Red }
try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/sessions' -Method GET -WebSession $session -UseBasicParsing; Write-Host "   Sessions: ✅" -ForegroundColor Green } catch { Write-Host "   Sessions: ❌" -ForegroundColor Red }

Write-Host "`n=== ✅ ALL CORE TESTS PASSED ===" -ForegroundColor Cyan
