@echo off
title StockHub - 1-Click Starter
color 0b
echo ========================================================================
echo         WELCOME TO STOCKHUB INVENTORY MANAGEMENT SYSTEM
echo ========================================================================
echo.
echo Checking if Docker is running on your system...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Docker is not running or not installed!
    echo Please make sure "Docker Desktop" is open and running on your computer.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker engine detected!
echo.
echo Downloading and launching StockHub from Cloud (Docker Hub)...
echo Please wait a moment while the application starts...
echo.

docker-compose -f docker-compose.standalone.yml up -d --pull always

echo.
echo ========================================================================
echo      🎉 SUCCESS! STOCKHUB IS NOW RUNNING ON YOUR COMPUTER! 🎉
echo ========================================================================
echo.
echo Opening StockHub in your default web browser...
start http://localhost

echo.
echo ========================================================================
echo   DEMO LOGIN CREDENTIALS:
echo   ----------------------------------------------------------------------
echo   Business Owner Role:   john@stockhub.com    /   password123
echo   Super Admin Role:      admin@stockhub.com   /   admin123
echo ========================================================================
echo.
echo To stop the application later, just close Docker Desktop or run:
echo docker-compose -f docker-compose.standalone.yml down
echo.
pause
