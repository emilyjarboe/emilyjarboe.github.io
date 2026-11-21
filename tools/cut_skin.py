"""One-time prep for the Lately skincare tray illustration.
Re-letters the Mediheal jar, cuts each product's visible part into its own
layer (products overlap, so each layer is its outline minus what sits in front),
and prints positions as % of the trimmed image.
Usage: python3 tools/cut_skin.py source.webp images/shelf/
"""
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

src, out = sys.argv[1], sys.argv[2].rstrip('/')
im = Image.open(src).convert('RGBA')
W, H = im.size

# ---- 1. re-letter the jar: "WATERMIDE TONER PADS" -> "MADECASSOSIDE BLEMISH PADS"
a = np.asarray(im).astype(float)
x0, x1, y0, y1 = 826, 1032, 822, 899
for y in range(y0, y1):
    L = a[y, x0 - 4:x0].mean(0); R = a[y, x1:x1 + 4].mean(0)
    t = np.linspace(0, 1, x1 - x0)[:, None]
    a[y, x0:x1] = L * (1 - t) + R * t
im = Image.fromarray(a.clip(0, 255).astype('uint8'))
txt = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
F = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
ink = (240, 244, 250, 240)
def line(text, y, size, track):
    f = ImageFont.truetype(F, size); x = 834
    for ch in text:
        d.text((x, y), ch, font=f, fill=ink); x += f.getlength(ch) + track
line('MADECASSOSIDE', 829, 19, 0.6)
line('BLEMISH PADS', 852, 19, 0.6)
line('Calming  ·  Soothing', 878, 12, 0.3)
im.alpha_composite(txt.filter(ImageFilter.GaussianBlur(0.35)))

# ---- 2. product outlines (source pixels), back to front
P = {
  'cleanser': [(252,85),(262,72),(300,68),(430,68),(440,80),(438,110),(437,228),(452,232),(458,250),(458,298),(500,300),(515,310),(520,330),(520,880),(510,893),(265,893),(254,880),(252,330),(257,310),(270,300),(312,298),(312,250),(318,232),(342,228),(342,112),(300,110),(265,112),(253,100)],
  'tube': [(638,232),(645,225),(955,225),(962,232),(962,258),(955,264),(932,900),(925,906),(712,906),(704,900),(645,264),(638,258)],
  'serum': [(590,300),(605,303),(618,315),(625,335),(625,415),(660,418),(662,528),(672,540),(688,555),(698,575),(700,600),(700,895),(692,910),(675,917),(500,917),(485,910),(478,895),(478,600),(482,575),(492,556),(508,540),(520,528),(520,418),(553,415),(553,335),(560,315),(573,303)],
  'jar': [(738,665),(742,652),(755,645),(790,642),(1030,642),(1072,646),(1083,656),(1086,700),(1085,900),(1080,912),(1065,918),(760,918),(745,912),(739,900)],
}
order = ['cleanser', 'tube', 'serum', 'jar']          # back to front
routine = ['cleanser', 'jar', 'serum', 'tube']        # step 1..4: cleanse, pad, serum, moisturize
def mask(poly):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255); return np.asarray(m) > 0
alpha = np.asarray(im)[..., 3]
ys, xs = np.nonzero(alpha > 8)
bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
cw, ch = bx1 - bx0, by1 - by0
rgba = np.asarray(im)
res = []
for n, name in enumerate(routine, 1):
    vis = mask(P[name])
    for front in order[order.index(name) + 1:]:
        vis &= ~mask(P[front])
    m = Image.fromarray((vis * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.7))
    layer = rgba.copy(); layer[..., 3] = np.minimum(layer[..., 3], np.asarray(m))
    px = [p[0] for p in P[name]]; py = [p[1] for p in P[name]]
    l, t, r, b = min(px), min(py), max(px) + 1, max(py) + 1
    Image.fromarray(layer).crop((l, t, r, b)).save(f'{out}/skin-{n}.webp', quality=88, method=6)
    res.append({'n': n, 'name': name,
      'l': round((l - bx0) / cw * 100, 3), 't': round((t - by0) / ch * 100, 3),
      'w': round((r - l) / cw * 100, 3), 'h': round((b - t) / ch * 100, 3),
      'clip': ' '.join(f'{round((x - l) / (r - l) * 100, 2)}% {round((y - t) / (b - t) * 100, 2)}%,' for x, y in P[name]).rstrip(',')})
im.crop((bx0, by0, bx1, by1)).save(f'{out}/skincare.webp', quality=84, method=6)
print(json.dumps({'size': [int(cw), int(ch)], 'products': res}, indent=1))
