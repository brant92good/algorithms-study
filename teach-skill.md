---
name: teach
description: Teach a topic over multiple sessions by producing beautiful, self-contained interactive HTML lessons grounded in the learner's mission. A refinement of Anthropic's /teach skill, sharpened by four rules learned building this study site. Use when someone wants to learn a subject deeply, prep for an exam, or turn their own materials into a study site.
---

# teach (refined)

This is the [`/teach`](https://github.com/anthropics/claude-code) skill with four hard-won rules folded in. The base model is unchanged — a **stateful teaching workspace** in the current directory:

- `MISSION.md` — *why* the learner wants this; grounds every lesson.
- `./lessons/*.html` — the primary unit: one self-contained interactive HTML lesson each, `0001-…`.
- `./reference/*.html` — compressed, revisitable cheat-sheets; a **glossary** first.
- `./notes/*.md` (+ `./notes-html/`) — long-form notes distilled from source material.
- `./learning-records/*.md` — what the learner has grasped; drives the next session.
- `NOTES.md` — the learner's preferences.

The learning science is unchanged too: split **fluency strength** (in-the-moment recall) from **storage strength** (lasting retention), and build storage with **retrieval practice, spacing, and interleaving**. Gather knowledge from high-trust sources and cite liberally; never trust parametric knowledge.

What this refinement adds are four rules. Keep them in order — each is a failure mode to design against.

## Rule 1 — Explain before you test
A lesson is a *teaching* session, not a *study* session. You cannot write "trace the TSP" and hope the learner knows what TSP is. **Every lesson opens by explaining the topic from zero**, before any technique:
- **What is this?** Plain English, as if they've never heard the term. Define *every* jargon word on first use.
- **A tiny concrete example they can see** — three cities, a four-element set — with real small numbers.
- **The intuition** — one line on why it works, so it isn't a recipe memorised blind.

The arc of every lesson is **explain → show → trace → test**.

## Rule 2 — Show what you cite (no orphan references)
Never make the learning depend on data the page doesn't display. "Read the bound off Fig. 6-26", "reduce the 7×7 matrix" — useless if the figure and matrix aren't on the page. Embed the matrix as a table, the graph as an edge list, the figure as an `<img>`. A bare figure-number citation belongs only in "Go deeper", never in a trace.

## Rule 3 — Make the questions teach
Retrieval questions are where most learning happens, so they must teach, not quiz trivia:
- **Self-contained stems** — put the data *in the question*, never "the tree above".
- **Apply, don't recognise** — at least half of each lesson's questions make the learner *compute or apply a step*.
- **Every distractor is a real misconception** — the reversed reduction arrow, the off-by-one boundary. Picking a wrong option and reading the feedback should correct a *specific* error. Banned: nonsense/joke/"always-never" options.
- **Feedback teaches either way** — say why the right answer is right *and* name the trap behind the tempting wrong one. Spread the correct option across A–D; keep options the same shape.

## Rule 4 — Verify against the real source
Never trust a one-shot extraction. When teaching from the learner's materials:
- **Extract** the source (`olefile` for legacy `.ppt`; `pdftotext`/`pdftoppm` for PDF; LibreOffice `--headless --convert-to pdf` to render slides to images).
- **Verify** each generated note against the source with independent reviewer passes plus an orchestrator that reconciles findings — catch wrong numbers, missing topics, unflagged invention.
- **Recover figures visually** — text extraction misses diagrams; render slides to PNG and *read the images* to transcribe trees, graphs, matrices.
- **Flag honestly** — mark reconstructed content `⚠️` and source-confirmed content `✅`.

## The lesson, concretely
One self-contained HTML file per lesson. Carry a consistent house style and engine across all of them:
- **Beautiful, readable** (Tufte-ish serif), **dark mode** following the OS with a `◐` toggle (persisted) and a `?theme=dark|light` override.
- **Letter-chip multiple-choice** with instant feedback, a running **score pill**, and the `data-explain` teaching note shown after answering.
- **Mobile- and print-friendly.** Short — one tangible win per lesson, tied to the mission.

Build an `index.html` hub linking every lesson, note, and the glossary, plus a "how to study this" (retrieval/spacing/interleaving). Ship it as static files — portable, forkable, hostable on GitHub Pages.

For a worked example of everything above, see the study site this skill produced (the rest of this repository), and the maintainer's design notes in `THOUGHTS.md`.

## Everything else — inherited from /teach
Zone of Proximal Development, Knowledge gathering, Skills (tight feedback loops, desirable difficulty), Wisdom (delegate to real communities), and the workspace files all work exactly as in `/teach`. This refinement only changes *how good the lessons are*.
