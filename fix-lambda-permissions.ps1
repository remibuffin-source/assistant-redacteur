# Script pour ajouter la permission d'invocation publique à la Lambda
# Nécessite AWS CLI configuré

$FUNCTION_NAME = "assistant-redacteur-auth"  # Remplacez par le nom exact de votre fonction
$REGION = "eu-west-1"

Write-Host "🔧 Ajout de la permission d'invocation publique pour la Function URL..." -ForegroundColor Yellow

# Ajouter la permission pour autoriser l'invocation via Function URL
aws lambda add-permission `
    --function-name $FUNCTION_NAME `
    --statement-id FunctionURLAllowPublicAccess `
    --action lambda:InvokeFunctionUrl `
    --principal "*" `
    --function-url-auth-type NONE `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Permission ajoutée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testez maintenant votre Lambda avec:" -ForegroundColor Cyan
    Write-Host "Invoke-RestMethod -Uri 'https://2si3fl5hx65k7i6pwaia352zya0izdxg.lambda-url.eu-west-1.on.aws/login' -Method Post -ContentType 'application/json' -Body '{\"email\":\"test@test.com\",\"password\":\"Test123!\"}'"
} else {
    Write-Host "❌ Erreur lors de l'ajout de la permission" -ForegroundColor Red
    Write-Host "Vérifiez que AWS CLI est configuré et que le nom de la fonction est correct" -ForegroundColor Yellow
}
