@echo off
echo 🚀 ONE-CLICK UBUNTU SETUP
echo ========================
echo.
echo This will automatically setup everything on Ubuntu:
echo - Install MongoDB
echo - Install Node.js
echo - Install dependencies
echo - Generate environment keys
echo - Setup database with multiple users
echo - Start the web server
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo 📡 Connecting to Ubuntu and running setup...
echo.

REM Run the auto setup script on Ubuntu
ssh -o StrictHostKeyChecking=no ubuntu@192.168.205.128 "cd ~/sqli-bruteforce-attack && npm run auto-setup-ubuntu"

echo.
echo 🎉 Setup completed!
echo 🌐 Open your browser and go to: http://192.168.205.128:3000
echo.
echo 📋 Login with any of these users:
echo    admin / Admin123!@#
echo    security / Security123!@#
echo    john / John123!@#
echo    sarah / Sarah123!@#
echo    mike / Mike123!@#
echo    emma / Emma123!@#
echo    alex / Alex123!@#
echo    lisa / Lisa123!@#
echo    david / David123!@#
echo    test / Test123!@#
echo.
pause
