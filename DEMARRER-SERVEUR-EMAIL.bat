@echo off
chcp 65001 >nul
color 0B
title Serveur Email - Assistant Rédacteur

echo.
echo ============================================================
echo    📧 DÉMARRAGE SERVEUR EMAIL - ASSISTANT RÉDACTEUR
echo ============================================================
echo.

cd /d "%~dp0react-app"

echo [1/2] 🔍 Vérification de la configuration...
if not exist ".env.local" (
    echo.
    echo ❌ ERREUR : Fichier .env.local introuvable !
    echo.
    echo 📝 Créez le fichier .env.local avec :
    echo    VITE_EMAIL_USER=votre_email@gmail.com
    echo    VITE_EMAIL_PASSWORD=votre_mot_de_passe_16_chiffres
    echo.
    pause
    exit /b 1
)

echo ✅ Configuration trouvée
echo.

echo [2/2] 🚀 Démarrage du serveur email sur le port 3001...
echo.
echo 💡 Le serveur restera ouvert dans cette fenêtre
echo 💡 Pour arrêter : Fermez cette fenêtre ou appuyez sur Ctrl+C
echo.
echo ============================================================
echo.

node server.js

pause
