"""Import the captured project screenshots from the paper-files folder.

Reads the PNG captures in  D:\\Media\\download\\AI\\projects\\paper files\\pgn\\<Project>\\
and writes web-sized WebP copies into  assets/work/<slug>/  as:

    cover.webp     the project's main image (the file named 1.*)
    shot-N.webp    supporting screens, used by the case-study gallery
    show-d.webp    desktop capture for the showcase frame (no live site)
    show-p.webp    phone capture for the showcase frame
    phone-N.webp   every phone capture, for the case study's Phone UI / UX
                   Design section (numeric order; see `phone_shots`)

The originals are 3042px-wide PNG screenshots (3-28 MB each); the site never
renders anything wider than a 1440px viewport, so re-encoding at 1800px / 1400px
WebP keeps them sharp on a 2x display at a fraction of the weight.

Run: python import_screenshots.py   (requires Pillow with WebP support)
     python import_screenshots.py --phones   (phone screens only)
"""

import re
import sys
from pathlib import Path
from PIL import Image

SRC = Path(r"D:\Media\download\AI\projects\paper files\pgn")
OUT = Path(__file__).parent / "assets" / "work"

# folder -> (slug, main image, [gallery images], desktop showcase, phone showcase)
MANIFEST = {
    "Et travel": (
        "https-ettravel-framer-website",
        "1.png",
        ["Frame@2x (1).png", "Frame@2x (2).png", "Frame@2x (4).png"],
        None, None,
    ),
    "photo port": (
        "https-foolish-checkbox-044906-framer-app",
        "1.png",
        ["Frame@2x (2).png", "Frame@2x (3).png", "Frame@2x (7).png"],
        None, None,
    ),
    "interior": (
        "https-joyinterior-framer-website",
        "1.png",
        ["Frame@2x (2).png", "Frame@2x (4).png", "Frame@2x (6).png"],
        None, None,
    ),
    "real estate": (
        "https-gwarinparealestate-framer-website",
        "1.png",
        ["Frame@2x (4).png", "Frame@2x (5).png", "02.png"],
        None, None,
    ),
    "eyeta": (
        "museum-of-art-in-addis",
        "1.png",
        ["Frame@2x (2).png", "Frame@2x (6).png", "Frame@2x.png"],
        None, None,
    ),
    "Bible app": (
        "bible-reading-app",
        "1 (1).png",
        ["web app (1).png", "web app (2).png", "Desktop app (1).png"],
        "web app (1).png", "phone app (1).PNG",
    ),
}

COVER_W, COVER_Q = 1800, 82
SHOT_W, SHOT_Q = 1400, 80

# Phone screens for the case study's own "Phone UI / UX Design" section.
#
# The manifest above only ever took ONE phone capture (the showcase frame's
# Phone button), so the rest of the phone work sat unimported. Every capture
# matching  <folder>/phone app *  OR  <folder>/iPhone *  is now exported too, in
# numeric order, as phone-1.webp ... phone-N.webp — a new capture is picked up
# on the next run with no edit here. (Two naming conventions are in the source:
# the Bible screens are Figma "phone app (n).PNG" exports, the museum's are
# "iPhone 13 & 14 - n.png".)
PHONE = {"Bible app": "bible-reading-app", "eyeta": "museum-of-art-in-addis",
         "figma fin app deisgn": "fintro"}
PHONE_GLOBS = ("phone app*", "iPhone *")
PHONE_W, PHONE_Q = 700, 78   # 828px source -> 700px; smaller sources stay native


def phone_shots(folder: str) -> list:
    """Phone captures in <folder>, ordered 1, 2, ... 10, 11 (not 1, 10, 11).

    The LAST number in the name is the screen index: it is the only one both
    conventions end on ("phone app (7)", "iPhone 13 & 14 - 7" — the first
    number there is the device, not the screen).
    """
    src = SRC / folder
    files = [f for g in PHONE_GLOBS for f in src.glob(g) if f.is_file()]
    return sorted(files, key=lambda f: int(re.findall(r'\d+', f.stem)[-1]))


def convert(src: Path, dst: Path, width: int, quality: int) -> None:
    img = Image.open(src)
    img = img.convert("RGB")
    if img.width > width:
        height = round(img.height * width / img.width)
        img = img.resize((width, height), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "WEBP", quality=quality, method=6)
    print(f"  {dst.relative_to(Path(__file__).parent)}  {img.width}x{img.height}  "
          f"{src.stat().st_size // 1024}KB -> {dst.stat().st_size // 1024}KB")


def main(phones_only: bool = False) -> None:
    total_before = total_after = 0
    # Every source folder the importer knows about: the manifest's own, plus the
    # phone-only ones — Fintro ships no cover, no desktop shots, nothing but its
    # five phone captures, so it has an entry in PHONE and none in MANIFEST.
    for folder in dict.fromkeys([*MANIFEST, *PHONE]):
        entry = MANIFEST.get(folder)
        slug = entry[0] if entry else PHONE[folder]
        src_dir = SRC / folder
        print(folder, "->", slug)
        pairs = []
        if entry and not phones_only:
            _, main_img, shots, show_d, show_p = entry
            pairs += [(main_img, "cover.webp", COVER_W, COVER_Q)]
            pairs += [(s, f"shot-{i}.webp", SHOT_W, SHOT_Q)
                      for i, s in enumerate(shots, 1)]
            if show_d:
                pairs.append((show_d, "show-d.webp", 1600, 82))
            if show_p:
                pairs.append((show_p, "show-p.webp", 700, 82))
        # the phone UI/UX gallery, only for folders that have phone captures
        pairs += [(src.name, f"phone-{i}.webp", PHONE_W, PHONE_Q)
                  for i, src in enumerate(phone_shots(folder), 1)]
        for name, out_name, w, q in pairs:
            src = src_dir / name
            if not src.exists():
                print(f"  MISSING {src}")
                continue
            total_before += src.stat().st_size
            convert(src, OUT / slug / out_name, w, q)
            total_after += (OUT / slug / out_name).stat().st_size
    print(f"\ntotal: {total_before // (1024 * 1024)}MB -> "
          f"{total_after // (1024 * 1024)}MB")


if __name__ == "__main__":
    main('--phones' in sys.argv[1:])
