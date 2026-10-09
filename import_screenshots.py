"""Import the captured project screenshots from the paper-files folder.

Reads the PNG captures in  D:\\Media\\download\\AI\\projects\\paper files\\pgn\\<Project>\\
and writes web-sized WebP copies into  assets/work/<slug>/  as:

    cover.webp     the project's main image (the file named 1.*)
    shot-N.webp    supporting screens, used by the case-study gallery
    show-d.webp    desktop capture for the showcase frame (no live site)
    show-p.webp    phone capture for the showcase frame

The originals are 3042px-wide PNG screenshots (3-28 MB each); the site never
renders anything wider than a 1440px viewport, so re-encoding at 1800px / 1400px
WebP keeps them sharp on a 2x display at a fraction of the weight.

Run: python import_screenshots.py   (requires Pillow with WebP support)
"""

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


def main() -> None:
    total_before = total_after = 0
    for folder, (slug, main_img, shots, show_d, show_p) in MANIFEST.items():
        src_dir = SRC / folder
        print(folder, "->", slug)
        pairs = [(main_img, "cover.webp", COVER_W, COVER_Q)]
        pairs += [(s, f"shot-{i}.webp", SHOT_W, SHOT_Q)
                  for i, s in enumerate(shots, 1)]
        if show_d:
            pairs.append((show_d, "show-d.webp", 1600, 82))
        if show_p:
            pairs.append((show_p, "show-p.webp", 700, 82))
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
    main()
