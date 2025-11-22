# Script de déploiement de la Lambda d'authentification
# Nécessite AWS CLI configuré

$FUNCTION_NAME = "assistant-redacteur-auth"
$REGION = "eu-west-1"
$SOURCE_DIR = ".\react-app"
$BUILD_DIR = ".\react-app\lambda-auth-build"

Write-Host "🚀 Déploiement de la Lambda d'authentification..." -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Créer le dossier de build
Write-Host "[1/5] Préparation du dossier de build..." -ForegroundColor Yellow
if (Test-Path $BUILD_DIR) {
    Remove-Item -Recurse -Force $BUILD_DIR
}
New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null

# Étape 2 : Copier le code Lambda
Write-Host "[2/5] Copie du code Lambda..." -ForegroundColor Yellow
Copy-Item "$SOURCE_DIR\lambda-auth.js" "$BUILD_DIR\index.js"
Copy-Item "$SOURCE_DIR\lambda-auth-package.json" "$BUILD_DIR\package.json"

# Étape 3 : Installer les dépendances
Write-Host "[3/5] Installation des dépendances npm..." -ForegroundColor Yellow
Push-Location $BUILD_DIR
npm install --production
Pop-Location

# Étape 4 : Créer le package ZIP
Write-Host "[4/5] Création du package ZIP..." -ForegroundColor Yellow
$ZIP_FILE = "lambda-auth-deployment.zip"
if (Test-Path $ZIP_FILE) {
    Remove-Item $ZIP_FILE
}

Push-Location $BUILD_DIR
Compress-Archive -Path * -DestinationPath "..\$ZIP_FILE"
Pop-Location

# Étape 5 : Déployer sur AWS Lambda
Write-Host "[5/5] Déploiement sur AWS Lambda..." -ForegroundColor Yellow
aws lambda update-function-code `
    --function-name $FUNCTION_NAME `
    --zip-file "fileb://$SOURCE_DIR\$ZIP_FILE" `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Lambda déployée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Attendez 5-10 secondes que la Lambda soit mise à jour, puis testez:" -ForegroundColor Cyan
    Write-Host "Invoke-RestMethod -Uri 'https://2si3fl5hx65k7i6pwaia352zya0izdxg.lambda-url.eu-west-1.on.aws/login' -Method Post -ContentType 'application/json' -Body '{\"email\":\"admin@studioducapbrun.com\",\"password\":\"AdminStudio2025!\"}'"
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
}

# Nettoyage
Write-Host ""
Write-Host "Nettoyage..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $BUILD_DIR
Remove-Item "$SOURCE_DIR\$ZIP_FILE"

Write-Host "✅ Terminé!" -ForegroundColor Green
