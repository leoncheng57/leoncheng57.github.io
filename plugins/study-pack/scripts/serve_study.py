#!/usr/bin/env python3
"""Serve a study pack, rendering .md to styled HTML so its links navigate.

    serve_study.py [DIR] [--port N]

DIR defaults to the current directory. Dependency-free: a small Markdown subset
covering what a study pack actually uses — headings, tables, fenced code,
blockquotes, lists, hr, inline code/bold/italic/links, and raw <details>
passthrough. The palette is the same committed light "paper" theme the HTML
pages use, so a rendered .md and a hand-written .html page sit side by side
without a seam.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import errno
import html as _html
import re
import sys

CSS = """
:root{
  /* paper */
  --bg:#f2efe4; --surface:#fbf9f2; --surface-2:#e8e2d2; --ink:#282419; --muted:#6b6353;
  --rule:#dcd3bd; --rule-2:#bfb49a;
  /* ink colours, as on printed paper */
  --accent:#2e4a86; --accent-soft:#e7e2d2;
  --ok:#3d6b46; --ok-s:#e2e9db; --t1:#3d6b46; --t1s:#e2e9db;
  --warn:#8a5f12; --warn-s:#f0e7cf; --t2:#8a5f12; --t2s:#f0e7cf;
  --bad:#9c3a42; --bad-s:#f2e1dc; --dead:#9c3a42; --dead-s:#f2e1dc;
  --t4:#9c3a42; --t4s:#f2e1dc;
  --t3:#6b4a7a; --t3s:#eae2ec;
  --t5:#6b6353; --t5s:#e8e2d2;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  --serif:Georgia,"Times New Roman",serif;
  color-scheme:light;
}

*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15.5px;line-height:1.62}
.wrap{max-width:52rem;margin:0 auto;padding:1rem clamp(1rem,4vw,2.5rem) 5rem}
nav.top{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--rule);
  padding:.6rem 0;margin-bottom:1.5rem;display:flex;gap:.8rem;align-items:center;font-family:var(--mono);
  font-size:.74rem;z-index:10;flex-wrap:wrap}
nav.top a{text-decoration:none;color:var(--accent)} nav.top .sep{color:var(--rule-2)}
nav.top .cur{color:var(--muted)}
h1{font-family:var(--serif);font-size:clamp(1.6rem,4vw,2.15rem);line-height:1.15;margin:.4rem 0 .8rem;
  font-weight:600;letter-spacing:-.02em}
h2{font-family:var(--serif);font-size:1.35rem;margin:2.2rem 0 .5rem;font-weight:600;letter-spacing:-.01em;
  padding-top:.6rem;border-top:1px solid var(--rule)}
h3{font-size:1.02rem;margin:1.5rem 0 .4rem;font-weight:600}
h4{font-size:.92rem;margin:1.2rem 0 .3rem;font-weight:600;color:var(--muted)}
p{margin:.7rem 0;max-width:70ch}
a{color:var(--accent);text-underline-offset:2px}
code{font-family:var(--mono);background:var(--surface-2);padding:.12em .34em;border-radius:3px;font-size:.86em;
  word-break:break-word}
pre{background:var(--surface);border:1px solid var(--rule);border-radius:7px;padding:.8rem 1rem;
  overflow-x:auto;font-family:var(--mono);font-size:.82rem;line-height:1.55;margin:.9rem 0}
pre code{background:none;padding:0;font-size:inherit}
blockquote{margin:1rem 0;padding:.6rem .95rem;border-left:3px solid var(--accent);background:var(--accent-soft);
  border-radius:0 6px 6px 0}
blockquote p{margin:.3rem 0;max-width:66ch}
ul,ol{margin:.7rem 0;padding-left:1.4rem;max-width:70ch} li{margin:.28rem 0}
li::marker{color:var(--rule-2)}
hr{border:none;border-top:1px solid var(--rule);margin:2rem 0}
.scroller{overflow-x:auto;margin:.9rem 0}
table{width:100%;border-collapse:collapse;font-size:.88rem;min-width:30rem}
th{text-align:left;font-family:var(--mono);font-size:.66rem;letter-spacing:.07em;text-transform:uppercase;
  color:var(--muted);font-weight:500;padding:0 .8rem .4rem 0;border-bottom:1px solid var(--rule-2);white-space:nowrap}
td{padding:.45rem .8rem .45rem 0;border-bottom:1px solid var(--rule);vertical-align:top}
tr:last-child td{border-bottom:none}
details{background:var(--surface);border:1px solid var(--rule);border-radius:8px;padding:.8rem 1rem;margin:1rem 0}
details summary{cursor:pointer;font-weight:600}
strong{font-weight:600}
.warnblock{border-left:3px solid var(--warn);background:var(--warn-s);padding:.6rem .95rem;border-radius:0 6px 6px 0}
"""

INLINE_CODE = re.compile(r"`([^`]+)`")
LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITAL = re.compile(r"(?<![*\w])\*([^*\n]+)\*(?![*\w])")

def inline(text):
    slots = []

    def stash(m):
        slots.append(f"<code>{_html.escape(m.group(1))}</code>")
        return f"\x00{len(slots)-1}\x00"

    text = INLINE_CODE.sub(stash, text)
    text = _html.escape(text)
    text = LINK.sub(lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', text)
    text = BOLD.sub(r"<strong>\1</strong>", text)
    text = ITAL.sub(r"<em>\1</em>", text)
    text = re.sub(r"\x00(\d+)\x00", lambda m: slots[int(m.group(1))], text)
    return text

def render(md):
    out, i, lines = [], 0, md.split("\n")
    n = len(lines)
    while i < n:
        ln = lines[i]

        if ln.startswith("```"):
            i += 1
            buf = []
            while i < n and not lines[i].startswith("```"):
                buf.append(lines[i]); i += 1
            i += 1
            out.append("<pre><code>" + _html.escape("\n".join(buf)) + "</code></pre>")
            continue

        if ln.lstrip().startswith(("<details", "</details", "<summary", "</summary")):
            out.append(ln); i += 1; continue

        m = re.match(r"^(#{1,6})\s+(.*)$", ln)
        if m:
            lvl = len(m.group(1))
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>"); i += 1; continue

        if re.match(r"^\s*([-*_])\1{2,}\s*$", ln):
            out.append("<hr>"); i += 1; continue

        if ln.startswith("|") and i + 1 < n and re.match(r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            def cells(r):
                return [c.strip() for c in r.strip().strip("|").split("|")]
            head = cells(ln); i += 2
            rows = []
            while i < n and lines[i].startswith("|"):
                rows.append(cells(lines[i])); i += 1
            t = ["<div class='scroller'><table><thead><tr>"]
            t += [f"<th>{inline(c)}</th>" for c in head]
            t.append("</tr></thead><tbody>")
            for r in rows:
                t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t)); continue

        if ln.startswith(">"):
            buf = []
            while i < n and lines[i].startswith(">"):
                buf.append(lines[i].lstrip(">").strip()); i += 1
            paras = "\n".join(buf).split("\n\n")
            body = "".join(f"<p>{inline(p.strip())}</p>" for p in paras if p.strip())
            out.append(f"<blockquote>{body}</blockquote>"); continue

        m = re.match(r"^(\s*)([-*+]|\d+\.)\s+(.*)$", ln)
        if m:
            ordered = bool(re.match(r"\d+\.", m.group(2)))
            tag = "ol" if ordered else "ul"
            items, base = [], len(m.group(1))
            while i < n:
                mm = re.match(r"^(\s*)([-*+]|\d+\.)\s+(.*)$", lines[i])
                if not mm or len(mm.group(1)) < base:
                    if lines[i].strip() == "" and i + 1 < n and re.match(r"^\s*([-*+]|\d+\.)\s+", lines[i + 1]):
                        i += 1; continue
                    break
                items.append(inline(mm.group(3))); i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{x}</li>" for x in items) + f"</{tag}>")
            continue

        if ln.strip() == "":
            i += 1; continue

        buf = []
        while i < n and lines[i].strip() and not re.match(
            r"^(#{1,6}\s|\||>|```|\s*([-*+]|\d+\.)\s|\s*([-*_])\3{2,}\s*$)", lines[i]
        ):
            buf.append(lines[i]); i += 1
        if buf:
            out.append(f"<p>{inline(' '.join(buf))}</p>")
        else:
            i += 1
    return "\n".join(out)

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>{css}</style></head><body><div class="wrap">
<nav class="top"><a href="/">&larr; study pack</a><span class="sep">/</span>
<span class="cur">{name}</span><span class="sep">/</span>
<a href="/{name}?raw=1">raw markdown</a></nav>
{body}
</div></body></html>"""

def make_handler(root):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def do_GET(self):
            path = self.path.split("?", 1)[0]
            raw = "raw=1" in self.path
            if path in ("/", "/index.html"):
                return super().do_GET()
            if path.endswith(".md"):
                f = root / path.lstrip("/")
                try:
                    f = f.resolve()
                    f.relative_to(root)
                except (OSError, ValueError):
                    self.send_error(403); return
                if not f.is_file():
                    self.send_error(404); return
                text = f.read_text()
                if raw:
                    body = text.encode()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/plain; charset=utf-8")
                else:
                    title = next((l[2:].strip() for l in text.split("\n") if l.startswith("# ")), f.name)
                    body = PAGE.format(title=_html.escape(title), css=CSS,
                                       name=f.name, body=render(text)).encode()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
                return
            return super().do_GET()

        def log_message(self, fmt, *args):
            sys.stderr.write("  %s\n" % (fmt % args))

    return Handler

def main():
    ap = argparse.ArgumentParser(description="Serve a study pack with .md rendered to HTML.")
    ap.add_argument("dir", nargs="?", default=".", help="study pack directory (default: cwd)")
    ap.add_argument("--port", "-p", type=int, default=8899,
                help="port (default: 8899; 0 lets the OS pick a free one)")
    args = ap.parse_args()

    root = Path(args.dir).resolve()
    if not root.is_dir():
        sys.exit(f"not a directory: {root}")
    if not (root / "index.html").is_file():
        print(f"warning: no index.html in {root} — / will show a file listing", file=sys.stderr)

    # Bind BEFORE announcing the URL. Printing first means that on a port
    # collision the user is handed a working URL served by somebody else's
    # process — which is far worse than an error, because it looks fine.
    try:
        httpd = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(root))
    except OSError as exc:
        if exc.errno == errno.EADDRINUSE:
            sys.exit(
                f"port {args.port} is already in use — something else is serving there.\n"
                f"  lsof -nP -iTCP:{args.port} -sTCP:LISTEN    # see what\n"
                f"  serve_study.py {args.dir} --port 0         # let the OS pick a free one"
            )
        raise

    port = httpd.server_address[1]
    print(f"{root.name} study pack → http://localhost:{port}/")
    print("Ctrl-C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
    finally:
        httpd.server_close()

if __name__ == "__main__":
    main()
