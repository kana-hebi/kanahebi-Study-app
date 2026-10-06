#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
  echo 'Set ANDROID_HOME or ANDROID_SDK_ROOT to an installed Android SDK.' >&2
  exit 1
fi
export NODE_ENV=production
npx expo prebuild --platform android --no-install
cd android
./gradlew --no-daemon --max-workers=2 assembleRelease -PreactNativeArchitectures=arm64-v8a
cd ..
mkdir -p artifacts
study_version="$(node -p 'require("./app.json").expo.version')"
study_apk="artifacts/kanahebi-study-${study_version}-arm64.apk"
cp android/app/build/outputs/apk/release/app-release.apk "$study_apk"
echo "Standalone arm64 test-signed APK: $study_apk"
