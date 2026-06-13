# My thoughts on top of the skills

*— brant. These are the opinions that drove `teach-plus`. The base `/teach` skill (by Anthropic, in `skills/teach/`) is a great scaffold; this file is what I'd tell anyone using it to generate lessons. They came out of one real session turning a pile of lecture slides into a study site, where the first drafts kept failing in the same ways.*

### 1. A teaching session is not a study session.
The agent's instinct is to test you. But you can't quiz someone on the Travelling Salesperson Problem if the lesson never said what TSP *is*. Teach the topic from zero first — define every term, show a tiny example — *then* test. "Explain → show → trace → test", never straight to the trace.

### 2. Don't say the name and hope.
"TSP", "the reduced cost matrix", "a multistage graph" — these are not explanations, they're labels. If the reader hasn't met the idea, a label teaches nothing. Spend the sentences. Define the jargon inline, the first time, every time.

### 3. Show what you cite.
The worst bug: a lesson that traces a 7×7 TSP and reads bounds off "Fig. 6-26" — when neither the matrix nor the figure is anywhere on the page. If a worked example needs data, the data has to be *on the page*: embed the matrix, draw the graph, show the figure. No orphan references.

### 4. Questions should teach, not just score.
A multiple-choice question with three joke answers measures nothing and teaches nothing. Make the stem self-contained (the numbers are *in* the question). Make at least half the questions ask you to *do* a step. And make every wrong option a real mistake people make — so that picking it, and reading why it's wrong, fixes something. The feedback is the lesson.

### 5. Never trust the extraction. Verify against the source.
Auto-extracted notes are full of mangled formulas, dropped tables, and confident guesses. Run a second pass that checks the notes against the original, with fresh eyes. Mark what's reconstructed (⚠️) vs confirmed (✅). And remember text extraction can't see diagrams — render the slides to images and actually *look* at them to recover the trees and graphs.

### 6. Make it nice, make it portable, make it reachable.
Dark mode that follows the phone. Letter-chip quizzes with instant feedback and a running score. Plain static files you can fork, run offline, or tunnel to your phone on the bus. Studying happens away from the desk; meet it there.

### 7. Keep the host machine clean.
Prefer userspace installs (`pip install --user`), say what you touched, and give the one-line undo. Nobody asked you to redecorate their global environment.

*If you only remember one thing: the lesson is for the learner who doesn't know yet — not the one who already does.*
