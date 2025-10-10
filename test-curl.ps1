# Test script for the authentication system

Write-Host "Testing Friendship Gallery Authentication System" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Test 1: Login page
Write-Host "`n1. Testing Login Page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/login" -Method GET
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Content Length: $($response.Content.Length) characters" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Submit login form
Write-Host "`n2. Testing Login Form Submission..." -ForegroundColor Yellow
try {
    $body = @{ email = "test@example.com" }
    $response = Invoke-WebRequest -Uri "http://localhost:3002/login" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    
    # Check if redirected
    if ($response.Headers.Location) {
        Write-Host "   Redirected to: $($response.Headers.Location)" -ForegroundColor Cyan
    } else {
        Write-Host "   No redirect - staying on login page" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: OTP verification page
Write-Host "`n3. Testing OTP Verification Page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/verify-otp?email=test@example.com" -Method GET
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    Write-Host "   Content Length: $($response.Content.Length) characters" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Submit OTP form
Write-Host "`n4. Testing OTP Form Submission..." -ForegroundColor Yellow
try {
    $body = @{ email = "test@example.com"; otp = "123456" }
    $response = Invoke-WebRequest -Uri "http://localhost:3002/verify-otp" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    
    # Check if redirected
    if ($response.Headers.Location) {
        Write-Host "   Redirected to: $($response.Headers.Location)" -ForegroundColor Cyan
    } else {
        Write-Host "   No redirect - staying on OTP page" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Dashboard access
Write-Host "`n5. Testing Dashboard Access..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/" -Method GET
    Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
    
    # Check if redirected to login
    if ($response.Headers.Location) {
        Write-Host "   Redirected to: $($response.Headers.Location)" -ForegroundColor Cyan
    } else {
        # Check if content contains login form
        if ($response.Content -match "Enter your email address") {
            Write-Host "   Redirected to login page (no redirect header)" -ForegroundColor Yellow
        } else {
            Write-Host "   Dashboard accessible" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
