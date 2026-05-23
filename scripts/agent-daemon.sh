#!/usr/bin/env bash
# agent-daemon.sh - Обработчик GitHub Issues через Gemini CLI
# Usage: ./agent-daemon.sh [--once|--daemon]

REPO="geniok1980/ai-photostudio"
BRANCH="main"
WORK_DIR="/root/ai-photostudio"
GEMINI_BIN="/root/.hermes/node/bin/gemini"

log() { echo "[$(date '+%H:%M:%S')] $*"; }
error() { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; }

get_token() {
    cd /root/clawhost && git remote get-url origin | grep -oP 'ghp_[^@]+' | head -1
}

get_issues() {
    local token=$(get_token)
    if [ -z "$token" ]; then
        error "Failed to get GitHub token"
        return 1
    fi
    curl -s -H "Authorization: token $token" \
        "https://api.github.com/repos/$REPO/issues?state=open&labels=agent-ready,gemini&per_page=10" 2>/dev/null | \
        jq -r 'if type=="array" then .[] | "\(.number)|\(.title)" else empty end' 2>/dev/null || true
}

claim_issue() {
    local num=$1
    local token=$(get_token)
    curl -s -X PATCH -H "Authorization: token $token" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/issues/$num" \
        -d '{"labels":["in-progress","agent-ready","gemini"]}' >/dev/null 2>&1
    log "Issue #$num: claimed"
}

close_issue() {
    local num=$1
    local token=$(get_token)
    curl -s -X PATCH -H "Authorization: token $token" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/issues/$num" \
        -d '{"state":"closed","labels":["completed"]}' >/dev/null 2>&1
    log "Issue #$num: closed! ✅"
}

get_issue_body() {
    local num=$1
    local token=$(get_token)
    curl -s -H "Authorization: token $token" \
        "https://api.github.com/repos/$REPO/issues/$num" 2>/dev/null | \
        jq -r '.body // "No description"' 2>/dev/null || echo "No description"
}

run_gemini() {
    local num=$1 title=$2
    log "🤖 Gemini CLI: Starting Issue #$num — $title"
    
    # Read the actual issue body
    local body=$(get_issue_body "$num")
    log "Issue body length: ${#body} chars"
    
    cd "$WORK_DIR"
    local branch="agent/$num-task"
    
    # Reset to main and create branch
    git fetch origin 2>/dev/null || true
    git checkout "$BRANCH" 2>/dev/null || true
    git pull origin "$BRANCH" 2>/dev/null || true
    git branch -D "$branch" 2>/dev/null || true
    git checkout -b "$branch"
    
    log "Created branch: $branch"
    
    local prompt="Task: Implement GitHub Issue #$num from $REPO.

Title: $title

Issue description:
$body

Project location: /root/ai-photostudio
This is a Bun + TypeScript monorepo with Turborepo.
- Backend: apps/api/ (Hono.js + Bun, SQLite)
- Frontend: apps/web/ (React + Vite + Tailwind, dark theme)
- Package manager: bun (NOT npm!)
- All existing source code is in /root/ai-photostudio

Instructions:
1. Read the issue description above carefully
2. Explore the existing code in /root/ai-photostudio
3. Implement all the tasks listed in the issue
4. After changes, verify: 'cd apps/api && bun build src/index.ts --no-bundle'
5. Also verify: 'cd apps/web && bun run build'
6. If build succeeds: git add -A && git commit -m 'feat: implement issue #$num'
7. git push -u origin $branch"

    log "Running Gemini CLI (timeout: 5 min)..."
    timeout 300 $GEMINI_BIN -p "$prompt" --approval-mode yolo --skip-trust > /tmp/gemini-ai-$num.log 2>&1
    local exit_code=$?
    
    log "Gemini finished with exit code: $exit_code"
    
    # Push any changes
    cd "$WORK_DIR"
    if ! git diff --quiet HEAD 2>/dev/null; then
        log "Changes detected! Pushing..."
        git add -A
        git commit -m "feat: implement issue #$num" 2>/dev/null || true
        git push -u origin "$branch" 2>&1 | tail -5
        log "✅ Pushed to: $branch"
    else
        log "No changes from Gemini"
        git checkout "$BRANCH" 2>/dev/null || true
    fi
    
    # Print last lines of the log
    if [ -f /tmp/gemini-ai-$num.log ]; then
        log "=== Last 10 lines of Gemini log ==="
        tail -10 /tmp/gemini-ai-$num.log 2>/dev/null
        log "=== End of log ==="
    fi
}

process() {
    log "=== Checking for tasks in $REPO ==="
    local issues=$(get_issues)
    
    if [ -z "$issues" ]; then
        log "No pending tasks found (no issues with labels: agent-ready, gemini)"
        return
    fi
    
    log "Found issues:"
    echo "$issues" | while IFS='|' read -r num title; do
        [ -z "$num" ] && continue
        log "  #$num: $title"
    done
    
    echo "$issues" | while IFS='|' read -r num title; do
        [ -z "$num" ] && continue
        log "=============================="
        log "Processing Issue #$num: $title"
        log "=============================="
        claim_issue "$num"
        run_gemini "$num" "$title"
        close_issue "$num"
    done
    
    log "=== All tasks completed ==="
}

# Main
MODE="${1:-once}"

case "$MODE" in
    once)
        process
        ;;
    daemon)
        log "Running daemon for $REPO (Ctrl+C to stop)"
        while true; do
            process
            log "Sleeping 60s..."
            sleep 60
        done
        ;;
esac
