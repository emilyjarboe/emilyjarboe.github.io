"""One-time prep for the Lately bookshelf illustration.
Input: the ChatGPT bookcase (painted checkerboard background).
Output: images/shelf/bookcase.webp (real transparency, 4 favorite spines removed
into dark 'slots', laptop logo painted out) + book-1..4.webp + printed positions.
Usage: python3 tools/cut_shelf.py source.webp images/shelf/
"""
import sys, json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2].rstrip('/')
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(int)
chroma = a.max(2) - a.min(2); lum = a.mean(2)

# 1. painted checkerboard -> transparent: gray/white pixels connected to the edges
cand = (chroma <= 10) & (lum >= 200)
lab, _ = ndimage.label(cand)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge))
# pockets trapped between the vine leaves (left of the case) and above the pot
lab, _ = ndimage.label(cand & ~bg)
for i, sl in enumerate(ndimage.find_objects(lab), 1):
    ys, xs = sl
    if xs.stop <= 242 or (ys.stop <= 95 and xs.stop < 500):
        bg[sl] |= (lab[sl] == i)
bg |= ndimage.binary_dilation(bg) & ~bg & (chroma <= 16) & (lum >= 185)
alpha = np.where(bg, 0, 255).astype('uint8')
alpha = np.minimum(np.asarray(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6))), alpha)

rgb = a.copy()
# 2. paint out the laptop logo: interpolate across each row
x0, x1, y0, y1 = 748, 785, 969, 988
for y in range(y0, y1):
    L, R = rgb[y, x0], rgb[y, x1]
    for x in range(x0, x1):
        t = (x - x0) / (x1 - x0); rgb[y, x] = (L * (1 - t) + R * t)

# 3. favorite spines (x0, y0, x1, y1) in source pixels
books = [(596, 513, 627, 646), (302, 869, 341, 1018), (508, 506, 538, 646), (517, 326, 547, 465)]  # Book Thief, Scarlet Sky, Crawdads, Vacation
rgba = np.dstack([rgb, alpha]).astype('uint8')
H, W = alpha.shape
ys_, xs_ = np.nonzero(alpha > 8)
bx0, by0, bx1, by1 = xs_.min(), ys_.min(), xs_.max() + 1, ys_.max() + 1
cw, ch = bx1 - bx0, by1 - by0
pos = []
for n, (l, t, r, b) in enumerate(books, 1):
    spine = rgba[t:b, l:r].copy()
    # round the top corners a touch so no back-panel corner lifts with the book
    m = Image.new('L', (r - l, b - t), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).rounded_rectangle([0, 0, r - l - 1, b - t + 6], radius=3, fill=255)
    spine[..., 3] = np.minimum(spine[..., 3], np.asarray(m))
    Image.fromarray(spine).save(f'{out}/book-{n}.webp', quality=90, method=6)
    # slot: the back panel colour from just above the book, in deep shadow
    panel = a[max(t - 10, 0):t - 3, l:r].reshape(-1, 3).mean(0)
    xx = np.linspace(-1, 1, r - l)[None, :]; yy = np.linspace(0, 1, b - t)[:, None]
    shade = 0.42 + 0.16 * (1 - np.abs(xx) ** 2) + 0.06 * yy
    rgba[t:b, l:r, :3] = np.clip(panel[None, None, :] * shade[..., None], 0, 255).astype('uint8')
    rgba[t:b, l:r, 3] = 255
    pos.append({'n': n, 'left': round((l - bx0) / cw * 100, 3), 'top': round((t - by0) / ch * 100, 3),
                'width': round((r - l) / cw * 100, 3), 'height': round((b - t) / ch * 100, 3),
                'color': '#%02x%02x%02x' % tuple(int(v) for v in a[t + (b - t) * 2 // 3, (l + r) // 2])})
case = Image.fromarray(rgba).crop((bx0, by0, bx1, by1))
case.save(f'{out}/bookcase.webp', quality=80, method=6)
print(json.dumps({'size': [int(cw), int(ch)], 'origin': [int(bx0), int(by0)], 'books': pos}, indent=1))
