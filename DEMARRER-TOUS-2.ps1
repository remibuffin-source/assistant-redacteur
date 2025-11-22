# Script de demarrage de tous les serveurs (incluant le backend Node)
# Version : 2.0
# Date : 19 Novembre 2025

Write-Host "" 
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE DE TOUS LES SERVEURS (FRONT + BACKEND)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "" 

$projectRoot = "K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur"
$reactAppPath = "$projectRoot\react-app"
$backendPath  = "$projectRoot\backend"

# Serveur 1 : Email (port 3001)
Write-Host "[1/4] Demarrage Email Server (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$reactAppPath'; npm run email-server"
Start-Sleep -Seconds 3

# Serveur 2 : React/Vite avec PM2 (port 3003)
Write-Host "[2/4] Demarrage React/Vite avec PM2 (port 3003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$reactAppPath'; npm run pm2:dev"
Start-Sleep -Seconds 5

# Serveur 3 : Stripe (port 3005)
Write-Host "[3/4] Demarrage Stripe Backend (port 3005)..." -ForegroundColor Yellow
$stripePath = "$reactAppPath\stripe-backend"
if (Test-Path $stripePath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$stripePath'; npm start"
    Write-Host "[OK] Stripe Backend demarre" -ForegroundColor Green
} else {
    Write-Host "[INFO] Dossier stripe-backend non trouve, ignore" -ForegroundColor Gray
}

# Serveur 4 : Backend principal (port 4000)
Write-Host "[4/4] Demarrage Backend Assistant-Redacteur (port 4000)..." -ForegroundColor Yellow
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"
    Write-Host "[OK] Backend Assistant-Redacteur demarre (port 4000)" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Dossier backend non trouve" -ForegroundColor Red
}

Write-Host "" 
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SERVEURS DEMARRES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "" 

Write-Host "Serveurs actifs :" -ForegroundColor Green
Write-Host "  - Email Server      : http://localhost:3001"
Write-Host "  - React/Vite (PM2)  : http://localhost:3003"
Write-Host "  - Stripe Backend    : http://localhost:3005"
Write-Host "  - Backend API       : http://localhost:4000" 

Write-Host "" 
Write-Host "Application accessible sur : http://localhost:3003" -ForegroundColor Cyan
Write-Host "" 

Write-Host "Commandes utiles :" -ForegroundColor Yellow
Write-Host "  - Voir logs PM2     : cd react-app; npm run pm2:dev:logs"
Write-Host "  - Status PM2        : cd react-app; npm run pm2:status"
Write-Host "  - Arreter PM2       : cd react-app; npm run pm2:dev:stop"

Write-Host "" 
Write-Host "Appuyez sur une touche pour fermer..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
