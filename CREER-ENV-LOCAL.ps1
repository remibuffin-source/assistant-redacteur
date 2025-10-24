# Script pour créer automatiquement le fichier .env.local
# avec les clés Stripe de test

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   CREATION DU FICHIER .env.local" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$reactAppPath = "K:\developpement_app_site_web\assistant_redactionnel\assistant_redacteur\react-app"
$envLocalPath = "$reactAppPath\.env.local"

# Contenu du fichier .env.local
$envContent = @"
# ============================================
# CONFIGURATION STRIPE - Assistant Rédacteur
# ============================================
# Fichier généré automatiquement
# Date: $(Get-Date -Format "dd/MM/yyyy HH:mm")

# Clé publique Stripe (mode TEST)
# À remplacer par votre vraie clé publique de test
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI

# ============================================
# INSTRUCTIONS
# ============================================
# 1. Allez sur https://dashboard.stripe.com/
# 2. Cliquez sur "Développeurs" > "Clés API"
# 3. Activez le mode TEST (toggle en haut à droite)
# 4. Copiez la "Clé publiable" (pk_test_...)
# 5. Remplacez VOTRE_CLE_PUBLIQUE_ICI ci-dessus
# 6. Sauvegardez ce fichier
# 7. Redémarrez les serveurs (DEMARRER-TOUS.ps1)

# ⚠️ IMPORTANT : Ne commitez JAMAIS ce fichier dans Git !
"@

# Vérifier si le fichier existe déjà
if (Test-Path $envLocalPath) {
    Write-Host "[INFO] Le fichier .env.local existe deja" -ForegroundColor Yellow
    Write-Host "[INFO] Emplacement : $envLocalPath" -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "Voulez-vous le remplacer ? (O/N)"
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "[ANNULE] Fichier non modifie" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
}

# Créer le fichier
try {
    $envContent | Out-File -FilePath $envLocalPath -Encoding UTF8 -Force
    Write-Host "[OK] Fichier .env.local cree avec succes !" -ForegroundColor Green
    Write-Host "[INFO] Emplacement : $envLocalPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "   PROCHAINES ETAPES" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Ouvrez le fichier .env.local qui vient d'etre cree" -ForegroundColor White
    Write-Host "   Emplacement : $envLocalPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Allez sur votre dashboard Stripe :" -ForegroundColor White
    Write-Host "   https://dashboard.stripe.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Cliquez sur 'Developpeurs' > 'Cles API'" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Activez le mode TEST (toggle en haut a droite)" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Copiez la 'Cle publiable' (pk_test_...)" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Remplacez VOTRE_CLE_PUBLIQUE_ICI dans .env.local" -ForegroundColor White
    Write-Host ""
    Write-Host "7. Sauvegardez le fichier" -ForegroundColor White
    Write-Host ""
    Write-Host "8. Redemarrez les serveurs :" -ForegroundColor White
    Write-Host "   - Fermez toutes les fenetres" -ForegroundColor Gray
    Write-Host "   - Relancez DEMARRER-TOUS.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Proposer d'ouvrir le fichier
    $openFile = Read-Host "Voulez-vous ouvrir le fichier maintenant ? (O/N)"
    if ($openFile -eq "O" -or $openFile -eq "o") {
        Start-Process notepad $envLocalPath
    }
    
} catch {
    Write-Host "[ERREUR] Impossible de creer le fichier" -ForegroundColor Red
    Write-Host "[DETAILS] $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
