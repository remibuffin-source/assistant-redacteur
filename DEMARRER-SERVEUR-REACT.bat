@echo off
chcp 65001 >nul
color 0A
title Assistant Rédacteur - Serveur React/Vite

echo.
echo ============================================================
echo    ASSISTANT RÉDACTEUR - DÉMARRAGE SERVEUR REACT
echo ============================================================
echo.

REM Aller dans le dossier react-app
cd /d "%~dp0react-app"

echo Demarrage du serveur React/Vite sur port 3003...
echo.

npm run dev

pause
