# Test GUVI Format API

Write-Host "🧪 Testing Honeypot API with GUVI Format" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "honeypot-guvi-2026-secure-key"
}

# Test 1: First message (empty conversation history)
Write-Host "Test 1: First Message (GUVI Format)" -ForegroundColor Yellow

$body1 = @{
    sessionId = "test-session-123"
    message = @{
        sender = "scammer"
        text = "Your bank account will be blocked today. Verify immediately."
        timestamp = "2026-02-04T20:00:00Z"
    }
    conversationHistory = @()
    metadata = @{
        channel = "SMS"
        language = "English"
        locale = "IN"
    }
} | ConvertTo-Json -Depth 5

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/conversation" `
      -Method Post -Headers $headers -Body $body1
    Write-Host "✅ Response:" -ForegroundColor Green
    $response1 | ConvertTo-Json
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    $_.Exception.Message
}

Write-Host ""
Write-Host "Test 2: Follow-up Message" -ForegroundColor Yellow

$body2 = @{
    sessionId = "test-session-123"
    message = @{
        sender = "scammer"
        text = "Share your UPI ID to avoid account suspension. Call 9876543210"
        timestamp = "2026-02-04T20:02:00Z"
    }
    conversationHistory = @(
        @{
            sender = "scammer"
            text = "Your bank account will be blocked today. Verify immediately."
            timestamp = "2026-02-04T20:00:00Z"
        },
        @{
            sender = "user"
            text = "Why will my account be blocked?"
            timestamp = "2026-02-04T20:01:00Z"
        }
    )
    metadata = @{
        channel = "SMS"
        language = "English"
        locale = "IN"
    }
} | ConvertTo-Json -Depth 5

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/conversation" `
      -Method Post -Headers $headers -Body $body2
    Write-Host "✅ Response:" -ForegroundColor Green
    $response2 | ConvertTo-Json
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    $_.Exception.Message
}

Write-Host ""
Write-Host "✅ Tests completed!" -ForegroundColor Green
