$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Test Email Production"
    html = "<h1>Test Email</h1><p>Ceci est un test d'envoi d'email depuis le serveur de production.</p>"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://assistant-email-prod.eba-hmbejiat.eu-west-1.elasticbeanstalk.com/api/send-email" -Method Post -Body $body -ContentType "application/json"

Write-Host "Réponse du serveur:"
$response | ConvertTo-Json
