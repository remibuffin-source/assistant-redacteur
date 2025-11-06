$body = @{
    to = "remibuffin@yahoo.fr"
    subject = "Test avec le nouveau domaine assistant-redacteur.fr"
    html = "<h1>🎉 Succès !</h1><p>Email envoyé depuis <strong>noreply@assistant-redacteur.fr</strong></p>"
} | ConvertTo-Json

Write-Host "Test email avec nouveau domaine..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Email envoyé depuis noreply@assistant-redacteur.fr !" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
