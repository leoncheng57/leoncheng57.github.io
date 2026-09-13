#!/usr/bin/env bash
# check_links.sh — every local .md / .html a study pack links to exists.
#
#   check_links.sh [pack-dir]      (default: cwd)
#
# Checks every link position in every document: index.html's DOCS array
# (f:"…" / html:"…") plus Markdown [text](file.md) and HTML href="file.html"
# throughout.
#
# Deliberately narrow: it matches only link positions, never bare text. A
# looser grep over the whole file also picks up CSS selectors (.pill.html),
# JS property access (d.html) and filenames mentioned in prose.
#
# Exit 0 if everything resolves, 1 otherwise.
set -uo pipefail

DIR=${1:-.}
cd "$DIR" || exit 2
[ -e index.html ] || echo "note: no index.html in $DIR"

shopt -s nullglob
docs=(*.md *.html)
if [ ${#docs[@]} -eq 0 ]; then
  echo "no .md or .html files in $DIR" >&2
  exit 2
fi

# Collect "<source>\t<target>" pairs, then check them in the main shell —
# a `while read` on the right of a pipe runs in a subshell and cannot set
# the failure flag.
pairs=$(
  for doc in "${docs[@]}"; do
    {
      grep -ohE '\]\([^)]+\.(md|html)\)|href="[^"]+\.(md|html)"' "$doc"
      [ "$doc" = index.html ] && grep -ohE '(f:"|html:")[^"]+\.(md|html)' "$doc"
    } 2>/dev/null |
      sed -E 's/^\]\(//; s/\)$//; s/^href="//; s/^(f:"|html:")//; s/"$//' |
      sort -u |
      while read -r target; do printf '%s\t%s\n' "$doc" "$target"; done
  done
)

missing=0
while IFS=$'\t' read -r src target; do
  [ -n "${target:-}" ] || continue
  case $target in http*|\#*|mailto:*) continue ;; esac
  if [ ! -e "$target" ]; then
    printf 'MISSING: %-40s (linked from %s)\n' "$target" "$src"
    missing=1
  fi
done <<< "$pairs"

if [ "$missing" -eq 0 ]; then
  echo "All local document links resolve (${#docs[@]} documents checked)."
else
  echo
  echo "Fix before handing the pack over: an index card linking to a document that"
  echo "was planned and never written is the commonest defect in a generated pack."
fi
exit $missing
