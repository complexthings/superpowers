#!/usr/bin/env python3
"""slim - reduce noisy command output to signal before it reaches your context.

A stdin->stdout filter for output you CAN'T shape with a tool's own flags:
logs, scan results, status dumps, stack traces, repeated lines. For tools that
already project output (jq/yq/dasel/miller/htmlq), use their selectors instead;
piping them through slim is redundant.

Pipe a verbose command through it and ask only for the reductions you need:

    cargo test 2>&1 | slim --errors --dedup
    rg -n TODO --no-ignore | slim --group-dir
    gh run view --log | slim --uniq --max-line 200 --middle 40
    kubectl get events | slim --dedup --stats

Reductions (compose freely):
  --comments        drop comment-only lines (# // ; -- *) and blank lines
  --errors          keep only lines matching error|warn|fail|fatal|panic|exception (-i)
  --grep RE         keep only lines matching regex RE (use --invert to drop them)
  --invert          invert --grep / --errors (drop matches instead of keeping)
  --dedup           collapse ALL repeated lines, first-seen order, annotate "  (xN)"
  --uniq            collapse only CONSECUTIVE repeats, annotate "  (xN)" (log-friendly)
  --group-dir       turn a list of file paths into per-directory counts
  --max-line N      truncate each line to N chars, append a horizontal ellipsis
  --head N          keep first N lines
  --tail N          keep last N lines
  --middle N        keep first N and last N lines, replace the gap with a marker
  --stats           print "lines A->B, bytes A->B (-P%)" to stderr (output unaffected)

Always-on, lossless: trailing whitespace is stripped and runs of blank lines
collapse to one. Everything lossy is opt-in. Order: filter -> transform ->
dedup -> group -> blank-collapse -> truncate. Reductions are LOSSY by design;
ask for what the task needs and know what you're discarding.
"""
import argparse
import re
import sys

COMMENT_RE = re.compile(r"^\s*(#|//|;|--|\*|/\*|\*/)")
ERROR_RE = re.compile(r"error|warn|fail|fatal|panic|exception|traceback", re.IGNORECASE)
ELLIPSIS = "…"


def annotate(line: str, n: int) -> str:
    return line if n == 1 else f"{line}  (x{n})"


def dedup_all(lines):
    counts, order = {}, []
    for ln in lines:
        if ln not in counts:
            counts[ln] = 0
            order.append(ln)
        counts[ln] += 1
    return [annotate(ln, counts[ln]) for ln in order]


def dedup_adjacent(lines):
    out, prev, n = [], None, 0
    for ln in lines:
        if ln == prev:
            n += 1
        else:
            if prev is not None:
                out.append(annotate(prev, n))
            prev, n = ln, 1
    if prev is not None:
        out.append(annotate(prev, n))
    return out


def group_dir(lines):
    counts, order = {}, []
    for ln in lines:
        token = ln.split(":", 1)[0].strip()  # tolerate rg's path:line: prefix
        d = token.rsplit("/", 1)[0] + "/" if "/" in token else "./"
        if d not in counts:
            counts[d] = 0
            order.append(d)
        counts[d] += 1
    width = max((len(d) for d in order), default=0)
    return [f"{d.ljust(width)}  ({counts[d]} file{'s' if counts[d] != 1 else ''})" for d in order]


def collapse_blanks(lines):
    out, blank = [], False
    for ln in lines:
        if ln.strip() == "":
            if not blank:
                out.append("")
            blank = True
        else:
            out.append(ln)
            blank = False
    while out and out[-1] == "":
        out.pop()
    return out


def main() -> int:
    p = argparse.ArgumentParser(add_help=True, description="Reduce noisy stdout to signal.")
    p.add_argument("--comments", action="store_true")
    p.add_argument("--errors", action="store_true")
    p.add_argument("--grep", metavar="RE")
    p.add_argument("--invert", action="store_true")
    p.add_argument("--dedup", action="store_true")
    p.add_argument("--uniq", action="store_true")
    p.add_argument("--group-dir", action="store_true")
    p.add_argument("--max-line", type=int, metavar="N")
    p.add_argument("--head", type=int, metavar="N")
    p.add_argument("--tail", type=int, metavar="N")
    p.add_argument("--middle", type=int, metavar="N")
    p.add_argument("--stats", action="store_true")
    args = p.parse_args()

    raw = sys.stdin.read()
    in_lines = raw.splitlines()
    in_bytes = len(raw.encode("utf-8", "replace"))

    lines = [ln.rstrip() for ln in in_lines]

    if args.comments:
        lines = [ln for ln in lines if ln.strip() and not COMMENT_RE.match(ln)]

    if args.errors or args.grep:
        pat = re.compile(args.grep) if args.grep else ERROR_RE
        keep = (lambda ln: not pat.search(ln)) if args.invert else (lambda ln: bool(pat.search(ln)))
        lines = [ln for ln in lines if keep(ln)]

    if args.max_line and args.max_line > 0:
        lines = [ln if len(ln) <= args.max_line else ln[: args.max_line] + ELLIPSIS for ln in lines]

    if args.dedup:
        lines = dedup_all(lines)
    elif args.uniq:
        lines = dedup_adjacent(lines)

    if args.group_dir:
        lines = group_dir(lines)

    lines = collapse_blanks(lines)

    if args.middle and args.middle > 0 and len(lines) > 2 * args.middle:
        omitted = len(lines) - 2 * args.middle
        lines = lines[: args.middle] + [f"{ELLIPSIS} {omitted} lines omitted {ELLIPSIS}"] + lines[-args.middle :]
    if args.head and args.head > 0:
        lines = lines[: args.head]
    if args.tail and args.tail > 0:
        lines = lines[-args.tail :]

    out = "\n".join(lines)
    if out:
        out += "\n"
    sys.stdout.write(out)

    if args.stats:
        out_bytes = len(out.encode("utf-8", "replace"))
        pct = 0 if in_bytes == 0 else round(100 * (1 - out_bytes / in_bytes))
        change = f"-{pct}%" if pct >= 0 else f"+{-pct}% larger"
        sys.stderr.write(
            f"slim: lines {len(in_lines)}->{len(lines)}, bytes {in_bytes}->{out_bytes} ({change})\n"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
