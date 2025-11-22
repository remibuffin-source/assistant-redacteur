# Script pour récupérer l'ARN du certificat SSL

Write-Host "Récupération des certificats SSL..." -ForegroundColor Cyan

aws acm list-certificates --region eu-west-1 --query 'CertificateSummaryList[?DomainName==`assistant-redacteur.fr`]' --output table

Write-Host "`nCopie l'ARN du certificat et remplace-le dans:" -ForegroundColor Yellow
Write-Host "backend\.ebextensions\https-listener.config" -ForegroundColor Green
Write-Host "à la ligne: SSLCertificateArns" -ForegroundColor Green
