$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Test avec chemin /api/send-email"
    html = "<p>Test</p>"
} | ConvertTo-Json

Write-Host "Test avec /api/send-email..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service/api/send-email" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
    
} catch {
    Write-Host "`n❌ Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
