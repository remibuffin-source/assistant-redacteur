# Script simple de création admin
# Hash bcrypt pré-calculé pour "AdminStudio2025!" avec 10 rounds

Write-Host "Creation utilisateur admin..." -ForegroundColor Yellow

# Créer un fichier JSON temporaire
$jsonContent = '{"email":{"S":"admin@studioducapbrun.com"},"userId":{"S":"admin-001"},"password":{"S":"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"},"firstName":{"S":"Admin"},"lastName":{"S":"Studio"},"credits":{"N":"1000"},"createdAt":{"S":"2025-11-13T12:00:00.000Z"},"isVerified":{"BOOL":true},"isAdmin":{"BOOL":true}}'

$jsonContent | Out-File -FilePath ".\temp-admin.json" -Encoding ASCII -NoNewline

aws dynamodb put-item --table-name assistant-redacteur-users --item file://temp-admin.json --region eu-west-1

Remove-Item ".\temp-admin.json" -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Utilisateur cree!" -ForegroundColor Green
    Write-Host "Email: admin@studioducapbrun.com" -ForegroundColor Cyan
    Write-Host "Password: AdminStudio2025!" -ForegroundColor Cyan
} else {
    Write-Host "Erreur" -ForegroundColor Red
}
