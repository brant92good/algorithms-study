# Algorithms — Study Hub

An interactive study site for an **Algorithms** course (design & analysis): finals lessons, an **Algorithm Zoo**, and source-verified chapter notes. Made to study from — on a laptop or a phone.

### 👉 Live: **https://brant92good.github.io/algorithms-study/**

No install. Open the link, pick a card. Dark mode follows your device (or tap ◐). Your quiz scores and "learned" ticks are saved in your browser.

## What's inside

- **10 finals lessons** (`lessons/`) — Searching Strategies, Branch-and-Bound, A\*, Backtracking, Prune-and-Search (selection & LP), Dynamic Programming (multistage / knapsack / LCS), and NP-Completeness (definitions + the reduction chain). Each one: explain the idea from zero → show a worked example → trace it yourself → two questions that teach.
- **🧬 Algorithm Zoo** (`algorithms/`) — 15 bite-size, one-algorithm sessions across five buckets (Divide & Conquer, Greedy, Dynamic Programming, Graph Traversal, Backtracking). Each has a **step-through animation**, two questions, and a "mark as learned" tick that fills a progress bar.
- **Chapter notes** (`notes-html/`) — detailed notes extracted from the lecture slides, **independently verified** against the source, with every figure recovered and validated. `⚠️` marks anything reconstructed; `✅` marks source-confirmed.
- **Glossary** (`reference/glossary.html`) — every key term, one line each.

## How it was built

This whole site was generated with [Claude Code](https://claude.com/claude-code) using a refined teaching skill. Two things are shared here so others can reuse the approach:

- **[`teach-skill.md`](teach-skill.md)** — a single-file teaching skill, refined from Anthropic's `/teach`, with four rules: *explain before you test · show what you cite · make questions teach · verify against the source.*
- **[`THOUGHTS.md`](THOUGHTS.md)** — the design opinions behind those rules.

To reuse the skill with Claude Code, drop `teach-skill.md` into `~/.claude/skills/teach/SKILL.md` and point it at your own course materials.

## Run it locally (optional)

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Re-render the notes after editing `notes/*.md`: `pip install --user markdown && python3 assets/build_notes.py`.

## Notes for classmates

These are a study aid, not a replacement for lecture. A few figures/numbers are flagged `⚠️` where the source slide was hard to read — double-check those against your own slides. Spot an error? Open an issue or a PR.

## Credits & license

Framework, lessons, and the Zoo are MIT-licensed (see [LICENSE](LICENSE)). The chapter content derives from the course textbook and lectures — see [ATTRIBUTION.md](ATTRIBUTION.md). Built by [@brant92good](https://github.com/brant92good).
