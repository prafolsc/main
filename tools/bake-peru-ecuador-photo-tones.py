#!/usr/bin/env python3
"""Apply the approved Japan tone profiles once to the Peru/Ecuador web JPEGs."""
from pathlib import Path
from PIL import Image, ImageCms
import argparse, hashlib, importlib.util, json, shutil


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', default='viatges-web/peru-equador-2025')
    parser.add_argument('--preview-dir')
    args = parser.parse_args()
    root = Path(args.site).resolve()
    plan = json.loads((root / 'photo-tone-plan.json').read_text())
    manifest_path = root / 'photo-adjustments.json'
    if manifest_path.exists() and not args.preview_dir:
        previous = json.loads(manifest_path.read_text())
        assert previous['version'] == 1
        for item in previous['files']:
            assert sha(root / item['path']) == item['sha256'], 'Adjusted asset changed'
        print('Approved adjustments already applied; no image processed twice.')
        return
    specification = importlib.util.spec_from_file_location(
        'japan_tones', Path(__file__).with_name('bake-japan-photo-tones.py'))
    japan = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(japan)
    approved = json.loads((root.parent / 'japo-2026/photo-adjustments.json').read_text())['profiles']
    assert plan['profiles'] == approved, 'Tone profiles must match approved Japan profiles'
    staging = Path(args.preview_dir).resolve() if args.preview_dir else root / '.tone-staging'
    assert not staging.exists(), 'Staging directory already exists'
    staging.mkdir(parents=True)
    icc = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
    files = []
    for index, item in enumerate(plan['photos']):
        source = root / item['path']
        assert sha(source) == item['source_sha256'], 'Source changed before processing'
        destination = staging / item['path']
        destination.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            dimensions = image.size
            result = japan.adjusted(image, approved[item['profile']])
        result.save(destination, format='JPEG', quality=95, subsampling=0,
                    optimize=True, progressive=True, icc_profile=icc)
        with Image.open(destination) as check:
            check.load()
            assert check.size == dimensions and check.info.get('icc_profile')
        files.append({'path': item['path'], 'filename': item['filename'],
                      'profile': item['profile'], 'source_sha256': item['source_sha256'],
                      'sha256': sha(destination), 'bytes': destination.stat().st_size})
        if (index + 1) % 40 == 0:
            print(f'Prepared {index + 1}/{len(plan["photos"])} images', flush=True)
    manifest = {'version': 1, 'method': approved and 'Approved Japan sRGB transfer tables and saturation baked into JPEGs',
                'jpeg_quality': 95, 'profiles': approved, 'files': files}
    if args.preview_dir:
        (staging / 'photo-adjustments.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        print('Preview complete:', staging)
        return
    for item in files:
        (staging / item['path']).replace(root / item['path'])
        assert sha(root / item['path']) == item['sha256']
    shutil.rmtree(staging)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'photos': len(files), 'bytes': sum(item['bytes'] for item in files)}))


if __name__ == '__main__':
    main()
