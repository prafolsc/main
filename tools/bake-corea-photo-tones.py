#!/usr/bin/env python3
"""Apply the approved Japan profiles once to Korea/Okinawa web photos."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
from PIL import Image, ImageCms


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    root = Path('viatges-web/corea-2018')
    plan = json.loads((root / 'photo-tone-plan.json').read_text())
    manifest_path = root / 'photo-adjustments.json'
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        for item in manifest['files']:
            assert sha(root / item['path']) == item['sha256'], 'Adjusted photo changed'
        print('Photo adjustments already applied; no photo processed twice.')
        return
    approved = json.loads(Path('viatges-web/japo-2026/photo-adjustments.json').read_text())['profiles']
    assert plan['profiles'] == approved, 'Profiles must match approved Japan profiles'
    spec = importlib.util.spec_from_file_location('japan_tones', Path(__file__).with_name('bake-japan-photo-tones.py'))
    japan = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(japan)
    staging = root / '.tone-staging'
    assert not staging.exists(), 'Unfinished staging folder exists'
    staging.mkdir()
    icc = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
    files = []
    for index, item in enumerate(plan['photos']):
        source = root / item['path']
        assert sha(source) == item['source_sha256'], 'Source photo changed'
        target = staging / item['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            dimensions = image.size
            result = japan.adjusted(image, approved[item['profile']])
        result.save(target, format='WEBP', quality=95, method=6, icc_profile=icc)
        with Image.open(target) as check:
            check.load()
            assert check.size == dimensions and check.info.get('icc_profile')
        files.append({**item, 'sha256': sha(target), 'bytes': target.stat().st_size})
        if (index + 1) % 50 == 0:
            print(f'Prepared {index + 1}/{len(plan["photos"])} photos', flush=True)
    for item in files:
        item['sha256'] = sha(staging / item['path'])
        item['bytes'] = (staging / item['path']).stat().st_size
        (staging / item['path']).replace(root / item['path'])
        assert sha(root / item['path']) == item['sha256']
    shutil.rmtree(staging)
    manifest_path.write_text(json.dumps({
        'version': 1, 'method': 'Approved Japan sRGB transfer tables and saturation baked into WebP files',
        'webp_quality': 95, 'profiles': approved, 'files': files
    }, ensure_ascii=False, indent=2) + '\n')
    print(f'Finished: {len(files)} photos.')


if __name__ == '__main__':
    main()
