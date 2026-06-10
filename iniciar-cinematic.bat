@echo off
title Chef Byte - Modo Cinematográfico
echo.
echo  ========================================
echo   Chef Byte - Avatar Cinematografico
echo  ========================================
echo.
echo  Iniciando modo cinematografico...
echo.

cd /d "%~dp0"

python -c "import http.server,socketserver,os;os.chdir(os.path.dirname(os.path.abspath('.')));Handler=http.server.SimpleHTTPRequestHandler;Handler.extensions_map.update({'.js':'application/javascript'});httpd=socketserver.TCPServer(('',8081),Handler);print('Server activo en: http://localhost:8081');print('Abre index-cinematic.html en Chrome');httpd.serve_forever()"

if errorlevel 1 (
    echo.
    echo  Abre index-cinematic.html directamente en Chrome.
    echo.
    pause
)
