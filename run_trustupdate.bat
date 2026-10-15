@echo off
title TrustUpdate System Launcher
echo ========================================================
echo        Starting TrustUpdate Platform (Backend + Frontend)
echo ========================================================
echo.

echo [1/2] Launching Backend Server on port 5000...
start "TrustUpdate Backend (Port 5000)" cmd /k "cd /d %~dp0server && node server.js"

echo.
echo [2/2] Launching Frontend Web App on port 3000...
start "TrustUpdate Frontend (Port 3000)" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ========================================================
echo  All services started!
echo  Web App:     http://localhost:3000
echo  API Server:  http://localhost:5000
echo  phpMyAdmin:  http://localhost/phpmyadmin
echo ========================================================
echo.
pause
