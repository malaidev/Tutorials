#!/usr/bin/env python

import sys
import json
import numpy as np
import json
from PIL import Image


def create_image(raw):
   res = json.loads("".join(raw))
   raw_image_bytes = np.asarray(res['elements'])
   raw_image_bytes = (raw_image_bytes - min(raw_image_bytes)) / max(raw_image_bytes)
   IMG = np.uint8(raw_image_bytes  * 255)
   imge = Image.frombytes('RGB', (384,384), IMG, 'raw').save("output_styled_image.png")


data = sys.stdin.read()
create_image(data)
print("Created styled image 'output_styled_image.png' ")