#!/usr/bin/env bash
# TimeTracker — Claude Code hooks installer
set -euo pipefail

echo "=== TimeTracker Hook Installer ==="
echo ""

read -rp "Your email: " USER_EMAIL
read -rp "Backend URL [http://localhost:3000]: " API_URL
API_URL="${API_URL:-http://localhost:3000}"
read -rp "API Key (CLAUDE_HOOK_API_KEY from .env.local): " API_KEY

if [ -z "$USER_EMAIL" ] || [ -z "$API_KEY" ]; then
  echo "ERROR: Email and API Key are required."
  exit 1
fi

# Save config
mkdir -p "$HOME/.claude"
cat > "$HOME/.claude/timetracker.env" <<EOF
API_URL="$API_URL"
API_KEY="$API_KEY"
USER_EMAIL="$USER_EMAIL"
EOF

echo "Config saved to ~/.claude/timetracker.env"

# Copy hook script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$HOME/.claude/hooks"
cp "$SCRIPT_DIR/timetracker.sh" "$HOME/.claude/hooks/timetracker.sh"
chmod +x "$HOME/.claude/hooks/timetracker.sh"
echo "Hook script installed to ~/.claude/hooks/timetracker.sh"

# Update settings.json
SETTINGS_FILE="$HOME/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
  # Back up existing settings
  cp "$SETTINGS_FILE" "$SETTINGS_FILE.bak"
  echo "Backed up existing settings to $SETTINGS_FILE.bak"
fi

# Use node to merge hooks into existing settings (preserves other config)
node -e "
const fs = require('fs');
const path = '$SETTINGS_FILE';
let settings = {};
try { settings = JSON.parse(fs.readFileSync(path, 'utf8')); } catch {}
if (!settings.hooks) settings.hooks = {};
const hookCmd = '~/.claude/hooks/timetracker.sh';
const events = ['SessionStart', 'UserPromptSubmit', 'Stop', 'SessionEnd'];
for (const evt of events) {
  const entry = { hooks: [{ type: 'command', command: hookCmd + ' ' + evt }] };
  if (!settings.hooks[evt]) {
    settings.hooks[evt] = [entry];
  } else {
    const already = settings.hooks[evt].some(m =>
      m.hooks?.some(h => h.command?.includes('timetracker.sh'))
    );
    if (!already) settings.hooks[evt].push(entry);
  }
}
fs.writeFileSync(path, JSON.stringify(settings, null, 2) + '\n');
"

echo "Hooks configured in $SETTINGS_FILE"
echo ""
echo "=== Installation complete! ==="
echo ""
echo "Test it with:  echo '{\"session_id\":\"test-123\",\"cwd\":\"/tmp\"}' | ~/.claude/hooks/timetracker.sh SessionStart"
echo "Check logs at: ~/.claude/timetracker.log"
