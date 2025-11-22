# Script pour déployer la configuration HTTPS

Write-Host "🔒 Déploiement de la configuration HTTPS..." -ForegroundColor Cyan

cd backend

# Commit les changements
git add .ebextensions/https-listener.config
git commit -m "Config: Ajout listener HTTPS avec certificat SSL"

# Déployer sur Elastic Beanstalk
Write-Host "`n🚀 Déploiement sur Elastic Beanstalk..." -ForegroundColor Yellow
eb deploy

Write-Host "`n✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "Attends 5 minutes que la configuration se propage." -ForegroundColor Cyan
