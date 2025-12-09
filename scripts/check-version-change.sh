#!/bin/bash

# Check if version in metadata.json has changed
# Outputs: changed, version, uuid to $GITHUB_OUTPUT

set -e

METADATA_FILE="dist/metadata.json"

# Get version and UUID from current commit
CURRENT_VERSION=$(jq -r '.version' "$METADATA_FILE")
UUID=$(jq -r '.uuid' "$METADATA_FILE")

# Get version from previous commit
git checkout HEAD~1 -- "$METADATA_FILE"
PREVIOUS_VERSION=$(jq -r '.version' "$METADATA_FILE")
git checkout HEAD -- "$METADATA_FILE"

echo "Current version: $CURRENT_VERSION"
echo "Previous version: $PREVIOUS_VERSION"

if [ "$CURRENT_VERSION" != "$PREVIOUS_VERSION" ]; then
  echo "Version changed from $PREVIOUS_VERSION to $CURRENT_VERSION"
  echo "changed=true" >> "$GITHUB_OUTPUT"
  echo "version=$CURRENT_VERSION" >> "$GITHUB_OUTPUT"
  echo "uuid=$UUID" >> "$GITHUB_OUTPUT"
else
  echo "Version unchanged, skipping release"
  echo "changed=false" >> "$GITHUB_OUTPUT"
fi
