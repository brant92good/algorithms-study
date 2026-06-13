#!/usr/bin/env python3
"""Convert ./notes/*.md into ./notes-html/*.html using the shared site.css/site.js.
Run from the study-site root (the dir that holds notes/ and assets/). Needs: pip install --user markdown
Maps note filenames to nav titles via the NOTES dict below; unknown files fall back to their H1.
"""
import markdown, os, re, sys
ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.getcwd()
TITLES = {}  # optional {slug: "Nice Title"}; otherwise the first <h1>/<h2> is used
os.makedirs(f"{ROOT}/notes-html", exist_ok=True)
md = markdown.Markdown(extensions=["tables","fenced_code","sane_lists","toc","attr_list"])
PAGE = """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="../assets/site.css"><script src="../assets/site.js"></script></head><body>
<div class="topbar"><div class="inner"><a class="home" href="../index.html">📘 Study Hub</a>
<a class="crumb" href="../index.html#notes">Notes</a><span class="sp"></span>
<button class="themebtn" onclick="toggleTheme()" title="Toggle dark mode">◐</button></div></div>
<div class="wrap">{body}<hr><p class="lede">Questions on anything here? Ask your teacher.</p></div></body></html>"""
for fn in sorted(os.listdir(f"{ROOT}/notes")):
    if not fn.endswith(".md"): continue
    slug = fn[:-3]
    body = md.reset().convert(open(f"{ROOT}/notes/{fn}", encoding="utf-8").read())
    body = body.replace("<table>", '<div class="tablewrap"><table>').replace("</table>", "</table></div>")
    title = TITLES.get(slug) or (re.search(r"<h[12][^>]*>(.*?)</h[12]>", body) or [None, slug])[1]
    title = re.sub("<.*?>", "", title)
    open(f"{ROOT}/notes-html/{slug}.html", "w", encoding="utf-8").write(PAGE.format(title=title, body=body))
    print("wrote notes-html/%s.html" % slug)
