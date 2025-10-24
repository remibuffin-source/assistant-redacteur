@echo off
chcp 65001 >nul
color 0C
title Assistant Rédacteur - Arrêt de tous les serveurs

echo.
echo ============================================================
echo    ASSISTANT RÉDACTEUR - ARRÊT COMPLET
echo ============================================================
echo.
echo 🛑 Arrêt de tous les serveurs...
echo.

REM Aller dans le dossier react-app
cd /d "%~dp0react-app"

echo [1/3] 📱 Arrêt du serveur React/Vite (PM2)...
npm run pm2:dev:stop
timeout /t 2 /nobreak >nul

echo [2/3] 📧 Arrêt du serveur Email (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] 💳 Arrêt du serveur Stripe (port 3005)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ============================================================
echo    ✅ TOUS LES SERVEURS ONT ÉTÉ ARRÊTÉS
echo ============================================================
echo.
pause
