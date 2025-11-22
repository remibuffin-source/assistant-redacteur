# Script pour créer le ZIP Lambda manuellement

$BUILD_DIR = ".\react-app\lambda-auth-build"
$ZIP_FILE = "lambda-auth-deployment.zip"

Write-Host "Preparation du package Lambda..." -ForegroundColor Yellow

# Nettoyer
if (Test-Path $BUILD_DIR) {
    Remove-Item -Recurse -Force $BUILD_DIR
}
if (Test-Path $ZIP_FILE) {
    Remove-Item $ZIP_FILE
}

# Créer le dossier
New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null

# Copier les fichiers
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
Copy-Item ".\react-app\lambda-auth.js" "$BUILD_DIR\index.js"
Copy-Item ".\react-app\lambda-auth-package.json" "$BUILD_DIR\package.json"

# Installer les dépendances
Write-Host "Installation des dependances..." -ForegroundColor Yellow
Push-Location $BUILD_DIR
npm install --production --no-fund --no-audit
Pop-Location

# Créer le ZIP
Write-Host "Creation du ZIP..." -ForegroundColor Yellow
Push-Location $BUILD_DIR
Compress-Archive -Path * -DestinationPath "..\$ZIP_FILE"
Pop-Location

# Nettoyer
Remove-Item -Recurse -Force $BUILD_DIR

Write-Host ""
Write-Host "ZIP cree: $ZIP_FILE" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant:" -ForegroundColor Cyan
Write-Host "1. Allez dans AWS Lambda Console" -ForegroundColor White
Write-Host "2. Selectionnez votre fonction assistant-redacteur-auth" -ForegroundColor White
Write-Host "3. Cliquez sur Upload from > .zip file" -ForegroundColor White
Write-Host "4. Selectionnez le fichier: $ZIP_FILE" -ForegroundColor White
Write-Host "5. Cliquez sur Save" -ForegroundColor White
