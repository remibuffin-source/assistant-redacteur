# Mettre à jour le mot de passe admin avec le bon hash

Write-Host "Mise a jour du mot de passe admin..." -ForegroundColor Yellow

$key = '{"email":{"S":"admin@studioducapbrun.com"}}'
$key | Out-File -FilePath ".\temp-key.json" -Encoding ASCII -NoNewline

$values = '{":pwd":{"S":"$2b$10$.cL9F.UUifkwLi0pzInXF.kq5zrDV3HZVu06Rd7LreUxMVwieNF1y"}}'
$values | Out-File -FilePath ".\temp-values.json" -Encoding ASCII -NoNewline

aws dynamodb update-item `
    --table-name assistant-redacteur-users `
    --key file://temp-key.json `
    --update-expression "SET password = :pwd" `
    --expression-attribute-values file://temp-values.json `
    --region eu-west-1

Remove-Item ".\temp-key.json" -ErrorAction SilentlyContinue
Remove-Item ".\temp-values.json" -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Mot de passe mis a jour!" -ForegroundColor Green
} else {
    Write-Host "Erreur" -ForegroundColor Red
}
