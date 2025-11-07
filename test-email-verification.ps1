$body = @{
    to = "remibuffin@yahoo.fr"
    subject = "Test code de verification"
    html = "<h1>Verification de votre compte</h1><p>Votre code de verification : <strong>123456</strong></p><p>Ce code est valide pendant 15 minutes.</p>"
} | ConvertTo-Json

Write-Host "Test email de vérification..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Email de vérification envoyé !" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
