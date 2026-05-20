#!/usr/bin/env bash
# TimeTracker hook for Claude Code — sends session events to the API

set -euo pipefail

EVENT_TYPE="${1:-unknown}"
ENV_FILE="$HOME/.claude/timetracker.env"
LOG_FILE="$HOME/.claude/timetracker.log"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: $ENV_FILE not found" >> "$LOG_FILE"
  exit 0
fi

source "$ENV_FILE"

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"session_id"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
CWD=$(echo "$INPUT" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')

if [ -z "$SESSION_ID" ]; then
  SESSION_ID="unknown-$(date +%s)"
fi

if [ -z "$CWD" ]; then
  CWD="$(pwd)"
fi

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

PAYLOAD=$(cat <<EOJSON
{
  "external_session_id": "$SESSION_ID",
  "event_type": "$EVENT_TYPE",
  "cwd": "$CWD",
  "timestamp": "$TIMESTAMP"
}
EOJSON
)

{
  curl -s -X POST "${API_URL}/api/claude/event" \
    -H "Content-Type: application/json" \
    -H "X-Api-Key: ${API_KEY}" \
    -d "$PAYLOAD" \
    -o /dev/null \
    -w "%{http_code}" \
    --connect-timeout 5 \
    --max-time 10
  echo " $(date -u +%Y-%m-%dT%H:%M:%SZ) $EVENT_TYPE session=$SESSION_ID cwd=$CWD"
} >> "$LOG_FILE" 2>&1 &

exit 0
