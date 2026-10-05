#!/usr/bin/env python3
"""Inspect a built distribution. This does not execute the app on a device."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile

apk = Path(sys.argv[1] if len(sys.argv) > 1 else 'artifacts/kanahebi-study-0.1.0-arm64.apk')
sdk = Path(os.environ.get('ANDROID_HOME') or os.environ['ANDROID_SDK_ROOT'])
tools = sdk / 'build-tools' / '36.0.0'
def run(name, *args):
    return subprocess.check_output([str(tools / name), *map(str, args)], text=True)
signature = run('apksigner', 'verify', '--verbose', '--print-certs', apk)
badging = run('aapt', 'dump', 'badging', apk)
manifest = run('aapt', 'dump', 'xmltree', apk, 'AndroidManifest.xml')
assert "name='lab.kanahebi.study' versionCode='1' versionName='0.1.0'" in badging
assert "sdkVersion:'24'" in badging and "targetSdkVersion:'36'" in badging
assert "native-code: 'arm64-v8a'" in badging
assert 'Verified using v2 scheme (APK Signature Scheme v2): true' in signature
assert 'android:debuggable' not in manifest
assert re.search(r'android:allowBackup[^\n]*=\(type 0x12\)0x0', manifest)
blocked = ['INTERNET', 'SYSTEM_ALERT_WINDOW', 'VIBRATE', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
assert not any(f"uses-permission: name='android.permission.{p}'" in badging for p in blocked)
with zipfile.ZipFile(apk) as z:
    assert z.testzip() is None
    bundle = z.read('assets/index.android.bundle')
    assert len(bundle) > 100000
    assert 'lib/arm64-v8a/libexpo-sqlite.so' in z.namelist()
    config = json.loads(z.read('assets/app.config'))
    assert config['updates']['enabled'] is False
    assert config['android']['allowBackup'] is False
    assert b'jp.exam.chemistry.organic-polymer' in bundle
    # The bytecode string table retains IDs: every authored knowledge/question is bundled.
    pack = json.loads(Path('content/organic-polymer.json').read_text())
    assert all(x['id'].encode() in bundle for key in ['nodes', 'questions'] for x in pack[key])
map_path = Path('android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map')
matched_sources = []
if map_path.exists():
    mapping = json.loads(map_path.read_text())
    expected = ['App.tsx', 'src/domain/engine.ts', 'src/data/repository.native.ts', 'src/data/io.native.ts', 'content/organic-polymer.json']
    for source, content in zip(mapping['sources'], mapping['sourcesContent']):
        if any(source.endswith('/' + name) for name in expected):
            local = Path(source)
            if not local.exists(): local = Path(source.lstrip('/'))
            assert local.read_text() == content, f'Stale bundled source: {source}'
            matched_sources.append(str(local))
    assert len(matched_sources) == len(expected)
report = {
    'inspectedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'file': apk.name, 'bytes': apk.stat().st_size,
    'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
    'applicationId': 'lab.kanahebi.study', 'versionName': '0.1.0', 'versionCode': 1,
    'abi': 'arm64-v8a', 'minSdk': 24, 'targetSdk': 36, 'debuggable': False,
    'signature': 'APK v2, Android Debug test certificate',
    'allowBackup': False, 'blockedAndroidPermissions': blocked,
    'embeddedBundleBytes': len(bundle), 'bundledNodes': len(pack['nodes']), 'bundledQuestions': len(pack['questions']),
    'updatesEnabled': False, 'sqliteNativeLibrary': True, 'zipIntegrity': 'passed',
    'bundledSourcesMatched': matched_sources,
    'deviceExecutionTested': False,
}
Path('artifacts/android-apk-validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
