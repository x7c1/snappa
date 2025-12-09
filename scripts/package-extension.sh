#!/bin/bash

# Package GNOME Shell extension into a zip file
# Usage: package-extension.sh <uuid> <version>
# Outputs: filename to $GITHUB_OUTPUT

set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <uuid> <version>"
  exit 1
fi

UUID="$1"
VERSION="$2"
FILENAME="${UUID}.v${VERSION}.shell-extension.zip"

echo "Packaging extension: $FILENAME"

cd dist
zip -r "../${FILENAME}" .
cd ..

echo "Package created: $FILENAME"
echo "filename=$FILENAME" >> "$GITHUB_OUTPUT"
