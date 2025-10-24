@echo off
cd /d "%~dp0"
npm run pm2:dev:restart
pause
