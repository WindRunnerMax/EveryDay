from http.server import SimpleHTTPRequestHandler
import socketserver
from pathlib import Path
import signal
import sys
import socketserver

# kill -9 $(lsof -t -i:9001)
PORT = 9001
socketserver.TCPServer.allow_reuse_address = True

class CustomHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            error_page = Path("404.html")
            if error_page.exists():
                self.error_message_format = error_page.read_text()
                self.send_response(code)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                self.wfile.write(self.error_message_format.encode("utf-8"))
                return
        super().send_error(code, message, explain)

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at http://localhost:{PORT} with 404.html fallback")
    httpd.allow_reuse_address = True

    def signal_handler(sig, frame):
        print("Shutting Down Server...")
        httpd.socket.close()
        httpd.server_close()
        # httpd.shutdown()
        sys.exit(0)
    signal.signal(signal.SIGINT, signal_handler)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass




    
