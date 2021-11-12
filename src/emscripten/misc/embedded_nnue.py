#!/usr/bin/env python3

#
# Generate embedded_nnue.cpp
#

import binascii

def read_file(file):
  """ Read binary file and convert to C++ char string literal"""

  with open(file, 'rb') as f:
    data = f.read()

  if sys.version_info >= (3, 8):
    data_literal = ('@' + binascii.hexlify(data).replace('@', '\\x')) # NOTE: bytes.hex(<seperator>) is from python 3.8
  else:
    h = binascii.hexlify(data)
    data_literal = ''.join('\\x' + x + y for x, y in zip(h[0::2], h[1::2]))

  return data_literal, len(data)


def main(file):
  data, size = read_file(file)
  print("extern const char* gEmbeddedNNUEData;\nextern const int gEmbeddedNNUESize;\nconst char* gEmbeddedNNUEData = \"" + data + "\";\nconst int gEmbeddedNNUESize = " + str(size) + ";")


if __name__ == '__main__':
  import sys
  assert len(sys.argv) >= 2
  main(sys.argv[1])
