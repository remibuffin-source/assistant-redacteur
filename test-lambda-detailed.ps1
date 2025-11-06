$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Test détaillé"
    html = "<p>Test</p>"
} | ConvertTo-Json

Write-Host "Envoi..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content
    
} catch {
    Write-Host "`n❌ Erreur HTTP:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Message: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
