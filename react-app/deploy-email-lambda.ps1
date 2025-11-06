# Script de redéploiement Lambda Email

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REDÉPLOIEMENT LAMBDA EMAIL" -ForegroundColor Cyan
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
Copy-Item lambda-email-ses.js $buildDir/index.js
Copy-Item lambda-ses-package.json $buildDir/package.json

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
Write-Host "`nMaintenant, uploadez ce fichier dans Lambda :" -ForegroundColor Cyan
Write-Host "1. Allez sur https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/email-service" -ForegroundColor White
Write-Host "2. Code source -> Upload from -> .zip file" -ForegroundColor White
Write-Host "3. Sélectionnez email-lambda.zip" -ForegroundColor White
Write-Host "4. Save`n" -ForegroundColor White
