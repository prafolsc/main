#!/usr/bin/env python3
"""Bake the approved Japan display profiles into its web JPEGs, exactly once."""
from pathlib import Path
from PIL import Image, ImageCms
import argparse, hashlib, io, json, re, subprocess
import numpy as np

NAMES = ["snow", "temple", "interior", "landscape", "beach", "diving"]
SAMPLES = {88: 0, 284: 1, 11: 2, 193: 3, 279: 4, 153: 5}
def tone_index(photo):
    if photo["order"] in SAMPLES:
        return SAMPLES[photo["order"]]
    category = photo.get("category")
    if category == "Busseig": return 5
    if category == "Esquí": return 0
    if category in ("Menjar", "Persones"): return 2
    if category == "Temples i patrimoni": return 1
    if category == "Okinawa i costa": return 4
    if category: return 3
    place = photo.get("place", "").lower()
    if any(term in place for term in ("zenkō", "senso", "sensō", "seiryu", "temple")): return 1
    if any(term in place for term in ("yuze", "tazawako")): return 2
    if photo["group"] == "Okinawa–Yaeyama": return 4
    return 3

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def adjusted(image, profile):
    """Match SVG sRGB table interpolation and its saturation color matrix."""
    icc = image.info.get("icc_profile")
    rgb = image.convert("RGB")
    if icc:
        rgb = ImageCms.profileToProfile(
            rgb, ImageCms.ImageCmsProfile(io.BytesIO(icc)),
            ImageCms.createProfile("sRGB"), outputMode="RGB")
    table = np.array([float(v) for v in profile["table"].split()], dtype=np.float64)
    # SVG table transfer interpolates linearly between values in sRGB.
    lookup = np.interp(np.arange(256) / 255.0, np.linspace(0, 1, len(table)), table)
    values = lookup[np.asarray(rgb, dtype=np.uint8)].astype(np.float32)
    # SVG feColorMatrix type=saturate uses these coefficients.
    luminance = (values[..., 0] * .213 + values[..., 1] * .715 + values[..., 2] * .072)[..., None]
    values = luminance + profile["saturation"] * (values - luminance)
    return Image.fromarray(np.rint(np.clip(values, 0, 1) * 255).astype(np.uint8))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="viatges-web/japo-2026")
    args = parser.parse_args()
    root = Path(args.site).resolve()
    manifest_path = root / "photo-adjustments.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        assert manifest["version"] == 1, "Unknown previous adjustment version"
        for item in manifest["files"]:
            assert sha(root / item["path"]) == item["sha256"], "Adjusted asset changed"
        assert "installPhotoTones" not in (root / "app.js").read_text()
        print("All adjusted photos already present; no adjustment applied twice.")
        return
    app_path = root / "app.js"
    app = app_path.read_text()
    match = re.search(r"const PHOTO_TONE_PRESETS=(\[.*?\]);", app)
    assert match, "Approved photo profiles missing"
    profiles = json.loads(match.group(1))
    assert len(profiles) == 6
    data = (root / "data.js").read_text()
    photos = json.loads(re.sub(r";\s*$", "", data.removeprefix("const PHOTOS=")))
    assert len(photos) == 256
    assert len(set(photo["filename"] for photo in photos)) == 256
    source_commit = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    srgb_icc = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    staging = root / "assets" / "toning-staging"
    assert not staging.exists(), "Unfinished previous staging folder exists"
    staging.mkdir()
    files, decisions = [], []
    original_bytes = 0
    for i, photo in enumerate(photos):
        mini = root / photo["image"]
        large = root / photo["image_large"]
        assert mini.is_file() and large.is_file()
        original_bytes += mini.stat().st_size + large.stat().st_size
        mini_size = Image.open(mini).size
        with Image.open(large) as source:
            large_size = source.size
            result = adjusted(source, profiles[tone_index(photo)])
        assert result.size == large_size
        for source_path, image, quality in (
            (large, result, 95),
            (mini, result.resize(mini_size, Image.Resampling.LANCZOS), 90),
        ):
            relative = source_path.relative_to(root)
            temp = staging / relative
            temp.parent.mkdir(parents=True, exist_ok=True)
            before_sha = sha(source_path)
            image.save(temp, format="JPEG", quality=quality, subsampling=0,
                       optimize=True, progressive=True, icc_profile=srgb_icc)
            with Image.open(temp) as check:
                check.load()
                assert check.size == image.size
                assert check.info.get("icc_profile")
            files.append({"path": str(relative), "source_sha256": before_sha,
                          "sha256": sha(temp), "bytes": temp.stat().st_size})
        decisions.append({"filename": photo["filename"], "order": photo["order"],
                          "profile": NAMES[tone_index(photo)]})
        if (i + 1) % 32 == 0:
            print(f"Prepared {i + 1}/{len(photos)} photos", flush=True)
    # Keep active images and display filters together until all derivatives pass validation.
    cleaned_app, matches = re.subn(
        r"\n// Display-only adjustments approved in the six-photo comparison\..*?\nconst UI_ES=",
        "\nconst UI_ES=", app, flags=re.S)
    assert matches == 1, "Could not isolate the display filter block"
    for call in ("applyPhotoTone(img,p);", "applyPhotoTone($('lb-photo'),p);",
                 "applyPhotoTone(im,PAGE_PHOTOS[s.photos[0]]);"):
        assert call in cleaned_app
        cleaned_app = cleaned_app.replace(call, "")
    assert "applyPhotoTone" not in cleaned_app and "japan-photo-tone" not in cleaned_app
    for item in files:
        (staging / item["path"]).replace(root / item["path"])
    for item in files:
        final = root / item["path"]
        assert sha(final) == item["sha256"], "Final asset checksum mismatch"
        with Image.open(final) as check:
            check.load()
    import shutil
    shutil.rmtree(staging)
    app_path.write_text(cleaned_app)
    manifest = {
        "version": 1, "source_commit": source_commit,
        "method": "Approved SVG sRGB transfer tables and saturation baked into JPEGs",
        "large_jpeg_quality": 95, "mini_jpeg_quality": 90,
        "profiles": dict(zip(NAMES, profiles)), "photos": decisions, "files": files,
        "original_web_bytes": original_bytes, "adjusted_web_bytes": sum(item["bytes"] for item in files),
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"photos": len(photos), "files": len(files),
                      "before_bytes": original_bytes, "after_bytes": manifest["adjusted_web_bytes"]}))

if __name__ == "__main__":
    main()
