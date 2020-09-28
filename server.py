import http.server
import socketserver

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", 8080), Handler) as httpd:
	print("serving at port 8080")

	httpd.serve_forever()