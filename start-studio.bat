@echo off
chcp 65001 > nul
title CineBoard Studio - AI Director Launcher
echo ======================================================================
echo CineBoard Studio - Starting Backend and Frontend...
echo ======================================================================

cd /d "%~dp0server"
start "CineBoard Backend Server" cmd /k "node index.js"

cd /d "%~dp0client"
start "CineBoard Frontend Server" cmd /k "npm run dev -- --host"

echo.
echo Servers started successfully!
echo Opening http://localhost:5173 in your default browser...
timeout /t 3 > nul
start http://localhost:5173
exit
