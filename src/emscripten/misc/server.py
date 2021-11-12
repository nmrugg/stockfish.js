#
# Workaround browser security header (currently only Firefox seems strict about this)
#
# cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes
#

import argparse
import os
import http.server
import functools


class MyHandler(http.server.SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header("Cross-Origin-Opener-Policy", "same-origin")
    self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
    super(MyHandler, self).end_headers()


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--directory', type=str, default=os.getcwd())
  parser.add_argument('--port', type=int, default=8000)
  args = parser.parse_args()
  http.server.test(
    ServerClass=http.server.HTTPServer,
    HandlerClass=functools.partial(MyHandler, directory=args.directory),
    port=args.port
  )
