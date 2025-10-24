@echo off
chcp 65001 >nul
color 0E
title Nettoyage du cache - Assistant Rédacteur

echo.
echo ============================================================
echo    NETTOYAGE DU CACHE - ASSISTANT RÉDACTEUR
echo ============================================================
echo.

echo [1/4] 🗑️  Suppression du dossier .vite-cache...
if exist ".vite-cache" (
    rmdir /s /q ".vite-cache"
    echo ✅ Cache Vite supprimé
) else (
    echo ℹ️  Pas de cache Vite à supprimer
)

echo.
echo [2/4] 🗑️  Suppression du dossier node_modules/.vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Cache node_modules/.vite supprimé
) else (
    echo ℹ️  Pas de cache node_modules/.vite à supprimer
)

echo.
echo [3/4] 🗑️  Suppression du dossier dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Dossier dist supprimé
) else (
    echo ℹ️  Pas de dossier dist à supprimer
)

echo.
echo [4/4] 🔄 Redémarrage du serveur PM2...
call npm run pm2:dev:restart

echo.
echo ============================================================
echo    ✅ NETTOYAGE TERMINÉ
echo ============================================================
echo.
echo 💡 Le serveur a été redémarré avec un cache propre
echo 💡 Rafraîchissez votre navigateur avec Ctrl+Shift+R
echo.
pause
