#!/usr/bin/env python3
"""Verify Fix #14 (notification icons) without an Android build.

Checks:
 1. ic_notification.png exists at all 5 densities with the right sizes,
    is pure-white-on-transparent (a proper small-icon silhouette), and
    has transparent corners.
 2. ic_notification_large.png exists (192x192, emerald background).
 3. AlarmReceiver.java uses R.drawable.ic_notification as the small
    icon and R.drawable.ic_notification_large as the large icon, and
    no longer references android.R.drawable.ic_dialog_info.
Run: python3 tests/verify-fix14.py  (exit 0 = all pass)
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
passed = failed = 0


def check(name, ok, detail=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"PASS | {name} | {detail}")
    else:
        failed += 1
        print(f"FAIL | {name} | {detail}")


for density, size in [("mdpi", 24), ("hdpi", 36), ("xhdpi", 48),
                      ("xxhdpi", 72), ("xxxhdpi", 96)]:
    p = os.path.join(ROOT, "android/app/src/main/res",
                     f"drawable-{density}/ic_notification.png")
    ok = os.path.exists(p)
    check(f"Fix #14: small icon exists ({density})", ok, p)
    if not ok:
        continue
    im = Image.open(p).convert("RGBA")
    px = list(im.getdata())
    nonwhite = [q for q in px if q[3] > 0 and q[:3] != (255, 255, 255)]
    opaque = sum(1 for q in px if q[3] > 200)
    check(f"Fix #14: small icon {density} is {size}x{size} white-only "
          f"silhouette with transparent corners",
          im.size == (size, size) and not nonwhite and opaque > 0
          and px[0][3] == 0 and px[-1][3] == 0,
          f"size={im.size} opaque={opaque}")

large = os.path.join(ROOT, "android/app/src/main/res/drawable/"
                     "ic_notification_large.png")
ok = os.path.exists(large)
check("Fix #14: large icon exists", ok, large)
if ok:
    im = Image.open(large).convert("RGBA")
    check("Fix #14: large icon is 192x192 on emerald",
          im.size == (192, 192) and im.getpixel((0, 0))[:3] == (14, 106, 76),
          f"size={im.size} corner={im.getpixel((0, 0))}")

src = open(os.path.join(ROOT, "android/app/src/main/java/com/deenday/app/"
                      "AlarmReceiver.java"), encoding="utf-8").read()
check("Fix #14: AlarmReceiver sets the logo small icon",
      "setSmallIcon(R.drawable.ic_notification)" in src)
check("Fix #14: AlarmReceiver sets the logo large icon",
      "R.drawable.ic_notification_large" in src and "setLargeIcon" in src)
check("Fix #14: generic 'i' icon is gone (only mentioned in the comment)",
      "setSmallIcon(android.R.drawable.ic_dialog_info)" not in src)

print(f"\n{passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
