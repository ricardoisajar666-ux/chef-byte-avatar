#!/usr/bin/env python3
"""Servidor local para Chef Byte - necesario para micrófono y funciones avanzadas"""
import http.server
import socketserver
import os
import sys

PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIR)

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🧁 Chef Byte servidor activo en: http://localhost:{PORT}")
    print(f"📂 Sirviendo desde: {DIR}")
    print(f"⚠️  Presiona Ctrl+C para detener")
    print()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido.")
        sys.exit(0)