@echo off
title Chef Byte Servidor
echo.
echo  ================================
echo   🧁 Chef Byte - Servidor Local
echo  ================================
echo.
echo  Iniciando servidor...
echo.

cd /d "%~dp0"

python server.py

if errorlevel 1 (
    echo.
    echo  ❌ Python no encontrado. Instala Python desde python.org
    echo  O abre index.html directamente en Chrome.
    echo.
    pause
)