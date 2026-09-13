#!/usr/bin/env bash
# pr_head_check.sh — is the working tree telling the truth about these PRs?
#
# For each PR: print the PR head SHA, the local SHA of the PR's head branch (if
# the ref exists at all), and a verdict. Read-only — no fetch, no checkout, no
# stash, nothing that touches the working tree.
#
#   pr_head_check.sh owner/repo 123 124 125
#   pr_head_check.sh acme/webapp 4821 4822
#
# Exit status: 0 if every PR's head branch is present locally AND at the PR head.
#              1 if any is stale, missing, or unreadable — i.e. read the PR head,
#              not the working tree.
set -uo pipefail

if [ $# -lt 2 ]; then
  echo "usage: $(basename "$0") <owner/repo> <pr-number> [pr-number ...]" >&2
  exit 2
fi

REPO=$1; shift
stale=0

printf '%s\n' "Repo: $REPO"
printf '%s\n' "Current branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '(not a git repo)')"
echo

# Two passes: collect first so the branch column can be sized to the data.
branches=() heads=() prs=()
for pr in "$@"; do
  meta=$(gh pr view "$pr" --repo "$REPO" --json headRefName,headRefOid \
           --jq '"\(.headRefName)\t\(.headRefOid)"' 2>/dev/null)
  prs+=("$pr")
  if [ -z "$meta" ]; then
    branches+=("(gh pr view failed)"); heads+=("")
  else
    branches+=("${meta%%$'\t'*}"); heads+=("${meta##*$'\t'}")
  fi
done

w=6
for b in "${branches[@]}"; do [ ${#b} -gt $w ] && w=${#b}; done

printf "%-8s  %-${w}s  %-11s  %-11s  %s\n" PR BRANCH PR-HEAD LOCAL VERDICT
printf "%-8s  %-${w}s  %-11s  %-11s  %s\n" \
  "$(printf '%.8s' --------)" "$(printf "%${w}s" '' | tr ' ' -)" ----------- ----------- -------

for i in "${!prs[@]}"; do
  pr=${prs[$i]} branch=${branches[$i]} head=${heads[$i]}
  if [ -z "$head" ]; then
    printf "%-8s  %-${w}s  %-11s  %-11s  %s\n" "#$pr" "$branch" - - 'UNKNOWN'
    stale=1
    continue
  fi
  head_short=${head:0:9}
  local_sha=$(git rev-parse "$branch" 2>/dev/null || git rev-parse "origin/$branch" 2>/dev/null || echo "")
  if [ -z "$local_sha" ]; then
    verdict='MISSING — no local ref'
    local_short='-'
    stale=1
  else
    local_short=${local_sha:0:9}
    if [ "$local_short" = "$head_short" ]; then
      verdict='current'
    elif ! git cat-file -e "${head}^{commit}" 2>/dev/null; then
      # The PR head has never been fetched, so the distance is not computable
      # locally — and computing it would mean fetching, which is the one thing
      # this check must not do.
      verdict='STALE — PR head not in local objects'
      stale=1
    else
      behind=$(git rev-list --count "$local_sha..$head" 2>/dev/null || echo '?')
      ahead=$(git rev-list --count "$head..$local_sha" 2>/dev/null || echo '?')
      verdict="STALE — local is ${behind} behind / ${ahead} ahead"
      stale=1
    fi
  fi
  printf "%-8s  %-${w}s  %-11s  %-11s  %s\n" "#$pr" "$branch" "$head_short" "$local_short" "$verdict"
done
echo
if [ "$stale" -ne 0 ]; then
  cat <<'MSG'
At least one branch is stale, missing, or unreadable.
Read source at the PR head instead of from the working tree:

  gh api "repos/<owner>/<repo>/contents/<path>?ref=<sha>" --jq '.content' | base64 -d
  gh pr diff <n> --repo <owner>/<repo>

Do not fetch, check out, or stash to "fix" this — the point is to leave the
working tree alone.
MSG
else
  echo 'Every PR head branch is present locally and at the PR head.'
  echo 'The working tree is safe to read — still name the ref in what you write.'
fi

exit $stale
