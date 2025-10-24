# Script de demarrage de tous les serveurs
# Version : 1.0
# Date : 23 Octobre 2025

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE DE TOUS LES SERVEURS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$reactAppPath = "K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app"

# Serveur 1 : Email (port 3001)
Write-Host "[1/3] Demarrage Email Server (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$reactAppPath'; npm run email-server"
Start-Sleep -Seconds 3

# Serveur 2 : React/Vite avec PM2 (port 3003)
Write-Host "[2/3] Demarrage React/Vite avec PM2 (port 3003)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$reactAppPath'; npm run pm2:dev"
Start-Sleep -Seconds 5

# Serveur 3 : Stripe (port 3005)
Write-Host "[3/3] Demarrage Stripe Backend (port 3005)..." -ForegroundColor Yellow
$stripePath = "$reactAppPath\stripe-backend"
if (Test-Path $stripePath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$stripePath'; npm start"
    Write-Host "[OK] Stripe Backend demarre" -ForegroundColor Green
} else {
    Write-Host "[INFO] Dossier stripe-backend non trouve, ignore" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SERVEURS DEMARRES" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Serveurs actifs :" -ForegroundColor White
Write-Host "  - Email Server      : http://localhost:3001" -ForegroundColor White
Write-Host "  - React/Vite (PM2)  : http://localhost:3003" -ForegroundColor White
Write-Host "  - Stripe Backend    : http://localhost:3005" -ForegroundColor White
Write-Host ""
Write-Host "Application accessible sur : http://localhost:3003" -ForegroundColor Green
Write-Host ""
Write-Host "Commandes utiles :" -ForegroundColor White
Write-Host "  - Voir logs PM2     : cd react-app; npm run pm2:dev:logs" -ForegroundColor Gray
Write-Host "  - Status PM2        : cd react-app; npm run pm2:status" -ForegroundColor Gray
Write-Host "  - Arreter PM2       : cd react-app; npm run pm2:dev:stop" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
