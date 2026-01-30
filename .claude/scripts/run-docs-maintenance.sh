#!/bin/bash

# Documentation Maintenance Helper Script
# Wrapper for triggering docs maintenance workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_color() {
  local color=$1
  shift
  echo -e "${color}$@${NC}"
}

# Check if gh CLI is installed and authenticated
check_prerequisites() {
  if ! command -v gh &> /dev/null; then
    print_color "$RED" "❌ Error: gh CLI is not installed"
    echo "Install from: https://cli.github.com/"
    exit 1
  fi

  if ! gh auth status &> /dev/null; then
    print_color "$RED" "❌ Error: gh CLI is not authenticated"
    echo "Run: gh auth login"
    exit 1
  fi

  print_color "$GREEN" "✅ Prerequisites check passed"
}

# Get current branch
get_current_branch() {
  git branch --show-current
}

# Trigger workflow
trigger_workflow() {
  local dry_run=$1
  local branch=$(get_current_branch)

  print_color "$BLUE" "📋 Triggering workflow on branch: $branch"

  if [ "$dry_run" = "true" ]; then
    print_color "$YELLOW" "🔍 Dry-run mode enabled"
    gh workflow run docs-maintenance.yml --ref "$branch" -f dry_run=true
  else
    gh workflow run docs-maintenance.yml --ref "$branch"
  fi

  if [ $? -eq 0 ]; then
    print_color "$GREEN" "✅ Workflow triggered successfully"
    return 0
  else
    print_color "$RED" "❌ Failed to trigger workflow"
    return 1
  fi
}

# Wait for workflow to start and get run ID
get_latest_run_id() {
  local max_wait=30
  local waited=0

  print_color "$BLUE" "⏳ Waiting for workflow to start..."

  while [ $waited -lt $max_wait ]; do
    sleep 2
    waited=$((waited + 2))

    local run_id=$(gh run list --workflow=docs-maintenance.yml --limit 1 --json databaseId --jq '.[0].databaseId')

    if [ -n "$run_id" ] && [ "$run_id" != "null" ]; then
      echo "$run_id"
      return 0
    fi
  done

  return 1
}

# Watch workflow execution
watch_workflow() {
  local run_id=$1

  print_color "$BLUE" "👀 Watching workflow run: $run_id"
  print_color "$BLUE" "🔗 View in browser: $(gh run view $run_id --json url --jq '.url')"

  gh run watch "$run_id"

  # Check final status
  local status=$(gh run view "$run_id" --json conclusion --jq '.conclusion')

  if [ "$status" = "success" ]; then
    print_color "$GREEN" "✅ Workflow completed successfully"
    return 0
  else
    print_color "$RED" "❌ Workflow failed with status: $status"
    return 1
  fi
}

# Find created PR
find_pr() {
  print_color "$BLUE" "🔍 Looking for created PR..."

  local pr_url=$(gh pr list --label documentation,automated --limit 1 --json url --jq '.[0].url')

  if [ -n "$pr_url" ] && [ "$pr_url" != "null" ]; then
    print_color "$GREEN" "📝 PR created: $pr_url"
    return 0
  else
    print_color "$YELLOW" "⚠️  No PR created (no changes detected)"
    return 0
  fi
}

# Main execution
main() {
  local mode="${1:-normal}"

  print_color "$BLUE" "================================================"
  print_color "$BLUE" "📚 Documentation Maintenance"
  print_color "$BLUE" "================================================"
  echo ""

  check_prerequisites

  case "$mode" in
    --dry-run)
      trigger_workflow "true"
      ;;

    --watch)
      trigger_workflow "false"
      run_id=$(get_latest_run_id)
      if [ $? -eq 0 ]; then
        watch_workflow "$run_id"
        find_pr
      else
        print_color "$RED" "❌ Failed to get run ID"
        exit 1
      fi
      ;;

    --status)
      print_color "$BLUE" "📊 Latest workflow runs:"
      gh run list --workflow=docs-maintenance.yml --limit 5
      ;;

    --help)
      echo "Usage: $0 [mode]"
      echo ""
      echo "Modes:"
      echo "  (none)      Trigger workflow and exit"
      echo "  --dry-run   Trigger dry-run (no changes)"
      echo "  --watch     Trigger and watch until complete"
      echo "  --status    Show recent workflow runs"
      echo "  --help      Show this help"
      echo ""
      echo "Examples:"
      echo "  $0                 # Trigger workflow"
      echo "  $0 --dry-run       # Test without making changes"
      echo "  $0 --watch         # Trigger and wait for completion"
      echo "  $0 --status        # Check recent runs"
      ;;

    *)
      trigger_workflow "false"
      ;;
  esac

  echo ""
  print_color "$GREEN" "✅ Done"
}

# Run main
main "$@"
