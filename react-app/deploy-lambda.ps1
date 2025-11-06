# Script de déploiement Lambda pour le serveur email

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DÉPLOIEMENT LAMBDA EMAIL SERVER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Créer le dossier de build
Write-Host "1. Création du dossier de build..." -ForegroundColor Yellow
$buildDir = "lambda-build"
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

# 2. Copier les fichiers nécessaires
Write-Host "2. Copie des fichiers..." -ForegroundColor Yellow
Copy-Item lambda-email.js $buildDir/index.js
Copy-Item lambda-package.json $buildDir/package.json

# 3. Installer les dépendances
Write-Host "3. Installation des dépendances..." -ForegroundColor Yellow
Set-Location $buildDir
npm install --production --no-optional
Set-Location ..

# 4. Créer le fichier ZIP
Write-Host "4. Création du fichier ZIP..." -ForegroundColor Yellow
$zipFile = "email-lambda.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipFile

Write-Host "`n✅ Package Lambda créé: $zipFile" -ForegroundColor Green
Write-Host "`nProchaines étapes:" -ForegroundColor Cyan
Write-Host "1. Créer une fonction Lambda dans AWS Console" -ForegroundColor White
Write-Host "2. Uploader le fichier $zipFile" -ForegroundColor White
Write-Host "3. Configurer les variables d'environnement SMTP_USER et SMTP_PASS" -ForegroundColor White
Write-Host "4. Créer une API Gateway HTTP API" -ForegroundColor White
Write-Host "5. Mettre à jour VITE_EMAIL_SERVER_URL dans Amplify`n" -ForegroundColor White
