# PowerShell Script for Testing SQLi BruteForce Attack Detection on Windows
# Author: TuanDepChai
# Usage: .\scripts\test-attacks-windows.ps1

Write-Host "🧪 SQLi BruteForce Attack Detection Test Suite" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/login"

# Test credentials
$testCredentials = @(
    @{username="admin"; password="admin123"; expected=true},
    @{username="user"; password="password"; expected=true},
    @{username="john"; password="john2024"; expected=true},
    @{username="admin"; password="wrong"; expected=false},
    @{username="invalid"; password="password"; expected=false}
)

# SQL Injection payloads
$sqlPayloads = @(
    @{username="admin' OR '1'='1"; password="anything"; description="Basic OR 1=1 bypass"},
    @{username="admin'--"; password=""; description="Comment-based bypass"},
    @{username="' OR 1=1--"; password="anything"; description="Always true condition"},
    @{username="admin' UNION SELECT 1,'admin','password'--"; password="anything"; description="UNION SELECT injection"},
    @{username="admin'; DROP TABLE users--"; password=""; description="Stacked queries"},
    @{username="admin' AND SLEEP(5)--"; password=""; description="Time-based blind injection"}
)

# Brute force test data
$bruteForceUsers = @("admin", "user", "john", "sarah", "mike", "emma")
$bruteForcePasswords = @("password", "123456", "admin123", "password123", "letmein", "qwerty", "abc123")

function Test-NormalLogin {
    Write-Host "`n🔐 Testing Normal Login Attempts" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
    foreach ($cred in $testCredentials) {
        try {
            $body = @{
                username = $cred.username
                password = $cred.password
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
            
            $status = if ($response.success) { "✅ SUCCESS" } else { "❌ FAILED" }
            $expectedStatus = if ($cred.expected) { "✅ SUCCESS" } else { "❌ FAILED" }
            
            if ($response.success -eq $cred.expected) {
                Write-Host "$status | $($cred.username):$($cred.password) | Expected: $expectedStatus" -ForegroundColor Green
            } else {
                Write-Host "$status | $($cred.username):$($cred.password) | Expected: $expectedStatus | ⚠️ UNEXPECTED" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ ERROR | $($cred.username):$($cred.password) | $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 500
    }
}

function Test-SQLInjection {
    Write-Host "`n💉 Testing SQL Injection Attacks" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    
    foreach ($payload in $sqlPayloads) {
        try {
            $body = @{
                username = $payload.username
                password = $payload.password
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
            
            $status = if ($response.success) { "🚨 SUCCESS (VULNERABLE!)" } else { "✅ BLOCKED" }
            
            Write-Host "$status | $($payload.description)" -ForegroundColor $(if ($response.success) { "Red" } else { "Green" })
            Write-Host "   Payload: $($payload.username)" -ForegroundColor Gray
            
            if ($response.vulnerability) {
                Write-Host "   Detection: $($response.vulnerability)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ ERROR | $($payload.description) | $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 500
    }
}

function Test-BruteForce {
    Write-Host "`n🔨 Testing Brute Force Attacks" -ForegroundColor Magenta
    Write-Host "===============================" -ForegroundColor Magenta
    
    $attempts = 0
    $successful = 0
    
    foreach ($user in $bruteForceUsers) {
        foreach ($pass in $bruteForcePasswords) {
            try {
                $body = @{
                    username = $user
                    password = $pass
                } | ConvertTo-Json
                
                $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
                
                $attempts++
                if ($response.success) {
                    $successful++
                    Write-Host "🎯 SUCCESS | $user:$pass" -ForegroundColor Red
                } else {
                    Write-Host "❌ FAILED | $user:$pass" -ForegroundColor Gray
                }
                
                # Show brute force detection
                if ($response.bruteForceDetected) {
                    Write-Host "   🛡️ Brute Force Detected: $($response.bruteForceDetected)" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "❌ ERROR | $user:$pass | $($_.Exception.Message)" -ForegroundColor Red
                $attempts++
            }
            
            Start-Sleep -Milliseconds 200
        }
    }
    
    Write-Host "`n📊 Brute Force Summary:" -ForegroundColor Cyan
    Write-Host "   Total Attempts: $attempts" -ForegroundColor White
    Write-Host "   Successful: $successful" -ForegroundColor Red
    Write-Host "   Failed: $($attempts - $successful)" -ForegroundColor Gray
    Write-Host "   Success Rate: $([math]::Round(($successful / $attempts) * 100, 2))%" -ForegroundColor Yellow
}

function Test-WebInterface {
    Write-Host "`n🌐 Testing Web Interface" -ForegroundColor Blue
    Write-Host "========================" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Web Interface: Accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ Web Interface: HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Web Interface: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    try {
        $adminUrl = "$baseUrl/admin"
        $response = Invoke-WebRequest -Uri $adminUrl -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Admin Dashboard: Accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ Admin Dashboard: HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Admin Dashboard: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-LogFiles {
    Write-Host "`n📁 Checking Log Files" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    
    $logFiles = @("logs/attacks.log", "logs/sql_injection.log", "logs/brute_force.log", "logs/critical-attacks.log")
    
    foreach ($logFile in $logFiles) {
        if (Test-Path $logFile) {
            $size = (Get-Item $logFile).Length
            $sizeKB = [math]::Round($size / 1KB, 2)
            Write-Host "✅ $logFile ($sizeKB KB)" -ForegroundColor Green
        } else {
            Write-Host "❌ $logFile (Not found)" -ForegroundColor Red
        }
    }
    
    # Show recent log entries
    if (Test-Path "logs/attacks.log") {
        Write-Host "`n📝 Recent Log Entries:" -ForegroundColor Yellow
        Get-Content "logs/attacks.log" -Tail 3 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
}

function Show-Database {
    Write-Host "`n🗄️ Checking Database" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    
    if (Test-Path "vulnerable.db") {
        $size = (Get-Item "vulnerable.db").Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "✅ Database: vulnerable.db ($sizeKB KB)" -ForegroundColor Green
        
        # Try to query database
        try {
            $dbPath = Resolve-Path "vulnerable.db"
            $result = sqlite3 $dbPath "SELECT COUNT(*) FROM attack_logs;"
            Write-Host "   Attack Logs: $result records" -ForegroundColor White
            
            $result = sqlite3 $dbPath "SELECT COUNT(*) FROM users;"
            Write-Host "   Users: $result records" -ForegroundColor White
        }
        catch {
            Write-Host "   ⚠️ Cannot query database (sqlite3 not found)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Database: vulnerable.db (Not found)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "Starting comprehensive attack testing..." -ForegroundColor White
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Run all tests
Test-WebInterface
Test-NormalLogin
Test-SQLInjection
Test-BruteForce
Show-LogFiles
Show-Database

Write-Host "`n🎉 Testing Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Check the following:" -ForegroundColor White
Write-Host "• Web Interface: $baseUrl" -ForegroundColor Gray
Write-Host "• Admin Dashboard: $baseUrl/admin" -ForegroundColor Gray
Write-Host "• Help Documentation: $baseUrl/help" -ForegroundColor Gray
Write-Host "• Log Files: logs/ directory" -ForegroundColor Gray
Write-Host "• Database: vulnerable.db" -ForegroundColor Gray

Write-Host "`n📊 For real-time log monitoring, run:" -ForegroundColor Cyan
Write-Host "Get-Content logs/attacks.log -Wait" -ForegroundColor Yellow
