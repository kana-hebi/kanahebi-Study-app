#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
  echo 'Set ANDROID_HOME or ANDROID_SDK_ROOT to an installed Android SDK.' >&2
  exit 1
fi
npx expo prebuild --platform android --no-install
cd android
./gradlew --no-daemon --max-workers=2 assembleRelease -PreactNativeArchitectures=arm64-v8a
cd ..
mkdir -p artifacts
cp android/app/build/outputs/apk/release/app-release.apk artifacts/kanahebi-study-0.1.0-arm64.apk
echo 'Standalone arm64 test-signed APK: artifacts/kanahebi-study-0.1.0-arm64.apk'
