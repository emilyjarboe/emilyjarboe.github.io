# Cuts Maverick's walking pose into a body layer + 4 leg layers (feathered tops).
import json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
SRC = '/home/user/site/images/maverick/walk.webp'
OUT = '/home/user/site/images/maverick/'
FEATHER = 18
SEEDS = {'rn': (75, 410), 'rf': (235, 425), 'fn': (385, 450), 'ff': (410, 395)}  # (x, y) inside each paw
GROUND = {'rn': 408, 'rf': 415, 'fn': 428, 'ff': 9999}   # per leg: below this row keep only pixels inside the paw outline (shadow stays on the body)
LEGS = {  # name: (polygon, cut_y, pivot)
  'rn': ([(68,300),(140,300),(140,318),(122,340),(100,368),(95,395),(95,415),(88,428),(52,430),(48,410),(50,380),(60,345),(66,318)], 325, (100,312)),
  'rf': ([(194,292),(268,292),(268,300),(260,322),(238,360),(242,392),(266,418),(270,438),(213,438),(206,400),(195,365),(192,330)], 310, (232,300)),
  'fn': ([(284,312),(366,312),(370,330),(374,345),(392,400),(416,428),(428,445),(428,468),(342,468),(338,442),(300,382),(283,345)], 330, (330,318)),
  'ff': ([(378,307),(458,307),(458,420),(390,420),(384,385),(380,345)], 325, (416,312)),
}
im = Image.open(SRC).convert('RGBA'); arr = np.array(im).astype(np.float32)
H, W = arr.shape[:2]
body = arr.copy(); meta = {}
yy = np.arange(H)[:, None].repeat(W, 1)
def polymask(poly):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255); return np.array(m) > 0
raw = {n: polymask(v[0]) for n, v in LEGS.items()}
luma = (arr[..., 0] * 299 + arr[..., 1] * 587 + arr[..., 2] * 114) / 1000
alpha = arr[..., 3]
for name, (poly, cut, pivot) in LEGS.items():
    others = np.zeros((H, W), bool)
    for o in raw:
        if o != name: others |= raw[o]
    m = ndi.binary_dilation(raw[name], iterations=4) & ~others
    # inside the paw outline near the ground
    inside = m & (luma >= 175) & (alpha > 40)
    lab, _ = ndi.label(inside)
    sx, sy = SEEDS[name]
    paw = ndi.binary_dilation(lab == lab[sy, sx], iterations=3) & (alpha > 0)
    m = np.where(yy >= GROUND[name], m & paw, m)
    ramp = np.clip((yy - (cut - FEATHER)) / FEATHER, 0, 1)
    leg = arr.copy(); leg[..., 3] = leg[..., 3] * np.where(m, ramp, 0)
    Image.fromarray(leg.astype(np.uint8)).save(OUT + 'walk-leg-' + name + '.webp', quality=90, method=6)
    body[..., 3] = np.where(m & (yy >= cut), 0, body[..., 3])
    meta[name] = {'px': round(pivot[0] / W * 100, 2), 'py': round(pivot[1] / H * 100, 2)}
# Patch the painted ground shadow where the paws used to cover it (and clear leftover outline bits)
from scipy.spatial import ConvexHull
band = (yy >= 410) & (body[..., 3] > 0)
pts = np.argwhere(band)[:, ::-1]
hull = ConvexHull(pts)
hm = Image.new('L', (W, H), 0); ImageDraw.Draw(hm).polygon([tuple(pts[i]) for i in hull.vertices], fill=255)
hull_mask = ndi.binary_erosion(np.array(hm) > 0, iterations=2)
bl = (body[..., 0] * 299 + body[..., 1] * 587 + body[..., 2] * 114) / 1000
shadow_px = band & (bl > 215)
shade = np.median(body[shadow_px][:, :4], axis=0)
fix = hull_mask & ((body[..., 3] < 200) | (bl < 215))
body[fix] = shade
Image.fromarray(body.astype(np.uint8)).save(OUT + 'walk-body.webp', quality=88, method=6)
print(json.dumps(meta))
