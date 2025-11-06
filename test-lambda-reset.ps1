$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Réinitialisation de votre mot de passe"
    html = "<h1>Code de réinitialisation</h1><p>Votre code : <strong>123456</strong></p>"
} | ConvertTo-Json

Write-Host "Envoi de l'email de test..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Succès !" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Erreur :" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response
}
