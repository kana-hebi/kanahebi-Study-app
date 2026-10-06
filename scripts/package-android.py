#!/usr/bin/env python3
"""Package the APK only after its current-byte and certificate checks pass."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
report = json.loads((root / 'artifacts/android-apk-validation.json').read_text())
apk = root / 'artifacts' / report['file']
assert hashlib.sha256(apk.read_bytes()).hexdigest() == report['sha256']
assert apk.stat().st_size == report['bytes']
assert report['zipIntegrity'] == 'passed'
assert report['versionName'] == json.loads((root / 'app.json').read_text())['expo']['version']
assert report['certificateSha256'] == 'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c', 'Trial signature changed; preserve upgrade identity'
version = report['versionName']
target = root / 'artifacts' / f'kanahebi-study-{version}-android.zip'
instructions = f"""かなへび学習室 v{version}

1. ZIPを展開し、{apk.name}をAndroidのファイルアプリから開きます。
2. Androidが求める場合は、開いたアプリからのインストールを許可します。
3. 起動後、ホームの「高分子の教材を読む」「高分子の演習を選ぶ」から試せます。

arm64 Android向け、Android 7.0以降。PC・アカウント・開発サーバー・初回教材ダウンロード不要の構成です。
詳しい教材40項目、解き方付き例題40題、新規演習180問、図44点を同梱しています。
既存の教材を含む全体は123知識・365問です。
自由学習の記録は既定ON。OFFにして始めると今回の回答を成績へ残しません。
更新前にはアプリの「その他 → 教材パック・データ → バックアップを書き出す」で現在の記録をアプリの外へ保存できます。

試用署名の配布版です。実機での起動・更新インストール・機内モードでの初回起動は未確認です。
実機で学習履歴・図の表示・ファイル選択/共有を確認してください。
"""
verification = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as out:
    out.write(apk, apk.name)
    out.writestr('START_HERE.txt', instructions)
    out.writestr('VERIFICATION.json', verification)
with zipfile.ZipFile(target) as saved:
    assert saved.testzip() is None
    assert hashlib.sha256(saved.read(apk.name)).hexdigest() == report['sha256']
distribution = {
    'file': target.name, 'bytes': target.stat().st_size,
    'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    'apk': report['file'], 'apkSha256': report['sha256'],
    'entries': [apk.name, 'START_HERE.txt', 'VERIFICATION.json'],
    'zipIntegrity': 'passed', 'deviceExecutionTested': False,
}
(root / 'artifacts/distribution.json').write_text(json.dumps(distribution, indent=2) + '\n')
print(json.dumps(distribution, indent=2))
