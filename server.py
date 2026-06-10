import http.server
import socketserver
PORT=8081
Handler=http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("",PORT),Handler)as httpd:
print(f"Servidor Avatares en http://localhost:{PORT}")
httpd.serve_forever()
