#!/usr/bin/env python3
# Makes the site's pictures lighter: every JPG and PNG in images/ (and its folders, like images/tail/)
# is shrunk so its longer side is at most 2400 pixels, and saved next to it as WebP, quality 80.
# The original file is then moved to originals/ (same folder structure), outside images/,
# so it isn't part of the site but is kept on the computer (originals/ is in .gitignore).
#
# SVG drawings and MP4 videos are not touched.
# A picture that already has its WebP and whose original is already in originals/ is skipped,
# so the script can be run again whenever new pictures are added.
#
# Needs Pillow (once: python3 -m pip install --user Pillow).
# Run from the portfolio folder:   python3 optimize-images.py
# At the end it prints a table: each picture's size before and after.

import shutil
from pathlib import Path

from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
IMAGES = HERE / 'images'
ORIGINALS = HERE / 'originals'
LONGEST_SIDE = 2400   # pixels
QUALITY = 80          # WebP quality, 0–100
PICTURE_TYPES = {'.jpg', '.jpeg', '.png'}


def size_text(size):
    """A file size in KB or MB, for the table"""
    return f'{size / 1024 / 1024:.2f} MB' if size >= 1024 * 1024 else f'{size / 1024:.0f} KB'


def convert(path):
    """Shrink one picture, save it as WebP, and move the original to originals/. Returns a table row."""
    relative = path.relative_to(IMAGES)
    webp = path.with_suffix('.webp')
    before = path.stat().st_size

    with Image.open(path) as picture:
        picture = ImageOps.exif_transpose(picture)  # phone photos: turn them the right way up
        has_transparency = picture.mode in ('RGBA', 'LA') or (picture.mode == 'P' and 'transparency' in picture.info)
        picture = picture.convert('RGBA' if has_transparency else 'RGB')
        old_size = picture.size
        if max(picture.size) > LONGEST_SIDE:
            picture.thumbnail((LONGEST_SIDE, LONGEST_SIDE), Image.LANCZOS)  # keeps the proportions
        picture.save(webp, 'WEBP', quality=QUALITY, method=6, icc_profile=picture.info.get('icc_profile'))
        new_size = picture.size

    destination = ORIGINALS / 'images' / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(path), str(destination))

    after = webp.stat().st_size
    return [str(relative), size_text(before), size_text(after),
            f'{old_size[0]}×{old_size[1]}', f'{new_size[0]}×{new_size[1]}', before, after]


def main():
    rows = []
    for path in sorted(IMAGES.rglob('*')):
        if path.suffix.lower() in PICTURE_TYPES and path.is_file():
            rows.append(convert(path))

    if not rows:
        print('No JPG or PNG pictures left in images/ — nothing to do.')
        return

    # The table
    print(f'| Picture | Before | After | Size before | Size after |')
    print(f'|---|---|---|---|---|')
    for name, before, after, old, new, _, _ in rows:
        print(f'| {name} | {before} | {after} | {old} | {new} |')
    total_before = sum(row[5] for row in rows)
    total_after = sum(row[6] for row in rows)
    print(f'| **Total ({len(rows)} pictures)** | **{size_text(total_before)}** | **{size_text(total_after)}** | | |')


if __name__ == '__main__':
    main()
