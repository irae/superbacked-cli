#! /bin/bash

set -e
set -o pipefail

printf "%s\n" "Purging dist directory…"

find dist -mindepth 1 -delete

printf "%s\n" "Building superbacked-cli…"

npm run build

release_platform=darwin
release_arch=arm64
release_filename=superbacked-cli-$release_platform-$release_arch-1.0.0
release_dir=dist/$release_filename-dir
release_dmg=dist/$release_filename.dmg

printf "%s\n" "Packaging ${release_filename}…"

mkdir $release_dir

npm uninstall sharp

npm install \
  --platform=$release_platform \
  --arch=$release_arch \
  sharp@0.32.3

node_modules/.bin/pkg \
  --config pkg/node18-$release_platform-$release_arch.json \
  --no-signature \
  --output $release_dir/$release_filename \
  bin/superbacked-cli.js

codesign \
  --entitlements entitlements.plist.xml \
  --deep \
  --force \
  --options=runtime \
  --sign "Developer ID Application: Superbacked, Inc. (4YAQ5SFA65)" \
  $release_dir/$release_filename

hdiutil create \
  -volname $release_filename \
  -srcfolder $release_dir \
  -ov \
  -format UDZO \
  $release_dmg

xcrun notarytool submit \
  --keychain-profile superbacked-notarytool \
  --wait \
  $release_dmg

mv \
  $release_dir/$release_filename \
  dist/$release_filename

rmdir $release_dir

rm $release_dmg

release_platform=darwin
release_arch=x64
release_filename=superbacked-cli-$release_platform-$release_arch-1.0.0
release_dir=dist/$release_filename-dir
release_dmg=dist/$release_filename.dmg

printf "%s\n" "Packaging ${release_filename}…"

mkdir $release_dir

npm uninstall sharp

npm install \
  --platform=$release_platform \
  --arch=$release_arch \
  sharp@0.32.3

node_modules/.bin/pkg \
  --config pkg/node18-$release_platform-$release_arch.json \
  --no-signature \
  --output $release_dir/$release_filename \
  bin/superbacked-cli.js

codesign \
  --entitlements entitlements.plist.xml \
  --deep \
  --force \
  --options=runtime \
  --sign "Developer ID Application: Superbacked, Inc. (4YAQ5SFA65)" \
  $release_dir/$release_filename

hdiutil create \
  -volname $release_filename \
  -srcfolder $release_dir \
  -ov \
  -format UDZO \
  $release_dmg

xcrun notarytool submit \
  --keychain-profile superbacked-notarytool \
  --wait \
  $release_dmg

mv \
  $release_dir/$release_filename \
  dist/$release_filename

rmdir $release_dir

rm $release_dmg

release_platform=linux
release_arch=arm64
release_filename=superbacked-cli-$release_platform-$release_arch-1.0.0
release_dir=dist

printf "%s\n" "Packaging ${release_filename}…"

npm uninstall sharp

npm install \
  --platform=$release_platform \
  --arch=$release_arch \
  sharp@0.32.3

node_modules/.bin/pkg \
  --config pkg/node18-$release_platform-$release_arch.json \
  --output $release_dir/$release_filename \
  bin/superbacked-cli.js

release_platform=linux
release_arch=x64
release_filename=superbacked-cli-$release_platform-$release_arch-1.0.0
release_dir=dist

printf "%s\n" "Packaging ${release_filename}…"

npm uninstall sharp

npm install \
  --platform=$release_platform \
  --arch=$release_arch \
  sharp@0.32.3

node_modules/.bin/pkg \
  --config pkg/node18-$release_platform-$release_arch.json \
  --output $release_dir/$release_filename \
  bin/superbacked-cli.js

cd dist

printf "%s\n" "Signing release…"

find superbacked-cli-* -type f -print0 | sort -z | xargs -0 shasum --algorithm 256 > SHA256SUMS; gpg --armor --detach-sig --output SHA256SUMS.asc SHA256SUMS

cd -

printf "%s\n" "Restoring development environment…"

npm uninstall sharp

npm install sharp@0.32.3

printf "%s\n" "Done"
