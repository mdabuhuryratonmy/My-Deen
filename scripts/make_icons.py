#!/usr/bin/env python3
"""Generate My Deen app icons from the old Arabic logo (Fix #4 §4).

The old "ماي دين" gold-on-emerald logo (icons/my-deen-logo.png) never
reached GitHub because PNG files cannot be pushed through the text-only
snapshot flow. The fix: the logo travels as a base64 text file
(assets/logo.b64) and this script regenerates every icon at build time
(CI runs it before `npx cap sync android`).

Reads:  assets/logo.b64 (base64 of icons/my-deen-logo.png).
        If the .b64 file is missing, falls back to icons/my-deen-logo.png.
Writes: icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png
        www/icons/icon-192.png, www/icons/icon-512.png,
        www/icons/icon-maskable-512.png, www/icons/my-deen-logo.png
        android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/
            ic_launcher.png (48/72/96/144/192) and ic_launcher_round.png
        android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png (432)

The maskable icon puts the logo (at 80% size) on a solid emerald
background so it survives any mask shape. The round launcher icon is
the logo with a circular mask.

Run from the repo root:  python3 scripts/make_icons.py
Requires: Pillow (CI installs it with `pip install pillow`).
"""
import base64
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMERALD = (14, 106, 76, 255)  # #0e6a4c — the app's emerald
MIPMAP_SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}


def load_logo():
    b64_path = os.path.join(ROOT, "assets", "logo.b64")
    png_path = os.path.join(ROOT, "icons", "my-deen-logo.png")
    if os.path.exists(b64_path):
        with open(b64_path, "r", encoding="utf-8") as f:
            raw = base64.b64decode("".join(f.read().split()))
        from io import BytesIO
        logo = Image.open(BytesIO(raw))
    elif os.path.exists(png_path):
        logo = Image.open(png_path)
    else:
        sys.exit("ERROR: neither assets/logo.b64 nor icons/my-deen-logo.png exists")
    return logo.convert("RGBA")


def save(img, rel):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    print("wrote", rel, img.size)


def circle_mask(size):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((0, 0, size, size), fill=255)
    return mask


def main():
    logo = load_logo()
    # The web + launcher icons are square crops of the logo.
    square = logo
    if square.size != (square.size[0], square.size[0]):
        side = min(square.size)
        left = (square.size[0] - side) // 2
        top = (square.size[1] - side) // 2
        square = square.crop((left, top, left + side, top + side))
    save(square.resize((192, 192), Image.LANCZOS), "icons/icon-192.png")
    save(square.resize((512, 512), Image.LANCZOS), "icons/icon-512.png")
    save(square.resize((192, 192), Image.LANCZOS), "www/icons/icon-192.png")
    save(square.resize((512, 512), Image.LANCZOS), "www/icons/icon-512.png")
    save(square, "www/icons/my-deen-logo.png")
    # Maskable: logo at 80% on a solid emerald full-bleed background.
    maskable = Image.new("RGBA", (512, 512), EMERALD)
    inner = square.resize((410, 410), Image.LANCZOS)
    maskable.alpha_composite(inner, (51, 51))
    save(maskable, "icons/icon-maskable-512.png")
    save(maskable, "www/icons/icon-maskable-512.png")
    # Launcher icons per density + round variant + adaptive foreground.
    for density, size in MIPMAP_SIZES.items():
        base = f"android/app/src/main/res/mipmap-{density}"
        save(square.resize((size, size), Image.LANCZOS), f"{base}/ic_launcher.png")
        round_icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        round_icon.paste(square.resize((size, size), Image.LANCZOS), (0, 0), circle_mask(size))
        save(round_icon, f"{base}/ic_launcher_round.png")
    save(square.resize((432, 432), Image.LANCZOS),
         "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png")
    print("done — icons generated from the old logo")


if __name__ == "__main__":
    main()
