"""Notex ikon ve acilis ekrani gorsellerini uretir. Bagimlilik yok.

Marka: iki yatay cizgi (not satirlari) + onay isareti (tamamlanan is).
Sekiller kapsul (yuvarlak uclu kalin cizgi) olarak tanimli; her pikselin
kapsullere olan isaretli mesafesinden kenar yumusatmasi hesaplanir.
"""

import math
import struct
import zlib

# Palet: Kagit
TERRACOTTA = (0xB9, 0x5F, 0x3B)
CREAM = (0xFB, 0xF8, 0xF3)
WHITE = (0xFF, 0xFF, 0xFF)

# Marka, 1000x1000 birim kutuda: (ax, ay, bx, by, yaricap)
MARK = [
    (170, 250, 830, 250, 58),
    (170, 430, 600, 430, 58),
    (195, 690, 365, 840, 66),
    (365, 840, 820, 640, 66),
]


def capsule_distance(px, py, ax, ay, bx, by, r):
    pax, pay = px - ax, py - ay
    bax, bay = bx - ax, by - ay
    denom = bax * bax + bay * bay
    h = 0.0 if denom == 0 else (pax * bax + pay * bay) / denom
    h = 0.0 if h < 0.0 else (1.0 if h > 1.0 else h)
    dx, dy = pax - bax * h, pay - bay * h
    return math.sqrt(dx * dx + dy * dy) - r


def mark_bounds():
    xs, ys = [], []
    for ax, ay, bx, by, r in MARK:
        xs += [ax - r, ax + r, bx - r, bx + r]
        ys += [ay - r, ay + r, by - r, by + r]
    return min(xs), min(ys), max(xs), max(ys)


def place(size, fill_ratio):
    """Markayi tuvale olcekleyip ortalar; (olcek, dx, dy) dondurur."""
    x0, y0, x1, y1 = mark_bounds()
    w, h = x1 - x0, y1 - y0
    scale = (size * fill_ratio) / max(w, h)
    dx = (size - w * scale) / 2 - x0 * scale
    dy = (size - h * scale) / 2 - y0 * scale
    return scale, dx, dy


def render(size, fill_ratio, mark_rgb, bg_rgb=None):
    """RGBA piksel satirlari uretir. bg_rgb None ise zemin seffaf kalir."""
    scale, dx, dy = place(size, fill_ratio)
    segments = [
        (ax * scale + dx, ay * scale + dy, bx * scale + dx, by * scale + dy, r * scale)
        for ax, ay, bx, by, r in MARK
    ]

    # Her sekil icin sinir kutusu; uzak pikseller mesafe hesabina girmez.
    boxes = [
        (min(ax, bx) - r - 2, min(ay, by) - r - 2, max(ax, bx) + r + 2, max(ay, by) + r + 2)
        for ax, ay, bx, by, r in segments
    ]

    mr, mg, mb = mark_rgb
    rows = []

    for y in range(size):
        py = y + 0.5
        row = bytearray()
        active = [s for s, b in zip(segments, boxes) if b[1] <= py <= b[3]]

        for x in range(size):
            px = x + 0.5
            best = 1e9
            for ax, ay, bx, by, r in active:
                d = capsule_distance(px, py, ax, ay, bx, by, r)
                if d < best:
                    best = d

            # Isaretli mesafeden kapsama: kenarda tam bir piksel gecis.
            cov = 0.5 - best
            cov = 0.0 if cov < 0.0 else (1.0 if cov > 1.0 else cov)

            if bg_rgb is None:
                row += bytes((mr, mg, mb, int(cov * 255 + 0.5)))
            else:
                br, bg_, bb = bg_rgb
                row += bytes((
                    int(br + (mr - br) * cov + 0.5),
                    int(bg_ + (mg - bg_) * cov + 0.5),
                    int(bb + (mb - bb) * cov + 0.5),
                    255,
                ))
        rows.append(bytes(row))

    return rows


def write_png(path, size, rows):
    raw = b''.join(b'\x00' + r for r in rows)

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    header = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', header)
        + chunk(b'IDAT', zlib.compress(raw, 9))
        + chunk(b'IEND', b'')
    )
    with open(path, 'wb') as f:
        f.write(png)
    print(f'{path}  {size}x{size}  {len(png) // 1024} KB')


A = 'assets/images/'

# Uygulama ikonu: dolu terracotta zemin, krem marka.
write_png(A + 'icon.png', 1024, render(1024, 0.56, CREAM, TERRACOTTA))

# Android uyarlanabilir ikon: zemin ve on plan ayri katman.
# On planda marka kucuk tutulur, cunku launcher bu katmani kirpip olcekliyor.
write_png(A + 'android-icon-background.png', 1024, [
    bytes(TERRACOTTA + (255,)) * 1024 for _ in range(1024)
])
write_png(A + 'android-icon-foreground.png', 1024, render(1024, 0.44, CREAM))
write_png(A + 'android-icon-monochrome.png', 1024, render(1024, 0.44, WHITE))

# Acilis ekrani: krem zemin uzerine terracotta marka (zemin app.json'da).
write_png(A + 'splash-icon.png', 512, render(512, 0.82, TERRACOTTA))

# Web sekmesi.
write_png(A + 'favicon.png', 64, render(64, 0.62, CREAM, TERRACOTTA))
