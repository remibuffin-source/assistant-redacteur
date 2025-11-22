# Script de création de l'utilisateur administrateur dans DynamoDB
# Nécessite AWS CLI configuré

$TABLE_NAME = "assistant-redacteur-users"
$REGION = "eu-west-1"

# Informations admin (depuis COMPTES-AUTHENTIFICATION.md)
$ADMIN_EMAIL = "admin@studioducapbrun.com"
$ADMIN_PASSWORD = "AdminStudio2025!"
$ADMIN_FIRSTNAME = "Admin"
$ADMIN_LASTNAME = "Studio du Cap Brun"

Write-Host "👤 Création de l'utilisateur administrateur..." -ForegroundColor Cyan
Write-Host ""

# Désactiver le pager AWS
$env:AWS_PAGER = ""

# Générer un hash bcrypt du mot de passe
# Note: Nous utilisons un hash pré-calculé pour bcrypt avec 10 rounds
# Le mot de passe "AdminStudio2025!" hashé avec bcrypt (10 rounds)
# Vous devrez peut-être ajuster ce hash si vous changez le mot de passe

Write-Host "⚠️  IMPORTANT: Ce script nécessite Node.js pour hasher le mot de passe" -ForegroundColor Yellow
Write-Host "Création du script de hashage..." -ForegroundColor Yellow

# Créer un script Node.js temporaire pour hasher le mot de passe
$hashScript = @"
const bcrypt = require('bcryptjs');
const password = '$ADMIN_PASSWORD';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
    console.log(hash);
});
"@

$hashScript | Out-File -FilePath ".\temp-hash.js" -Encoding UTF8

# Installer bcryptjs si nécessaire
if (!(Test-Path ".\node_modules\bcryptjs")) {
    Write-Host "Installation de bcryptjs..." -ForegroundColor Yellow
    npm install bcryptjs --no-save
}

# Générer le hash
Write-Host "Génération du hash du mot de passe..." -ForegroundColor Yellow
$hashedPassword = node .\temp-hash.js

if (!$hashedPassword) {
    Write-Host "❌ Erreur lors du hashage du mot de passe" -ForegroundColor Red
    Remove-Item ".\temp-hash.js"
    exit 1
}

Write-Host "✅ Hash généré" -ForegroundColor Green

# Nettoyer le script temporaire
Remove-Item ".\temp-hash.js"

# Créer l'utilisateur dans DynamoDB
Write-Host ""
Write-Host "Création de l'utilisateur dans DynamoDB..." -ForegroundColor Yellow

$userId = [guid]::NewGuid().ToString()
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$item = @{
    email = @{ S = $ADMIN_EMAIL }
    userId = @{ S = $userId }
    password = @{ S = $hashedPassword }
    firstName = @{ S = $ADMIN_FIRSTNAME }
    lastName = @{ S = $ADMIN_LASTNAME }
    credits = @{ N = "1000" }
    createdAt = @{ S = $now }
    isVerified = @{ BOOL = $true }
    isAdmin = @{ BOOL = $true }
    lastLogin = @{ S = $now }
} | ConvertTo-Json -Compress

aws dynamodb put-item `
    --table-name $TABLE_NAME `
    --item $item `
    --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Utilisateur administrateur créé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Identifiants de connexion:" -ForegroundColor Cyan
    Write-Host "   Email    : $ADMIN_EMAIL" -ForegroundColor White
    Write-Host "   Password : $ADMIN_PASSWORD" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Vous pouvez maintenant tester la connexion!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la création de l'utilisateur" -ForegroundColor Red
}
