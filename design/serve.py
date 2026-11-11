# Serves the design mockups with caching turned off, so every reload shows the latest edit.
import functools
import http.server
import sys
from pathlib import Path


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
root = Path(__file__).parent / "variants"
handler = functools.partial(NoCacheHandler, directory=str(root))
http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
