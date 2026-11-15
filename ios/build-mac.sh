#!/bin/zsh
# Bouwt de Mac-app Investeren en installeert hem in /Applications (lokaal ondertekend, geen Apple-account nodig).
# Bouwt vanuit een kopie buiten OneDrive: xcodebuild blijft anders hangen op de bestandscoördinatie van die map.
set -e
set -o pipefail
DD=${DD:-/private/tmp/investeren-mac-dd}
SRC=${SRC:-/private/tmp/investeren-src}
DEST=${DEST:-/Applications}
mkdir -p "$SRC"
rsync -a --delete --exclude xcuserdata "$(dirname "$0")/Investeren/" "$SRC/"
cd "$SRC"
xcodebuild -project Investeren.xcodeproj -scheme InvesterenMac -configuration Release \
  -destination "platform=macOS" -derivedDataPath "$DD" build | grep -E "error|warning: |BUILD" || true
APP="$DD/Build/Products/Release/Investeren.app"
[ -d "$APP" ] || { echo "Build mislukt"; exit 1; }
osascript -e 'tell application id "nl.dogterom.investeren.mac" to quit' 2>/dev/null || true
rm -rf "$DEST/Investeren.app"
ditto "$APP" "$DEST/Investeren.app"
echo "Geïnstalleerd: $DEST/Investeren.app"
open "$DEST/Investeren.app"
