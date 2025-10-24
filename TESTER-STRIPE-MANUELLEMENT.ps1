# Script pour tester manuellement le serveur Stripe
# et voir les erreurs en direct

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   TEST MANUEL DU SERVEUR STRIPE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$stripePath = "K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\stripe-backend"

Write-Host "Demarrage du serveur Stripe..." -ForegroundColor Yellow
Write-Host "Dossier : $stripePath" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur CTRL+C pour arreter le serveur" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier stripe-backend
Set-Location $stripePath

# Démarrer le serveur en mode visible
npm start
