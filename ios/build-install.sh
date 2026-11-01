#!/bin/zsh
# Bouwt Investeren (+ widget) en installeert op de iPhone. Vereist: Apple ID in Xcode > Settings > Accounts.
# Bouwt vanuit een kopie buiten OneDrive: xcodebuild blijft anders hangen op de bestandscoördinatie van die map.
set -e
set -o pipefail
DEVICE=${DEVICE:-00008150-000468340AF3C01C}
DD=${DD:-/private/tmp/investeren-dd}
SRC=${SRC:-/private/tmp/investeren-src}
mkdir -p "$SRC"
rsync -a --delete --exclude xcuserdata "$(dirname "$0")/Investeren/" "$SRC/"
cd "$SRC"
xcodebuild -project Investeren.xcodeproj -scheme Investeren -configuration Release \
  -destination "id=$DEVICE" -derivedDataPath "$DD" -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=3P6UX58F8E build | grep -E "error|BUILD"
APP="$DD/Build/Products/Release-iphoneos/Investeren.app"
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" nl.dogterom.investeren
