"""Texture del tagliere della pagina Chef (assets/wood-board.webp): una sola tavola, venature "a cattedrale".

Gli anelli di un tronco tagliato con un piano che non passa per il centro diventano archi
allungati: anello = distanza dall'asse del tronco, con la profondità del taglio che varia lungo la
tavola. La profondità è periodica in x, così la texture si ripete in orizzontale senza giunta.

Uso (serve Python con numpy e Pillow, solo per rigenerare l'immagine; il sito non ne ha bisogno):
    pip install numpy pillow
    python tools/make-wood-texture.py assets/wood-board.webp 2400 640 3

Per un legno diverso: cambia il seed, i colori `base` e `deep` o la larghezza degli anelli (`widths`).
La texture deve restare 2400x640: chef.html la usa con queste misure.
"""
import sys

import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/wood-board.webp'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 2400
H = int(sys.argv[3]) if len(sys.argv) > 3 else 640
SEED = int(sys.argv[4]) if len(sys.argv) > 4 else 3
rng = np.random.default_rng(SEED)


def vnoise(cell_x, cell_y):
    nx = max(1, round(W / cell_x))
    ny = int(np.ceil(H / cell_y)) + 2
    g = rng.random((ny, nx))
    xs = np.arange(W) / W * nx
    ys = np.arange(H) / cell_y
    x0 = np.floor(xs).astype(int)
    fx = xs - x0
    x1 = (x0 + 1) % nx
    x0 %= nx
    y0 = np.floor(ys).astype(int)
    fy = ys - y0
    y1 = y0 + 1
    sx = fx * fx * (3 - 2 * fx)
    sy = (fy * fy * (3 - 2 * fy))[:, None]
    a, b = g[y0][:, x0], g[y0][:, x1]
    c, d = g[y1][:, x0], g[y1][:, x1]
    top = a + (b - a) * sx
    bot = c + (d - c) * sx
    return top + (bot - top) * sy


def fbm(cell_x, cell_y, octaves=4):
    total, amp, norm = np.zeros((H, W)), 1.0, 0.0
    for i in range(octaves):
        total += amp * vnoise(cell_x / 2 ** i, cell_y / 2 ** i)
        norm += amp
        amp *= 0.5
    return total / norm


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


x = np.arange(W)[None, :].astype(float)
y = np.arange(H)[:, None].astype(float)

# asse del tronco poco sopra il centro della tavola, con un po' di ondulazione naturale
warp = (fbm(600, 160, 4) - 0.5) * 90 + (fbm(140, 36, 3) - 0.5) * 9
yc = H * 0.46
# profondità del taglio: periodica lungo la tavola (due "cattedrali" per ripetizione)
depth = 95 + 130 * (0.5 + 0.5 * np.sin(2 * np.pi * x / W * 2 + 0.6)) \
    + 35 * (0.5 + 0.5 * np.sin(2 * np.pi * x / W * 5 + 2.1))
r = np.sqrt((y - yc + warp) ** 2 + depth ** 2)

# anelli di larghezza irregolare: rimappa il raggio con una funzione crescente non uniforme
radii = np.arange(0, 2000)
widths = rng.uniform(3.0, 9.0, radii.size)
widths = np.convolve(widths, np.ones(3) / 3, mode='same')
edges = np.concatenate([[0.0], np.cumsum(widths)])
ring = np.interp(r, edges, np.arange(edges.size))
t = ring % 1.0
ring_i = np.floor(ring).astype(int)
ring_dark = rng.uniform(0.3, 1.0, edges.size + 2)[ring_i]
# gruppi di anelli un po' più chiari o più scuri, come le annate del legno
group_tone = rng.normal(0, 0.035, edges.size // 5 + 3)[ring_i // 5]

# legno tardivo: banda più scura alla fine di ogni anello, con bordo netto verso l'anello successivo
late = smoothstep(0.5, 0.82, t) * (1 - smoothstep(0.86, 0.99, t))
dark = late * ring_dark * 0.19 - group_tone

# fibre sottili e pori lungo la venatura
fibre = vnoise(110, 0.8) - 0.5
pores = vnoise(26, 1.1)
dark += fibre * 0.075 + smoothstep(0.9, 0.985, pores) * 0.09

# macchie naturali e una lieve differenza di tono lungo la tavola
mottle = fbm(420, 160, 4) - 0.5

base = np.array([203, 158, 108], float)      # faggio / rovere chiaro
deep = np.array([146, 99, 58], float)        # legno tardivo
k = np.clip(dark, 0, 1)[..., None]
img = base * (1 - k * 2.2) + deep * (k * 2.2)
img = np.where(k * 2.2 > 1, deep, img)
img *= (1 + mottle * 0.14)[..., None]

# segni di coltello: linee chiare sottili e sparse
scratch = np.zeros((H, W))
for _ in range(int(W * H / 6000)):
    sx0, sy0 = rng.uniform(0, W), rng.uniform(0, H)
    ang = rng.normal(0, 0.6) + (np.pi / 2 if rng.random() < 0.2 else 0)
    n = int(rng.uniform(14, 100))
    px = (sx0 + np.cos(ang) * np.arange(n)) % W
    py = sy0 + np.sin(ang) * np.arange(n)
    ok = (py >= 0) & (py < H - 1)
    scratch[py[ok].astype(int), px[ok].astype(int)] = rng.uniform(0.04, 0.11)
img = img + (255 - img) * scratch[..., None] * 0.85

img = np.clip(img, 0, 255).astype(np.uint8)
Image.fromarray(img, 'RGB').save(OUT, quality=86, method=6)
print(OUT, W, 'x', H)
