# Script de diagnostic Stripe
# Vérifie la configuration et l'état du serveur

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTIC SERVEUR STRIPE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$stripePath = "K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app\stripe-backend"

# 1. Vérifier que le dossier existe
Write-Host "[1/5] Verification du dossier stripe-backend..." -ForegroundColor Yellow
if (Test-Path $stripePath) {
    Write-Host "  [OK] Dossier trouve : $stripePath" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] Dossier non trouve !" -ForegroundColor Red
    exit 1
}

# 2. Vérifier le fichier .env
Write-Host ""
Write-Host "[2/5] Verification du fichier .env..." -ForegroundColor Yellow
$envFile = "$stripePath\.env"
if (Test-Path $envFile) {
    Write-Host "  [OK] Fichier .env existe" -ForegroundColor Green
    
    # Lire le contenu (sans afficher les clés sensibles)
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "STRIPE_SECRET_KEY=sk_") {
        Write-Host "  [OK] STRIPE_SECRET_KEY est configuree" -ForegroundColor Green
    } elseif ($envContent -match "STRIPE_SECRET_KEY=.*your.*key") {
        Write-Host "  [ATTENTION] STRIPE_SECRET_KEY contient une valeur par defaut" -ForegroundColor Yellow
        Write-Host "  [ACTION] Remplacez par votre vraie cle Stripe" -ForegroundColor Yellow
    } else {
        Write-Host "  [ERREUR] STRIPE_SECRET_KEY non trouvee ou invalide" -ForegroundColor Red
    }
} else {
    Write-Host "  [ERREUR] Fichier .env non trouve !" -ForegroundColor Red
    Write-Host "  [ACTION] Copiez .env.example vers .env et configurez vos cles" -ForegroundColor Yellow
}

# 3. Vérifier node_modules
Write-Host ""
Write-Host "[3/5] Verification des dependances..." -ForegroundColor Yellow
$nodeModules = "$stripePath\node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  [OK] node_modules existe" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] node_modules non trouve !" -ForegroundColor Red
    Write-Host "  [ACTION] Executez : cd stripe-backend && npm install" -ForegroundColor Yellow
}

# 4. Vérifier si le port 3005 est utilisé
Write-Host ""
Write-Host "[4/5] Verification du port 3005..." -ForegroundColor Yellow
$port3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue
if ($port3005) {
    Write-Host "  [OK] Port 3005 est actif (LISTEN)" -ForegroundColor Green
    Write-Host "  [INFO] PID: $($port3005[0].OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "  [ATTENTION] Port 3005 n'est pas actif" -ForegroundColor Yellow
    Write-Host "  [INFO] Le serveur Stripe n'est probablement pas demarre" -ForegroundColor Gray
}

# 5. Tester l'endpoint health
Write-Host ""
Write-Host "[5/5] Test de l'endpoint /api/health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/health" -TimeoutSec 3 -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "  [OK] Serveur repond correctement !" -ForegroundColor Green
    Write-Host "  [REPONSE] $($json.message)" -ForegroundColor Gray
} catch {
    Write-Host "  [ERREUR] Serveur ne repond pas" -ForegroundColor Red
    Write-Host "  [DETAILS] $($_.Exception.Message)" -ForegroundColor Gray
}

# Résumé
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   RESUME DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Recommandations
Write-Host "ACTIONS RECOMMANDEES :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifiez le fichier .env dans stripe-backend/" -ForegroundColor White
Write-Host "   - Ouvrez : $stripePath\.env" -ForegroundColor Gray
Write-Host "   - Remplacez STRIPE_SECRET_KEY par votre cle de test Stripe" -ForegroundColor Gray
Write-Host "   - Format : sk_test_..." -ForegroundColor Gray
Write-Host ""
Write-Host "2. Si le serveur ne demarre pas, regardez les logs :" -ForegroundColor White
Write-Host "   - Ouvrez la fenetre 'Stripe Backend - Port 3005'" -ForegroundColor Gray
Write-Host "   - Cherchez les messages d'erreur en rouge" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Pour obtenir vos cles Stripe :" -ForegroundColor White
Write-Host "   - Allez sur : https://dashboard.stripe.com/" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'Developpeurs' > 'Cles API'" -ForegroundColor Gray
Write-Host "   - Activez le mode TEST (toggle en haut)" -ForegroundColor Gray
Write-Host "   - Copiez la 'Cle secrete' (sk_test_...)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Redemarrez les serveurs apres modification :" -ForegroundColor White
Write-Host "   - Fermez toutes les fenetres" -ForegroundColor Gray
Write-Host "   - Relancez : DEMARRER-TOUS.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
