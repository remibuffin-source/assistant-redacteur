$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Test Local Email Service"
    html = "<h1>Test Email Local</h1><p>Test depuis le serveur local</p>"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/send-email" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Email envoyé avec succès !" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
