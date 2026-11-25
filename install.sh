#!/bin/sh
# Installs the Claude Code skill that sets this dashboard up for you.
set -e
DEST="$HOME/.claude/skills/instagram-pipeline-dashboard"
mkdir -p "$DEST"
cp -R "$(dirname "$0")/skill/." "$DEST/"
echo "Installed. Open Claude Code and type /instagram-pipeline-dashboard"
