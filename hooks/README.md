# TimeTracker — Claude Code Hooks

These hooks automatically track your Claude Code sessions and log them as time entries.

## How it works

Claude Code emits lifecycle events (`SessionStart`, `UserPromptSubmit`, `Stop`, `SessionEnd`). The hook script captures these and sends them to the TimeTracker API, which creates time entries automatically.

Sessions are matched to projects by comparing the working directory (`cwd`) against each project's `cwd_pattern`. If the cwd starts with a project's pattern, the session is linked to that project.

Idle time (gaps > 5 min between prompts) is subtracted from the total.

## Installation

### Prerequisites

- TimeTracker backend running (locally or deployed)
- `CLAUDE_HOOK_API_KEY` set in the backend's environment
- `CLAUDE_HOOK_USER_EMAIL` set in the backend's environment

### Quick install

```bash
cd /path/to/timetracker
bash hooks/install.sh
```

The script will ask for:
1. Your email
2. Backend URL (default: `http://localhost:3000`)
3. API key (the `CLAUDE_HOOK_API_KEY` you set in `.env.local`)

### Manual install

1. Copy `timetracker.sh` to `~/.claude/hooks/` and make it executable:

```bash
mkdir -p ~/.claude/hooks
cp hooks/timetracker.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/timetracker.sh
```

2. Create `~/.claude/timetracker.env`:

```bash
API_URL="http://localhost:3000"
API_KEY="your-api-key"
USER_EMAIL="you@example.com"
```

3. Add hooks to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "~/.claude/hooks/timetracker.sh SessionStart" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "~/.claude/hooks/timetracker.sh UserPromptSubmit" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "~/.claude/hooks/timetracker.sh Stop" }] }],
    "SessionEnd": [{ "hooks": [{ "type": "command", "command": "~/.claude/hooks/timetracker.sh SessionEnd" }] }]
  }
}
```

## Testing

Send a test event:

```bash
echo '{"session_id":"test-123","cwd":"/tmp"}' | ~/.claude/hooks/timetracker.sh SessionStart
```

Check the log:

```bash
tail -f ~/.claude/timetracker.log
```

## Troubleshooting

- **No events reaching the API**: Check `~/.claude/timetracker.log` for errors
- **Session not linked to project**: Verify the project's `cwd_pattern` is a prefix of the directory you're working in
- **401 errors**: Verify the API key matches `CLAUDE_HOOK_API_KEY` in the backend
