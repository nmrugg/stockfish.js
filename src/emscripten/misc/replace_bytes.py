#
# Replace bytes inline (used to generate feature_detection.wasm)
#

from sys import argv

assert len(argv) == 4

file, old, new = argv[1:]

assert len(old) % 2 == 0
assert len(new) % 2 == 0

def to_bytes(s):
  # e.g. "fdd5" -> b"\xfd\xd5"
  return eval("b'" + "".join("\\x" + a + b for a, b in zip(s[0::2], s[1::2])) + "'")

with open(file, 'rb') as f:
  data = f.read()

data = data.replace(to_bytes(old), to_bytes(new))

with open(file, 'wb') as f:
  f.write(data)
