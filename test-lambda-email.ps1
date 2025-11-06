$body = @{
    to = "assistant.studioducapbrun@gmail.com"
    subject = "Test Lambda Email Service"
    html = "<h1>Test Email Lambda</h1><p>Ceci est un test d'envoi d'email depuis AWS Lambda avec HTTPS !</p>"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://e6f6kya0zj.execute-api.eu-west-1.amazonaws.com/default/email-service" -Method Post -Body $body -ContentType "application/json"

Write-Host "Réponse du serveur:"
$response | ConvertTo-Json
