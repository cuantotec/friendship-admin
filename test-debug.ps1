# Debug test for server actions

Write-Host "Testing Server Actions with Debug Mode" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Check if server is running
Write-Host "`n1. Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method GET
    Write-Host "   Server is running on port 3000" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Server not running: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Submit form with debug action
Write-Host "`n2. Testing form submission with debug action..." -ForegroundColor Yellow
try {
    $body = @{ email = "eliran@cuantotec.com" }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded" -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    
    if ($response.Headers.Location) {
        Write-Host "   Redirected to: $($response.Headers.Location)" -ForegroundColor Cyan
    } else {
        Write-Host "   No redirect - this might be the issue" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
        if ($statusCode -eq 302) {
            Write-Host "   Redirect detected (302)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Check OTP page directly
Write-Host "`n3. Testing OTP page directly..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/verify-otp?email=eliran@cuantotec.com&success=Test" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content contains 'OTP sent to your email': $($response.Content -match 'OTP sent to your email')" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDebug test completed!" -ForegroundColor Green
