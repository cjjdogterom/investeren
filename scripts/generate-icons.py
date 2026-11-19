#!/usr/bin/env python3
"""Genereer alle app-iconen uit één bronbestand: assets/app-icon.png (1024×1024, logo op zwart).

Draaien vanuit de repo-root:  python3 scripts/generate-icons.py   (vereist Pillow)

Maakt:
  - web/PWA:  icon-192.png, icon-512.png, apple-touch-icon.png, icon.svg (PNG ingesloten)
  - iPhone:   ios/Investeren/Investeren/…/AppIcon.appiconset/icon-1024.png (vol vierkant; iOS rondt zelf af)
  - Mac:      ios/Investeren/InvesterenMac/…/AppIcon.appiconset/icon_*.png (afgeronde tegel met schaduw)
"""
import base64
import io
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'app-icon.png'
IOS_SET = ROOT / 'ios/Investeren/Investeren/Assets.xcassets/AppIcon.appiconset'
MAC_SET = ROOT / 'ios/Investeren/InvesterenMac/Assets.xcassets/AppIcon.appiconset'

WEB = {'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512}
MAC = {
    'icon_16x16@1x.png': 16, 'icon_16x16@2x.png': 32,
    'icon_32x32@1x.png': 32, 'icon_32x32@2x.png': 64,
    'icon_128x128@1x.png': 128, 'icon_128x128@2x.png': 256,
    'icon_256x256@1x.png': 256, 'icon_256x256@2x.png': 512,
    'icon_512x512@1x.png': 512, 'icon_512x512@2x.png': 1024,
}


def resized(img, size):
    return img if img.size == (size, size) else img.resize((size, size), Image.LANCZOS)


def squircle_mask(size, plate, ss=4):
    """Apple-achtige afgeronde tegel (superellips, n=5) van `plate` px, gecentreerd in `size` px."""
    big = size * ss
    half = plate * ss / 2
    c = big / 2
    n = 5.0
    pts = []
    steps = 720
    import math
    for i in range(steps):
        t = 2 * math.pi * i / steps
        ct, st = math.cos(t), math.sin(t)
        x = c + half * (abs(ct) ** (2 / n)) * (1 if ct >= 0 else -1)
        y = c + half * (abs(st) ** (2 / n)) * (1 if st >= 0 else -1)
        pts.append((x, y))
    m = Image.new('L', (big, big), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m.resize((size, size), Image.LANCZOS)


def mac_master(src):
    """1024×1024 met transparante rand: tegel van 824 px, zachte schaduw eronder, dunne lichte rand."""
    size, plate = 1024, 824
    mask = squircle_mask(size, plate)
    art = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    off = (size - plate) // 2
    art.paste(resized(src, plate).convert('RGBA'), (off, off))
    art.putalpha(mask)
    # dunne lichte binnenrand, zodat de zwarte tegel ook op een donker Dock te zien is
    inner = squircle_mask(size, plate - 6)
    rim = ImageChops.subtract(mask, inner).point(lambda v: int(v * 0.10))
    rim_layer = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    rim_layer.putalpha(rim)
    art = Image.alpha_composite(art, rim_layer)
    # schaduw
    shadow_a = ImageChops.offset(mask, 0, 10).filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * 0.30))
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow.putalpha(shadow_a)
    return Image.alpha_composite(shadow, art)


def main():
    src = Image.open(SRC).convert('RGB')
    if src.size != (1024, 1024):
        raise SystemExit(f'{SRC} moet 1024×1024 zijn, is {src.size}')

    for name, size in WEB.items():
        resized(src, size).save(ROOT / name, optimize=True)
        print('web   ', name, size)

    # icon.svg: favicon en logo in de zijbalk; de PNG zit erin ingesloten
    buf = io.BytesIO()
    resized(src, 512).save(buf, format='PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    (ROOT / 'icon.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">\n'
        '  <!-- Gegenereerd door scripts/generate-icons.py uit assets/app-icon.png -->\n'
        '  <rect width="1024" height="1024" fill="#000000"/>\n'
        f'  <image width="1024" height="1024" href="data:image/png;base64,{b64}"/>\n'
        '</svg>\n')
    print('web    icon.svg')

    src.save(IOS_SET / 'icon-1024.png', optimize=True)
    print('iphone icon-1024.png')

    mm = mac_master(src)
    for name, size in MAC.items():
        resized(mm, size).save(MAC_SET / name, optimize=True)
        print('mac   ', name, size)


if __name__ == '__main__':
    main()
