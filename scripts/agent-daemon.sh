#!/usr/bin/env bash
set -e

REPO="geniok1980/ai-photostudio"
BRANCH="main"
POLL_INTERVAL=${POLL_INTERVAL:-60}
WORK_DIR="/root/ai-photostudio"

log() { echo "[$(date '+%H:%M:%S')] $*"; }
error() { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; }

get_token() {
    cd /root/clawhost && git remote get-url origin | grep -oP 'ghp_[^@]+' | head -1
}

get_issues() {
    local filter="$1"
    local token=$(get_token)
    local filter_query=""
    [ "$filter" = "gemini" ] && filter_query="&labels=gemini"
    curl -s -H "Authorization: token $token" \
        "https://api.github.com/repos/$REPO/issues?state=open&labels=agent-ready$filter_query" | \
        jq -r '.[] | "\(.number)|\(.title)"'
}

claim_issue() {
    local num=$1
    local token=$(get_token)
    curl -s -X PATCH -H "Authorization: token $token" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/issues/$num" \
        -d '{"labels":["in-progress","agent-ready","gemini"],"assignees":["github-actions[bot]"]}' >/dev/null 2>&1
    log "Issue #$num: claimed"
}

close_issue() {
    local num=$1
    local token=$(get_token)
    curl -s -X PATCH -H "Authorization: token $token" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO/issues/$num" \
        -d '{"state":"closed","labels":["completed"]}' >/dev/null 2>&1
    log "Issue #$num: closed"
}

run_gemini() {
    local num=$1 title=$2
    log "🤖 Gemini CLI: Issue #$num — $title"
    
    cd "$WORK_DIR"
    local branch="agent/$num-task"
    
    # git setup
    git checkout -b "$branch" 2>/dev/null || git checkout "$branch"
    
    local prompt="Read and implement GitHub Issue #$num from $REPO.
Title: $title

Full issue: https://github.com/$REPO/issues/$num

Important: This is a Bun + TypeScript monorepo.
- Backend: apps/api/ (Hono.js)
- Frontend: apps/web/ (React + Vite + Tailwind)
- Package manager: bun
- No Python, no GPU needed

Steps:
1. Read the issue description to understand the task
2. Check existing code in /root/ai-photostudio
3. Make changes that implement the task
4. Verify: run 'bun run build' in apps/web and 'bun build src/index.ts --no-bundle' in apps/api
5. If all good: git add -A && git commit -m 'feat: implement issue #$num'
6. git push -u origin $branch 2>&1
7. Create a PR: go to https://github.com/$REPO/pull/new/$branch and verify changes were pushed"

    log "Running Gemini for Issue #$num..."
    timeout 300 /root/.hermes/node/bin/gemini -p "$prompt" --approval-mode yolo --skip-trust > /tmp/gemini-ai-$num.log 2>&1
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        log "Gemini timed out for Issue #$num"
    elif [ $exit_code -ne 0 ]; then
        log "Gemini failed for Issue #$num (exit $exit_code)"
    fi
    
    # Try to push any changes
    cd "$WORK_DIR"
    if ! git diff --quiet HEAD 2>/dev/null; then
        log "Pushing changes..."
        git add -A
        git commit -m "feat: implement issue #$num" 2>/dev/null || true
        git push -u origin "$branch" 2>&1 || log "Push failed (maybe no changes)"
    else
        log "No changes from Gemini"
        git checkout main 2>/dev/null || true
    fi
}

process() {
    log "Checking for tasks in $REPO..."
    local issues=$(get_issues "gemini")
    
    if [ -z "$issues" ]; then
        log "No pending tasks"
        return
    fi
    
    while IFS='|' read -r num title; do
        [ -z "$num" ] && continue
        log "Processing Issue #$num: $title"
        claim_issue "$num"
        run_gemini "$num" "$title"
        close_issue "$num"
    done <<< "$issues"
    
    log "Cycle done"
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
            sleep "$POLL_INTERVAL"
        done
        ;;
esac
