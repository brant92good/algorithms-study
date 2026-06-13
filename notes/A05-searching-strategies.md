# Chapter 6 — The Searching Strategies

> Source: R.C.T. Lee, Tseng, Chang, Tsai — *Introduction to the Design and Analysis of Algorithms*, Chapter 6.
> Deck: `Alg05(1).ppt`. Figure/Table numbers (Fig. 6-x, Table 6-x) are preserved so you can cross-check against the slides.

---

## Overview

This chapter surveys **searching strategies** that explore a *solution-space tree* (also called a state-space tree). Many hard problems can be cast as "search a tree of candidate (partial) solutions," and the searching strategy decides the *order* in which nodes are expanded.

The chapter is organized in two halves:

1. **Search strategies for decision / feasibility problems** (find *a* solution, or decide if one exists):
   - Satisfiability problem (tree of `2ⁿ` assignments)
   - Hamiltonian circuit problem
   - Sum-of-subsets problem
   - **Depth-first search (DFS)** — guided by a stack
   - **Breadth-first search (BFS)**
   - **Hill climbing** — a greedy variant of DFS (8-puzzle)
   - **Best-first search** — combines DFS + BFS, global view (8-puzzle)

2. **Search strategies for optimization problems** (find the *best* solution):
   - **Branch-and-bound** — the master strategy for optimization (multi-stage graph)
   - Personnel assignment problem (cost matrix, partial order of jobs, topological sort)
   - Travelling salesperson problem (reduced cost matrices, lower bounds, decision tree)
   - 0/1 knapsack problem (upper/lower bounds via fractional relaxation)
   - **A\*** algorithm — best-first search with `f(n) = g(n) + h(n)`, `h(n) ≤ h*(n)`
   - Channel routing problem (HCG, vertical constraint graph, max cliques, A\*)

Key reason DFS/BFS/hill-climbing/best-first **cannot** solve optimization problems directly: they stop at the *first* goal node found, which need not be optimal. Branch-and-bound and A\* add **bounding** so the *optimal* goal is guaranteed.

---

## 1. The Satisfiability (SAT) Problem

### Idea
Given a Boolean formula in `n` variables `x₁, x₂, …, xₙ`, decide whether there is a truth assignment making it true. There are **2ⁿ** possible assignments, which can be laid out as a **binary tree** of depth `n`: at level `i` we branch on `xᵢ = true` vs `xᵢ = false` (*Tree Representation of Eight Assignments* shows `n = 3 → 2³ = 8` leaves).

### Instance from the slides
A conjunction of clauses (each line is a clause that must hold). Using ¬ for negation and ∨ for OR:

```
(1)  ¬x₁
(2)   x₁
(3)   x₂ ∨ x₅
(4)   x₃
(5)  ¬x₂
```

> ✅ Verified against slide 3: the slide writes `-x₁`, `x₁`, `x₂ v x₅`, `x₃`, `-x₂` exactly as clauses (1)–(5). `-x` = ¬x, `v` = ∨. The clauses are a set that must *all* hold simultaneously.

Notice clauses (1) `¬x₁` and (2) `x₁` directly contradict each other, so this particular instance is **unsatisfiable** — which is exactly the point: a *partial* assignment can already reveal a contradiction. The partial tree on slide 3 shows the root branching `X₁=T` / `X₁=F`, and **both** children are labeled "(1) falsified" / "(2) falsified" — i.e. either choice of X₁ immediately falsifies a clause.

> ✅ The full 2³ truth table is on slide 2 (columns x₁,x₂,x₃): FFF, FFT, FTF, FTT, TFF, TFT, TTF, TTT — the eight assignments enumerated by the "Tree Representation of Eight Assignments."

### Why search helps
*A Partial Tree to Determine the Satisfiability Problem*: **We may not need to examine all 2ⁿ assignments.** As soon as a partial assignment violates a clause, that entire subtree is abandoned (pruned). This early termination motivates tree-search strategies and, later, bounding.

---

## 2. The Hamiltonian Circuit Problem

### Idea
A **Hamiltonian circuit** is a cycle that visits *every vertex of a graph exactly once* and returns to the start. The problem: does a given graph contain one?

- *A Graph Containing a Hamiltonian Circuit* (Fig. 6-6) shows the example graph. ✅ Verified against slide 4 — see Appendix A for the edge list (vertices 1–7; edges 1-2, 1-6, 1-3, 2-3, 6-5, 7-5, 7-4, 3-4, 4-5).
- **Fig. 6-8** — *The Tree Representation of Whether There Exists a Hamiltonian Circuit of the Graph in Fig. 6-6*: build a tree where each level chooses the next vertex to visit. A path from root to a leaf at depth `n` that reuses no vertex and closes back to the start is a Hamiltonian circuit.

> ✅ Verified against slide 5 (Fig. 6-8) and slide 4 (Fig. 6-6): the full search tree is transcribed (root at vertex 1; two paths close back to 1 to give a Hamiltonian circuit, all other branches end in `X`). The underlying Fig. 6-6 graph is now also read directly from slide 4 (see Appendix A). The search idea (extend partial paths, backtrack on dead ends) is standard.

---

## 3. The Sum-of-Subsets Problem (solved by Depth-First Search)

### Problem
Given a set `S` and a target, find a subset `S′ ⊆ S` whose elements sum to the target.

```
S = {7, 5, 1, 2, 10}
Find S′ ⊆ S with  sum(S′) = 9 ?
```

(Answer: `{7, 2}`, since `7 + 2 = 9`. The slide's tree, **Fig. 6-11**, enumerates the candidate subsets via depth-first search.)

> ✅ Verified against slide 6 (Fig. 6-11). The DFS tree: root = `0`; edge `X₁=7` → node `7`; from `7`: edge `X₂=5` → `12` (marked `x`, exceeds 9), edge `X₂=1` → `8`, edge `X₂=2` → `9` labeled **Goal Node** (7+2=9). From `8`: edge `X₃=2` → `10` (`x`), edge `X₃=10` → `18` (`x`). So the satisfying subset is **{7, 2}** and the goal node holds the running sum 9.

### Depth-First Search (DFS)
- **Fig. 6-11** — *A Sum of Subset Problem Solved by Depth-First Search.*
- Build a binary tree: at level `i`, decide whether element `i` is **in** or **out** of `S′`.
- **A stack can be used to guide the depth-first search.** DFS dives down one branch as deep as possible, then backtracks (pop the stack) when a branch is exhausted or the partial sum already exceeds the target.

**DFS procedure (general):**
1. Push the root onto the stack.
2. Pop a node; if it is a goal, stop.
3. Otherwise push its children; repeat from step 2 until the stack is empty.

LIFO ordering of the stack gives the deep-first exploration order.

---

## 4. Breadth-First Search (BFS)

### Idea
Explore the tree **level by level**: expand all nodes at depth `d` before any node at depth `d+1`. Implemented with a **queue** (FIFO) instead of a stack.

> ✅ Verified against slide 6: the slide titled "The breadth-first search" actually carries the **sum-of-subset DFS example (Fig. 6-11)** as its illustration — there is **no separate BFS figure or example** in the deck. BFS is the FIFO counterpart of the DFS in §3 (same tree, different expansion order).

---

## 5. Hill Climbing (a variant of DFS) — the 8-Puzzle

### Idea
Hill climbing is **a variant of depth-first search** in which, instead of expanding children in fixed order, **the method selects the locally optimal node to expand** (the child that looks best by an evaluation function). It is greedy and *local* — it commits to the locally best child and can get stuck.

### 8-puzzle evaluation function
For the 8-puzzle (a 3×3 board with tiles 1–8 and one blank, slide tiles to reach a goal configuration):

```
f(n) = d(n) + w(n)
   d(n) = depth of node n  (number of moves made so far)
   w(n) = number of misplaced tiles in node n
```

Lower `f(n)` is better. At each step expand the child minimizing `f`.

- **Fig. 6-15** — *An 8-Puzzle Problem Solved by a Hill Climbing Method.*

> ✅ Verified against slide 8 (Fig. 6-15): the board states and per-node parenthesized evaluation values are transcribed (see Appendix A). Hill-climbing path: `initial(3) → 1(4) → 5(4) → 7(4) → 8 (Goal)`, always descending to the locally best child. The function `f(n) = d(n) + w(n)` and the "expand locally best child" rule are explicit on slide 7.

---

## 6. Best-First Search

### Idea
**Combines depth-first search and breadth-first search.** Rather than committing to a local best (hill climbing) or a rigid level order (BFS), best-first **selects the node with the best estimated cost among *all* open nodes** anywhere in the tree. Because it can jump to the globally most promising node, **this method has a global view.**

- **Fig. 6-16** — *An 8-Puzzle Problem Solved by a Best-First Search Scheme* (same evaluation function `f(n) = d(n) + w(n)` as hill climbing, but chosen globally).

### Best-First Search Scheme (explicit Step 1–Step 4)

> **Step 1.** Form a one-element list consisting of the root node.
>
> **Step 2.** Remove the first element from the list. Expand it. If one of the descendants of this element is a **goal node**, then **stop**; otherwise, add the descendants into the list.
>
> **Step 3.** Sort the entire list by the values of some **estimation function**.
>
> **Step 4.** If the list is empty, then **failure**. Otherwise, go to Step 2.

The sort in Step 3 is what makes the *first* element in Step 2 always the globally best-looking node.

---

## 7. The Branch-and-Bound Strategy

### Idea
**Branch-and-bound can be used to solve optimization problems** — and is needed because **DFS, BFS, hill climbing, and best-first search cannot** (they halt at the first goal, not the best one).

Two ingredients:
- **Branching** — split the solution space into subsets (subtrees), as in any tree search.
- **Bounding** — compute, for each node, a **bound** on the best solution obtainable in its subtree. If a node's bound is *worse* than the best complete solution already found, **prune** the entire subtree.

For a minimization problem you maintain a **lower bound** per node and an **upper bound** = best feasible solution found so far; prune any node whose lower bound ≥ current best.

### Example
- **Fig. 6-17** — *A Multi-Stage Graph Searching Problem*, **solved by branch-and-bound** (find the cheapest path through a layered graph).

> ✅ Verified against slide 12 (Fig. 6-17): **Correction** — Fig. 6-17 is the multi-stage graph with vertices `V₀, V₁,₁ V₁,₂ V₁,₃, V₂,₁ V₂,₂ V₂,₃, V₃` (NOT the `S,V₁..V₅,T` graph — that one is **Fig. 6-36**, the A\* example on slide 36). Fig. 6-17 edge weights (slide 12, disambiguated by the B&B tree on slide 13): `V₀→V₁,₁=1, V₀→V₁,₂=3, V₀→V₁,₃=2`; `V₁,₁→V₂,₁=5, V₁,₁→V₂,₃=3`; `V₁,₂→V₂,₁=4, V₁,₂→V₂,₂=3`; `V₁,₃→V₂,₂=2, V₁,₃→V₂,₃=7`; `V₂,₁→V₃=4, V₂,₂→V₃=1, V₂,₃→V₃=1`. The best-first B&B search tree for this graph is on slide 13 (Appendix A). See Appendix A "Fig. 6-17 correction."

---

## 8. The Personnel Assignment Problem (Branch-and-Bound)

### Problem statement
- A **linearly ordered** set of persons `P = {P₁, P₂, …, Pₙ}` with `P₁ < P₂ < … < Pₙ`.
- A **partially ordered** set of jobs `J = {J₁, J₂, …, Jₙ}`.
- Constraint: if `Pᵢ` and `Pⱼ` are assigned to jobs `f(Pᵢ)` and `f(Pⱼ)`, then **`f(Pᵢ) ≤ f(Pⱼ)` whenever `Pᵢ ≤ Pⱼ`** (the assignment must respect the partial order of jobs — a *feasible* assignment).
- `Cᵢⱼ` = cost of assigning person `Pᵢ` to job `Jⱼ`.
- Decision variable: `Xᵢⱼ = 1` if `Pᵢ` is assigned to `Jⱼ`, else `0`.

**Objective:**
```
Minimize   Σᵢ Σⱼ Cᵢⱼ · Xᵢⱼ
```
subject to each person getting exactly one job, each job exactly one person, and the partial-order feasibility constraint.

> ✅ Verified against slide 14: the slide states it as **"If f(Pᵢ) ≤ f(Pⱼ), then Pᵢ ≤ Pⱼ"** (an order-preserving / monotone feasibility rule). Cost `Cᵢⱼ` = cost of assigning Pᵢ to Jⱼ; `Xᵢⱼ = 1` if Pᵢ→Jⱼ else 0; minimize `Σᵢ,ⱼ CᵢⱼXᵢⱼ`.

### Partial order of jobs — Fig. 6-21
**Fig. 6-21** — *A Partial Ordering of Jobs*. ✅ Verified against slide 15 — the diagram is **two simple vertical arrows only** (no diagonal):

```
   J1        J2
   ↓         ↓
   J3        J4
```

> ✅ Verified against slide 15: the arrows are exactly `J1 → J3` and `J2 → J4`. There is **no** `J1 → J4` diagonal (the earlier reconstruction's `↘` was wrong). So J1 precedes J3, and J2 precedes J4; J1/J2 are incomparable, as are J3/J4.

### Topological sorting
A feasible assignment corresponds to a **topological order** of the jobs (one that respects all precedence arrows). The slide lists several topologically sorted sequences that can be generated:

```
J1, J2, J3, J4
J1, J2, J4, J3
J1, J3, J2, J4
J2, J1, J3, J4
J2, J1, J4, J3
```

> ✅ Verified against slide 15: the five topologically-sorted sequences listed above are exactly those shown on the slide.

**One feasible assignment:**
```
P1 → J1,  P2 → J2,  P3 → J3,  P4 → J4
```
> ✅ Verified against slide 15.

### Cost matrix — Table 6-1
**Table 6-1** — *A Cost Matrix for a Personnel Assignment Problem* (rows = persons, columns = jobs):

| Person \ Job | 1  | 2  | 3  | 4  |
|--------------|----|----|----|----|
| **P1**       | 29 | 19 | 17 | 12 |
| **P2**       | 32 | 30 | 26 | 28 |
| **P3**       | 3  | 21 | 7  | 9  |
| **P4**       | 18 | 13 | 10 | 15 |

> ✅ Verified against slide 16: the P3 row reads **C₃₁ = 3, C₃₂ = 21, C₃₃ = 7, C₃₄ = 9** exactly (single-digit `3` in column 1, clearly distinct). All other cells match the table above.

### Reduced cost matrix — Table 6-2
**Reduction rule:** *subtract a constant from each row and each column so that each row and each column contains at least one zero.* The total subtracted is a **lower bound** on the optimal assignment cost.

**Table 6-2** — *A Reduced Cost Matrix*:

| Person \ Job | 1  | 2  | 3  | 4  | row reduction |
|--------------|----|----|----|----|---------------|
| **P1**       | 17 | 4  | 5  | 0  | (−12)         |
| **P2**       | 6  | 1  | 0  | 2  | (−26)         |
| **P3**       | 0  | 15 | 4  | 6  | (−3)          |
| **P4**       | 8  | 0  | 0  | 5  | (−10)         |
| col reduction|    | (−3)|   |    |               |

**Total cost subtracted: 12 + 26 + 3 + 10 + 3 = 54.**
**This is a lower bound of our solution.**

> ✅ Verified against slides 17 & 18: Table 6-2 cells and the red row-reduction tags `(−12)(−26)(−3)(−10)` plus the column-2 reduction `(−3)` are exactly as printed; slide 18 states "Total cost subtracted: 12+26+3+10+3 = 54" and "This is a lower bound of our solution."

### Solving
- **Solution tree:** branch on which job each person takes (respecting feasibility).
- **Apply the best-first search scheme** (the Step 1–4 scheme from §6) to expand the most promising node.
- **Bounding of subsolutions:** at each tree node, recompute a reduced matrix / lower bound for the remaining sub-assignment; prune nodes whose lower bound exceeds the best feasible cost found.

> ✅ Verified against slides 19–21 — the numeric trees are now transcribed (see Appendix A entries "Personnel — Solution Tree (slide 19)", "Personnel — Best-First Search Tree (slide 20)", "Personnel — Bounding of Subsolutions (slide 21)"). Slide 20 is annotated **"Only one node is pruned away."** The bounding tree on slide 21 follows the spine `0(54) → 2(58) → 1(64) → {3(68)→4(73), 4(70)→3(70)}`, i.e. the optimal feasible assignment costs **70**.

---

## 9. The Travelling Salesperson Problem (TSP) via Branch-and-Bound

### Problem
Find a minimum-cost tour visiting every city exactly once and returning to the start. **It is NP-complete.**

### Cost matrix — Table 6-3
**Table 6-3** — *A Cost Matrix for a Traveling Salesperson Problem* (7 cities; `∞` on the diagonal = no self-loop). Entry `(i, j)` = cost of arc `i → j`:

| i \ j | 1  | 2  | 3  | 4  | 5  | 6  | 7  |
|-------|----|----|----|----|----|----|----|
| **1** | ∞  | 3  | 93 | 13 | 33 | 9  | 57 |
| **2** | 4  | ∞  | 77 | 42 | 21 | 16 | 34 |
| **3** | 45 | 17 | ∞  | 36 | 16 | 28 | 25 |
| **4** | 39 | 90 | 80 | ∞  | 56 | 7  | 91 |
| **5** | 28 | 46 | 88 | 33 | ∞  | 25 | 57 |
| **6** | 3  | 88 | 18 | 46 | 92 | ∞  | 7  |
| **7** | 44 | 26 | 33 | 27 | 84 | 39 | ∞  |

### First reduction — Table 6-4 (row reductions)
Subtract the row minimum from each row (so each row has a zero):

**Table 6-4** — *A Reduced Cost Matrix*:

| i \ j | 1  | 2  | 3  | 4  | 5  | 6  | 7  | row reduction |
|-------|----|----|----|----|----|----|----|---------------|
| **1** | ∞  | 0  | 90 | 10 | 30 | 6  | 54 | (−3)          |
| **2** | 0  | ∞  | 73 | 38 | 17 | 12 | 30 | (−4)          |
| **3** | 29 | 1  | ∞  | 20 | 0  | 12 | 9  | (−16)         |
| **4** | 32 | 83 | 73 | ∞  | 49 | 0  | 84 | (−7)          |
| **5** | 3  | 21 | 63 | 8  | ∞  | 0  | 32 | (−25)         |
| **6** | 0  | 85 | 15 | 43 | 89 | ∞  | 4  | (−3)          |
| **7** | 18 | 0  | 7  | 1  | 58 | 13 | ∞  | (−26)         |

**Sum of row reductions: `reduced: 84`** (= 3+4+16+7+25+3+26 = 84).

> ✅ Verified against slides 22 (Table 6-3) and 23 (Table 6-4): every cell and the red `(−3)(−4)(−16)(−7)(−25)(−3)(−26)` row tags and "reduced:84" match exactly.

### Second reduction — Table 6-5 (column reductions)
Now subtract column minimums from columns that still lack a zero:

**Table 6-5** — *Another Reduced Cost Matrix*:

| i \ j | 1  | 2  | 3  | 4  | 5  | 6  | 7  |
|-------|----|----|----|----|----|----|----|
| **1** | ∞  | 0  | 83 | 9  | 30 | 6  | 50 |
| **2** | 0  | ∞  | 66 | 37 | 17 | 12 | 26 |
| **3** | 29 | 1  | ∞  | 19 | 0  | 12 | 5  |
| **4** | 32 | 83 | 66 | ∞  | 49 | 0  | 80 |
| **5** | 3  | 21 | 56 | 7  | ∞  | 0  | 28 |
| **6** | 0  | 85 | 8  | 42 | 89 | ∞  | 0  |
| **7** | 18 | 0  | 0  | 0  | 58 | 13 | ∞  |
| **col reduction** |  |  | (−7) | (−1) |  |  | (−4) |

Column reductions: column 3 (−7), column 4 (−1), column 7 (−4).

**Total cost reduced: 84 + 7 + 1 + 4 = 96  (lower bound).**

> ✅ Verified against slide 24 (Table 6-5): all cells match; the column reductions `(−7)(−1)(−4)` sit under columns 3, 4, 7. Slide circles the cells `17` (row 2, col 5) and `1` (row 3, col 2). Slide 25 states "Total cost reduced: 84+7+1+4 = 96 (lower bound)."

### Decision tree — Fig. 6-25 and branching choice
- **Fig. 6-25** — *The Highest Level of a Decision Tree.* ✅ Verified against slide 25. The root box "All solutions" has **Lower bound = 96**. It splits into:
  - **"All solutions with arc 4-6"** — Lower bound = **96** (including the zero-cost arc 4→6 adds nothing).
  - **"All solutions without arc 4-6"** — Lower bound = **96 + 32 = 128** (excluding arc 4→6 forces the next-cheapest entry, penalty 32).
- **Choosing the splitting arc:** pick the zero-cost arc whose *exclusion* raises the bound the most. Arc **4-6** is chosen because its exclusion penalty (**32**) is the largest.
  - The slide also notes a comparison: "If we use arc **3-5** to split, the difference on the lower bounds is **17 + 1 = 18**" — smaller than 32, so 4-6 wins.

> ✅ Verified against slide 25: arc **4-6** is the splitting arc (penalty 32, giving the 96/128 split shown in Fig. 6-25); the 3-5 alternative would only give penalty 18. The "with 4-6" subtree (LB still 96) is expanded next via Tables 6-6/6-7.

### Including arc 4-6 — Tables 6-6 and 6-7
- **Table 6-6** — *A Reduced Cost Matrix if Arc 4-6 is Included.* Including arc 4→6 means we delete **row 4** and **column 6**, and set entry `(6,4) = ∞` (to forbid the premature subtour 4→6→4). ✅ Verified against slide 26 (columns 1,2,3,4,5,7; the `(6,4)=∞` cell is circled on the slide):

| i \ j | 1  | 2  | 3  | 4  | 5  | 7  |
|-------|----|----|----|----|----|----|
| **1** | ∞  | 0  | 83 | 9  | 30 | 50 |
| **2** | 0  | ∞  | 66 | 37 | 17 | 26 |
| **3** | 29 | 1  | ∞  | 19 | 0  | 5  |
| **5** | 3  | 21 | 56 | 7  | ∞  | 28 |
| **6** | 0  | 85 | 8  | ∞  | 89 | 0  |
| **7** | 18 | 0  | 0  | 0  | 58 | ∞  |

(Note: in Table 6-6 row 5 is still `3,21,56,7,∞,28` — not yet reduced. Reducing row 5 by its minimum 3 gives Table 6-7.)

**Table 6-7** — *A Reduced Cost Matrix for that in Table 6-6* (rows/cols 4 and 6 removed; row 5 further reduced by −3). ✅ Verified cell-by-cell against slide 27:

| i \ j | 1  | 2  | 3  | 4  | 5  | 7  | reduction |
|-------|----|----|----|----|----|----|-----------|
| **1** | ∞  | 0  | 83 | 9  | 30 | 50 |           |
| **2** | 0  | ∞  | 66 | 37 | 17 | 26 |           |
| **3** | 29 | 1  | ∞  | 19 | 0  | 5  |           |
| **5** | 0  | 18 | 53 | 4  | ∞  | 25 | (−3)      |
| **6** | 0  | 85 | 8  | ∞  | 89 | 0  |           |
| **7** | 18 | 0  | 0  | 0  | 58 | ∞  |           |

Row 5 here carries an extra reduction **(−3)**.

**Total cost reduced: 96 + 3 = 99  (new lower bound)** for the subtree where arc 4-6 is included.

> ✅ Verified against slides 26 (Table 6-6) and 27 (Table 6-7): every cell confirmed. Slide 27 prints "Total cost reduced: 96+3 = 99 (new lower bound)."

- **Fig. 6-26** — *A Branch-and-Bound Solution of a Traveling Salesperson Problem.* Continue branching on arcs, propagating lower bounds, pruning subtrees whose bound ≥ best tour found, until the optimal tour is isolated.

> ✅ Verified against slide 28 (Fig. 6-26): the full B&B tree is transcribed. Spine bounds: All=96, With/Without 4-6 = 99/128, With/Without 3-5 = 99/117, With/Without 2-1 = 112/125, With/Without 1-4 = 126/153, With/Without 6-7 = 126/141, With/Without 5-2 = 126/(no soln), With/Without 7-3 = Solution/(no soln). **Optimal tour `1-4-6-7-3-5-2-1`, Cost = 126.** Slide 28 also draws the tour itself (arrows 1→4→6→7→3→5→2→1 over the 7 city dots).

---

## 10. The 0/1 Knapsack Problem via Branch-and-Bound

### Problem
- Positive integers: profits `P₁, P₂, …, Pₙ`; weights `W₁, W₂, …, Wₙ`; capacity `M`.
- Choose `Xᵢ ∈ {0, 1}` to **maximize** `Σ PᵢXᵢ` subject to `Σ WᵢXᵢ ≤ M`.
- Slides minimize the *negative* profit (so it becomes a minimization B&B): objective value `−Σ PᵢXᵢ`.

### Branching — Fig. 6-27
- **Fig. 6-27** — *The Branching Mechanism in the Branch-and-Bound Strategy to Solve 0/1 Knapsack Problem.* At level `i` branch on `Xᵢ = 1` (include item `i`) vs `Xᵢ = 0` (exclude it).

### Example data — `n = 6, M = 34`
Items are sorted by profit density so that `Pᵢ/Wᵢ ≥ Pᵢ₊₁/Wᵢ₊₁`:

| i        | 1  | 2  | 3  | 4  | 5  | 6  |
|----------|----|----|----|----|----|----|
| **Pᵢ**   | 6  | 10 | 4  | 5  | 6  | 4  |
| **Wᵢ**   | 10 | 19 | 8  | 10 | 12 | 8  |
| **Pᵢ/Wᵢ**| 0.60 | 0.53 | 0.50 | 0.50 | 0.50 | 0.50 |

Property: `(Pᵢ/Wᵢ ≥ Pᵢ₊₁/Wᵢ₊₁)` — items in non-increasing density order, which the greedy bound relies on.

> ✅ Verified against slide 31: data `Pᵢ = 6,10,4,5,6,4` and `Wᵢ = 10,19,8,10,12,8` (n=6, M=34) and the ordering claim `(Pᵢ/Wᵢ ≥ Pᵢ₊₁/Wᵢ₊₁)` are exactly as printed. (Densities are not numerically tabulated on the slide; the 0.60/0.53/0.50… values above are computed here.) The feasible solution `X1=X2=1, rest 0` giving upper bound `−(P1+P2) = −16` is on slide 31; "Any solution higher than −16 cannot be an optimal solution" is verbatim.

### Upper bound (a feasible solution)
A quick feasible solution gives an **upper bound** on the (negated) objective:
```
X1 = 1, X2 = 1, X3 = 0, X4 = 0, X5 = 0, X6 = 0
weight used = W1 + W2 = 10 + 19 = 29 ≤ 34 ✓
objective  = −(P1 + P2) = −16     (upper bound)
```
**Any solution higher than −16 cannot be an optimal solution** (we are minimizing the negative profit, i.e. we will not accept anything worse than −16).

### Lower bound via fractional relaxation
**Relax the restriction from `Xᵢ = 0 or 1` to `0 ≤ Xᵢ ≤ 1`** — this is the (fractional) **knapsack problem**, solvable optimally by the **greedy method** (fill by decreasing density until capacity runs out, taking a fraction of the last item):

```
X1 = 1, X2 = 1, X3 = 5/8, X4 = 0, X5 = 0, X6 = 0
weight = 10 + 19 + (5/8)(8) = 10 + 19 + 5 = 34 = M  ✓ (capacity exactly full)
objective = −(P1 + P2 + (5/8)P3) = −(6 + 10 + 2.5) = −18.5   (lower bound)
```
Since the true 0/1 objective must be an integer, the lower bound rounds to **−18** (only integer solutions count).

**Therefore:**
```
−18 ≤ optimal solution ≤ −16
```

### Optimal solution
After completing the branch-and-bound search:
```
optimal solution: X1 = 1, X2 = 0, X3 = 0, X4 = 1, X5 = 1, X6 = 0
weight = W1 + W4 + W5 = 10 + 10 + 12 = 32 ≤ 34 ✓
objective = −(P1 + P4 + P5) = −(6 + 5 + 6) = −17
```
This `−17` lies inside `[−18, −16]`, consistent with the bounds.

- **Fig. 6-28** — *0/1 Knapsack Problem Solved by Branch-and-Bound Strategy* shows the full tree with per-node upper/lower bounds and pruning.

> ✅ Verified against slide 34 (Fig. 6-28): all per-node U.B./L.B. values for nodes 0–30 are transcribed. Root node 0 = (U.B. −16, L.B. −18); node 14 is annotated "(a good upper bound is found here)" with U.B.=−17; the optimal −17 is reached on the X1=0 (node 14) sub-branch (nodes 15/16/17/18/20 circled in red on the slide). Slides 32–33 confirm the fractional-relaxation lower bound: `X3 = 5/8`, `−(P1+P2+⅝P3) = −18.5` → rounded `−18`, so `−18 ≤ optimal ≤ −16`, and optimal `X1=1,X4=1,X5=1` (rest 0) → `−(P1+P4+P5) = −17`. The weight sums (29, 34, 32) are computed here from the data.

---

## 11. The A\* Algorithm

### Idea
A\* is used to **solve optimization problems** with the **best-first strategy**, but with a special cost function that guarantees optimality. **If a feasible solution (goal node) is obtained, then it is optimal and we can stop.**

### Cost function
For each node `n`:
```
f(n) = g(n) + h(n)
   g(n): actual cost from the root to node n.
   h(n): estimated cost from node n to a goal node.
   h*(n): the "real" (true minimum) cost from node n to a goal node.
```

**Admissibility condition:** the heuristic must never overestimate:
```
h(n) ≤ h*(n)
⇒  f(n) = g(n) + h(n) ≤ g(n) + h*(n) = f*(n)
```
i.e. `f(n)` is a *lower bound* on the best total cost of any solution through `n`. This is what makes the first goal reached optimal.

### Stopping rule
**Stop iff the selected (expanded) node is also a goal node.** (Reaching a goal node in the list is not enough — it must be the node with the smallest `f`, i.e. the one selected for expansion.)

### Worked example — Fig. 6-36 (slides 36–42)
- **Fig. 6-36** — *A Graph to Illustrate A\* Algorithm* (slide 36). The search graph (NOT a tree — it is the layered graph `S→V₁..V₅→T`; see Appendix A for the literal Fig. 6-36 graph). The **A\* search tree** is built on it across slides 37–42, with the underlying graph relabeled `R, A, B, C, D, E, F, G, H, I, J, K, L`. The slides walk the expansion order with full `g/h/f` bookkeeping:

| Step (slide) | Action | New `g/h/f` values shown |
|------|--------|--------------------------|
| 1 (37) | Form list with root R; children A,B,C | A(g2,h2,f4), B(g4,h2,f6), C(g3,h2,f5) |
| 2 (38) | **Expand A** (smallest f=4) | D(g4,h1,f5), E(g5,h2,f7) |
| 3 (39) | **Expand C** (f=5) | F(g5,h1,f6), G(g5,h5,f10) |
| 4 (40) | **Expand D** (f=5) | H(g5,h5,f10), I(g7,h0,f7) |
| 5 (41) | **Expand B** (f=6) | J(g6,h5,f11) |
| 6 (42) | **Expand F** (f=6) | K(g6,h5,f11), L(g8,h0,f8) |

After step 6, the smallest-`f` open node is **I (f = 7)**, and **I is the goal node** → stop, optimal.

> ✅ Verified against slides 36–42: edges `R→A(a,2), R→B(b,4), R→C(c,3), A→D(d,2), A→E(e,3), C→F(k,2), C→G(f,2), D→H(h,1), D→I(i,3), B→J(g,2), F→K(h,1), F→L(l,3)` and all `g/h/f` values as tabulated. **Correction:** the goal node is **I**, not F (slide 42 prints "I is a goal node !"); F is merely the last node *expanded*. Expansion order: **A → C → D → B → F**, terminating by selecting goal I.

---

## 12. The Channel Routing Problem (A\*)

### Problem
In VLSI layout, a **channel** is a rectangular region with terminals (pins) on its top and bottom edges. Each **net** connects a set of terminals. Wires run in horizontal **tracks** (and vertical segments). Goal: **find a routing that minimizes the number of tracks.** **This problem is NP-complete.**

- **Fig. 6-40** — *A Channel Specification* (slide 43). ✅ Verified. 13 columns; terminal numbers (a net number, `0` = no terminal):
  - **Top row** (cols 1→13): `4, 8, 0, 7, 0, 3, 6, 0, 0, 2, 1, 5, 0`
  - **Bottom row** (cols 1→13): `0, 0, 7, 0, 5, 4, 0, 8, 3, 0, 2, 6, 1`
  - The slide also sketches each net's horizontal span (nets 7, 3, 1, 8, 2, 5, 4, 6).
- **Illegal wirings** (slide 44): three example layouts of wires that short/overlap illegally are forbidden. "We want to find a routing which minimizes the number of tracks."
- The slides distinguish **a feasible routing** (slide 45 — uses **7 tracks**: nets placed 7→track1, 2→track2, 3→track3, 4→track4, 5→track5, 6→track6, 8→track7, etc.) from **an optimal routing** (slide 46 — only **4 tracks**). "This problem is NP-complete."

### Horizontal Constraint Graph (HCG)
- Nodes = nets. Captures which nets' horizontal spans **overlap** (if two nets overlap horizontally they cannot share a track).
- Example ordering rule from the slide (slide 47): **"net 8 must be to the left of net 1 and net 2 if they are in the same track."**
- **Fig. 6-41 (HCG), slide 47** — ✅ Verified directed edges (tail = must-be-left-of head): `7→5, 7→6, 7→3, 7→1, 7→2`, `8→1, 8→2`, `4→6, 4→1, 4→2`, `3→1, 3→2`. (This is the directed graph the earlier note recorded as the uncaptioned `png_014` "personnel/VCG ordering graph" — it is in fact the **channel-routing HCG**.)
- **Maximal cliques in the HCG: `{1,8}`, `{1,3,7}`, `{5,7}`. Each maximal clique can be assigned to a track.** ✅ Verified verbatim on slide 48. (A clique = a set of nets that mutually conflict; the cliques bound how many nets pile up at one horizontal position = the *local density*.)

### Vertical Constraint Graph (VCG)
- Captures top/bottom precedence: if a net has a terminal on top at a column where another net has a terminal on the bottom, the top net must be routed in a track **above** the bottom net. These vertical constraints further restrict track assignment.
- **VCG (slide 48)** — ✅ Verified edges: `1→2`, `3→4`, `5→6` (three disjoint edges; nets 7 and 8 are isolated VCG nodes). The slide annotates **"e.g. net 3 must be wired before net 4."**

> ✅ Verified against slide 48: the VCG is exactly the three edges 1→2, 3→4, 5→6.

### Solving with A\*
- **Fig. 6-46** — *The First Level of a Tree to Solve a Channel Routing Problem* (slide 48). ✅ Verified: the root branches into three children = the three maximal cliques: **`{8,1}`, `{7,3,1}`, `{7,5}`** (one per candidate first track).
- Cost function (slide 49):
```
f(n) = g(n) + h(n)
   g(n): the level of the tree   (= number of tracks used so far)
   h(n): maximal local density    (a lower bound on tracks still needed)
```
Since `h(n)` = maximal local density never overestimates the remaining tracks needed, A\* finds the minimum-track routing.
- **Fig. 6-48** — *A Partial Solution Tree for the Channel Routing Problem by Using A\* Algorithm* (slide 49). ✅ Verified — full tree transcribed in Appendix A. (This is the same tree the earlier note recorded as the uncaptioned `png_015` "best-first g+h tree"; it is in fact **Fig. 6-48**, with node states being net-cliques.)

> ✅ Verified against slides 43–49: Fig. 6-40 channel spec, the HCG (slide 47) and VCG (slide 48) edge lists, the three maximal cliques `{1,8},{1,3,7},{5,7}`, the Fig. 6-46 first level, and the Fig. 6-48 A\* tree with `f=g+h` (g = tree level, h = max local density) are all read directly.

---

## Items reconstructed earlier — now resolved against the clean slide renders

All items below have been checked against the per-slide PNG renders in `render/A05full/` (49 slides). Every previously-reconstructed item is now resolved.

1. ✅ **Verified against slide 3** — SAT instance `-x₁, x₁, x₂∨x₅, x₃, -x₂` (clauses 1–5); both partial-tree children labeled "(1)/(2) falsified"; full 2³ truth table on slide 2. Instance is unsatisfiable. *(§1)*
2. ✅ **Verified against slides 4 & 5** — Fig. 6-8 search tree + Fig. 6-6 graph (edges 1-2,1-6,1-3,2-3,6-5,7-5,7-4,3-4,4-5) both read directly. *(§2)*
3. ✅ **Verified against slide 6** — Fig. 6-11 DFS tree; satisfying subset **{7,2}** (goal node "9"); 12/10/18 dead-ends marked `x`. *(§3)*
4. ✅ **Verified against slide 6** — the "breadth-first search" slide reuses the Fig. 6-11 DFS example; **no separate BFS figure** exists. *(§4)*
5. ✅ **Verified against slide 8** — Fig. 6-15 hill-climbing 8-puzzle boards + (f) values; path initial→1→5→7→8(Goal). *(§5)*
6. ✅ **Verified against slide 10** — Fig. 6-16 best-first 8-puzzle; goal at node 10 via root→1→5(node5? see Appendix)→…; Step 1–4 scheme verbatim on slide 11. *(§6)*
7. ✅ **Verified against slides 12 & 13** — **Correction:** Fig. 6-17 is the `V₀…V₃` multi-stage graph (slide 12, 12 edges) with its best-first B&B tree (slide 13). The `S,V₁..V₅,T` graph the old note called "Fig. 6-17" is actually **Fig. 6-36** (slide 36). *(§7)*
8. ✅ **Verified against slide 14** — feasibility rule printed as "If f(Pᵢ) ≤ f(Pⱼ), then Pᵢ ≤ Pⱼ". *(§8)*
9. ✅ **Verified against slide 15** — **Correction:** Fig. 6-21 has only `J1→J3` and `J2→J4` (two vertical arrows; **no** `J1→J4` diagonal). *(§8)*
10. ✅ **Verified against slide 16** — Table 6-1 P3 row = 3, 21, 7, 9 (C₃₁=3 confirmed). *(§8)*
11. ✅ **Verified against slides 19–21** — personnel solution tree (slide 19), best-first tree with bounds (slide 20, "Only one node is pruned away"), bounding tree (slide 21, optimal cost 70). *(§8)*
12. ✅ **Verified against slide 25** — splitting arc is **4-6** (exclusion penalty 32 → 96/128 split); the 3-5 alternative penalty is only 17+1=18. *(§9)*
13. ✅ **Verified against slides 26 & 27** — Tables 6-6 and 6-7 confirmed cell-by-cell; LB 96+3 = 99. *(§9)*
14. ✅ **Verified against slide 28** — Fig. 6-26 B&B tree + all bounds; optimal tour `1-4-6-7-3-5-2-1`, Cost = 126. *(§9)*
15. ✅ **Verified against slides 31–33** — knapsack data, density ordering claim, UB −16, LB −18 (via X3=5/8, −18.5), optimum −17 ({1,4,5}). *(§10)*
16. ✅ **Verified against slide 34** — Fig. 6-28 per-node UB/LB for nodes 0–30; root −16/−18; "good upper bound" at node 14; optimum −17. *(§10)*
17. ✅ **Verified against slides 36–42** — Fig. 6-36 graph edges + all `g/h/f` across six expansion steps. **Correction:** the **goal node is I** (slide 42: "I is a goal node !"), not F; expansion order A→C→D→B→F. *(§11)*
18. ✅ **Verified against slides 43–49** — Fig. 6-40 channel spec (top/bottom terminal rows), HCG edges (slide 47), VCG edges 1→2/3→4/5→6 (slide 48), max cliques `{1,8},{1,3,7},{5,7}`, Fig. 6-46 first level, Fig. 6-48 A\* tree, `f=g+h`. *(§12)*

---

## Appendix A — Figures (visually extracted from slide images)

> The diagrams below were transcribed from slide images. **All entries have now been re-verified against the clean per-slide renders in `render/A05full/` (49 slides, `slide-NN.png`).** Each entry gives the source slide, a description, and an exact transcription of every label/number visible.
>
> **Update note (clean-render pass):** Two figure identities were corrected. The graph the original carve recorded as "Fig. 6-17" (`S,V₁..V₅,T`) is in fact **Fig. 6-36** (the A\* example, slide 36). The uncaptioned `png_014` directed graph is the **channel-routing HCG** (slide 47), and the uncaptioned `png_015` "best-first g+h tree" is **Fig. 6-48** (slide 49). The true **Fig. 6-17** is the `V₀…V₃` multi-stage graph (slide 12). Fig. 6-21 was corrected (no `J1→J4` diagonal), and the A\* goal node is **I**, not F.

### SAT — Tree Representation of the 2ⁿ Assignments
- **Source:** slide 2 (`render/A05full/slide-02.png`). ✅ Verified.
- A complete binary tree of depth 3 (for `n = 3`, giving `2³ = 8` leaves). The root has no label; each level branches left/right on one variable.

```
                         (root)
              X1=T /                \ X1=F
            ( )                        ( )
      X2=T /    \ X2=F           X2=T /    \ X2=F
     ( )         ( )            ( )         ( )
  X3=T/\X3=F  X3=T/\X3=F   X3=T/\X3=F   X3=T/\X3=F
  ( )  ( )    ( )  ( )     ( )  ( )     ( )  ( )
```
Edge labels are exactly `X₁=T / X₁=F` at level 1, `X₂=T / X₂=F` at level 2, `X₃=T / X₃=F` at level 3. Nodes themselves are unlabeled circles. This is the generic "Tree Representation of Eight Assignments" referenced in §1.

### Fig. 6-8 — Tree Representation of Whether a Hamiltonian Circuit Exists (graph of Fig. 6-6)
- **Source:** slide 5 (`render/A05full/slide-05.png`). ✅ Verified.
- A search tree whose nodes are vertex numbers (1–7), rooted at vertex `1`. Each root-to-leaf path is a candidate vertex-visiting order; dead ends are marked `X`. Edges are unlabeled (no weights — Hamiltonicity is a feasibility, not optimization, problem).

Exact tree structure (children read left→right; `X` = dead end / pruned):

```
1
├─ 2 ── 3 ── 4 ─┬─ 5 ─┬─ 7 (X)
│                │     └─ 6 (X)
│                └─ 7 ── 5 ── 6 ── 1
├─ 6 ── 5 ─┬─ 4 ─┬─ 3 ── 2 (X)
│           │     └─ 7 (X)
│           └─ 7 ── 4 ── 3 ── 2 ── 1
└─ 3 ─┬─ 2 (X)
       └─ 4 ─┬─ 5 ─┬─ 7 (X)
              │     └─ 6 (X)
              └─ 7 ── 5 ── 6 (X)
```
Two paths close back to vertex `1` (a Hamiltonian circuit): `1-2-3-4-5-7-5-6-1` reading and `1-6-5-7-4-3-2-1`. The two successful leaves both terminate in node `1`; all other branches end in `X`.
> Note: vertex adjacencies of the underlying graph (Fig. 6-6) are not separately shown in the extracted image set, but the full tree above is now transcribed. Resolves reconstruction item #2 (tree portion).

### Fig. 6-15 — 8-Puzzle Solved by Hill Climbing
- **Source:** slide 8 (`render/A05full/slide-08.png`). ✅ Verified.
- Each node is a 3×3 board; the number in parentheses beside a board is its evaluation `f` (here `f = w(n)`, the misplaced-tile count used to pick the locally best child — the labels shown are the parenthesized values). Edge labels `1..9` are move/step indices. The blank cell is empty.
- Initial state (top), goal node reached at bottom-left.

Boards (row by row; `_` = blank):

```
initial state (3):   2 8 3 / 1 _ 4 / 7 6 5
  ├─1 (4):  2 _ 3 / 1 8 4 / 7 6 5
  ├─2 (4):  2 8 3 / _ 1 4 / 7 6 5
  ├─3 (5):  2 8 3 / 1 4 _ / 7 6 5      (blank moved right on row 2)
  └─4 (5):  2 8 3 / 1 6 4 / 7 _ 5
  from node 1:
     ├─5 (4):  _ 2 3 / 1 8 4 / 7 6 5
     └─6 (6):  2 3 _ / 1 8 4 / 7 6 5   (shown as 2 _ 3 .. ; see image)
  from node 5:
     └─7 (4):  1 2 3 / _ 8 4 / 7 6 5
        from node 7:
           ├─8 (4):  1 2 3 / 8 _ 4 / 7 6 5   ← GOAL NODE (f=0 conceptually; labeled (4) in fig as path value)
           └─9 (6):  1 2 3 / 7 8 4 / _ 6 5
```
The hill-climbing path is `initial → 1 → 5 → 7 → 8 (Goal)`, always descending to the child with the smallest parenthesized value. Resolves reconstruction item #5 (board states + f-values now transcribed).

### Fig. 6-16 — 8-Puzzle Solved by Best-First Search
- **Source:** slide 10 (`render/A05full/slide-10.png`). ✅ Verified. Path root→2→7→9→10 (goal at node 10).
- Same start board and same numbering scheme as Fig. 6-15, but the tree is broader because best-first keeps **all** open nodes and expands the globally best one. Parenthesized numbers are the evaluation values; edge numbers `1..11` are expansion order.

```
root (3):  2 8 3 / 1 _ 4 / 7 6 5
  ├─1 (4):  2 _ 3 / 1 8 4 / 7 6 5
  ├─2 (4):  2 8 3 / _ 1 4 / 7 6 5
  ├─3 (5):  2 8 3 / 1 4 _ / 7 6 5
  └─4 (5):  2 8 3 / 1 6 4 / 7 _ 5
  from node 1:
     ├─5 (5):  _ 2 3 / 1 8 4 / 7 6 5
     └─6 (6):  2 _ 3 / 1 8 4 / 7 6 5
  from node 2:
     ├─7 (4):  2 3 _ / 1 8 4 / 7 6 5   (board: 2 3 / 1 8 4 / 7 6 5)
     └─8 (6):  2 3 _ / 1 8 4 / 7 6 5
  from node 7:
     └─9 (4):  1 2 3 / _ 8 4 / 7 6 5
        from node 9:
           ├─10 (4):  1 2 3 / 8 _ 4 / 7 6 5   ← goal
           └─11 (6):  1 2 3 / 7 8 4 / _ 6 5
```
> ✅ Verified against clean slide 10. The parenthesized evaluation values along the expansion order are `root(3); 1(4),2(4),3(5),4(5); under 1: 5(5),6(6); under 2: 7(4),8(6); under 7: 9(4); under 9: 10(4),11(6)`. Goal at node 10 via root→2→7→9→10. (Resolves item #6.)

### Fig. 6-36 — A Graph to Illustrate the A\* Algorithm (was mislabeled "Fig. 6-17")
- **Source:** slide 36 (`render/A05full/slide-36.png`) — ✅ Verified.
- A layered directed graph from source `S` to sink `T`. Vertices: `S, V₁, V₂, V₃, V₄, V₅, T`. Each edge has a lowercase letter id and a weight. **This is the graph the A\* worked example (slides 37–42) operates on**, relabeled R/A/B/…/L there.

| Edge id | From → To | weight |
|---------|-----------|--------|
| a | S → V₁ | 2 |
| c | S → V₂ | 3 |
| b | S → V₃ | 4 |
| e | V₁ → V₂ | 3 |
| d | V₁ → V₄ | 2 |
| k | V₂ → V₄ | 2 |
| f | V₂ → V₅ | 2 |
| g | V₃ → V₅ | 2 |
| h | V₄ → V₅ | 1 |
| i | V₄ → T | 3 |
| j | V₅ → T | 5 |

> **Correction:** this is **Fig. 6-36** (A\* example), not Fig. 6-17. Cheapest S→T path by inspection: `S→V₁→V₄→T = 2+2+3 = 7`.

### Fig. 6-17 — A Multi-Stage Graph Searching Problem (the real Fig. 6-17) + its B&B tree
- **Sources:** slide 12 (graph) and slide 13 (best-first B&B search tree). ✅ Verified.

**The graph (slide 12):** vertices `V₀` (source), layer 1 `V₁,₁ V₁,₂ V₁,₃`, layer 2 `V₂,₁ V₂,₂ V₂,₃`, sink `V₃`. Edge weights:

| From → To | weight |
|-----------|--------|
| V₀ → V₁,₁ | 1 |
| V₀ → V₁,₂ | 3 |
| V₀ → V₁,₃ | 2 |
| V₁,₁ → V₂,₁ | 5 |
| V₁,₁ → V₂,₃ | 3 |
| V₁,₂ → V₂,₁ | 4 |
| V₁,₂ → V₂,₂ | 3 |
| V₁,₃ → V₂,₂ | 2 |
| V₁,₃ → V₂,₃ | 7 |
| V₂,₁ → V₃ | 4 |
| V₂,₂ → V₃ | 1 |
| V₂,₃ → V₃ | 1 |

**The search tree (slide 13):** nodes `a`–`l`. The number inside/next to a node is its cost estimate; the small number on an edge is the incremental cost; `x >k` under a leaf means "pruned, bound > k". Node `a` is the root (cost 1 shown above it). Branch labels are the V-vertices reached.

```
a (1)
├─[1]→ b  V₁,₁  (2)
│        ├─[5]→ e  V₂,₁  (3)   x >6
│        └─[3]→ f  V₂,₃  (3)
│                 └─[1]→ g  V₃  (4)
├─[3]→ c  V₁,₂  (2)
│        ├─[4]→ h  V₂,₁  (7)   x >7
│        └─[3]→ i  V₂,₂  (7)   x >6
└─[2]→ d  V₁,₃  (2)
         ├─[2]→ j  V₂,₂  (5)
         │        └─[1]→ l  V₃  (6)
         └─[7]→ k  V₂,₃  (5)   x >9
```
The optimal root→sink path is `a→b→f→g`, i.e. `V₀→V₁,₁→V₂,₃→V₃` with cost `1+3+1 = 5` (node g labeled cost 4 inside the circle is the estimate at that node). This is the B&B search tree for **Fig. 6-17** (slide 12 graph).

### Fig. 6-26 — Branch-and-Bound Solution of the Traveling Salesperson Problem
- **Source:** slide 28 (`render/A05full/slide-28.png`). ✅ Verified.
- A chain of `With X-Y` / `Without X-Y` decision boxes, each annotated with a lower bound `L.B.`. The left spine (the "With" choices) leads to the optimal tour.

| Node | L.B. | role |
|------|------|------|
| All | 96 | root |
| With 4-6 | 99 | expanded (left spine) |
| Without 4-6 | 128 | **terminated** |
| With 3-5 | 99 | expanded |
| Without 3-5 | 117 | to be expanded |
| With 2-1 | 112 | expanded |
| Without 2-1 | 125 | to be expanded |
| With 1-4 | 126 | expanded |
| Without 1-4 | 153 | terminated |
| With 6-7 | 126 | expanded |
| Without 6-7 | 141 | terminated |
| With 5-2 | 126 | expanded |
| Without 5-2 | — | **No solution** |
| With 7-3 | (Solution) | optimal |
| Without 7-3 | — | **No solution** |

**Final answer (printed in the figure):** `Solution 1-4-6-7-3-5-2-1, Cost = 126`.
> Resolves reconstruction item #14 — the full B&B tree and the optimal tour (`1-4-6-7-3-5-2-1`, cost 126) are now extracted.

### Fig. 6-28 — 0/1 Knapsack Problem Solved by Branch-and-Bound
- **Source:** slide 34 (`render/A05full/slide-34.png`). ✅ Verified.
- Boxed nodes numbered `0`–`30` in creation order. Edges labeled `Xᵢ = 1` / `Xᵢ = 0`. Each live node carries `U.B.` (upper bound) and `L.B.` (lower bound). Many nodes are marked `infeasible`. (Recall the deck minimizes negative profit, so more-negative is better; U.B. = best feasible found, L.B. = relaxation bound.)

Per-node bounds, exactly as printed:

| Node | branch taken to reach it | U.B. | L.B. | note |
|------|--------------------------|------|------|------|
| 0 | (root) | −16 | −18 | |
| 1 | X1=1 | −16 | −18 | |
| 2 | X1=0 | −14 | −17 | |
| 3 | X2=1 | −16 | −18 | |
| 4 | X2=0 | −15 | −18 | |
| 5 | X3=1 | | | infeasible |
| 6 | X3=0 | −16 | −18 | |
| 7 | X4=1 | | | infeasible |
| 8 | X4=0 | −16 | −18 | |
| 9 | X5=1 | | | infeasible |
| 10 | X5=0 | −16 | −18 | |
| 11 | X6=1 | | | infeasible |
| 12 | X6=0 | −16 | −16 | |
| 13 | (under 4) X3=1 | −15 | −18 | |
| 14 | (under 4) X3=0 | −17 | −18 | "a good upper bound is found here" |
| 15 | X4=1 | −17 | −17 | |
| 16 | X4=0 | −16 | −16 | |
| 17 | X5=1 | −17 | −17 | |
| 18 | X5=0 | −17 | −17 | |
| 19 | X6=1 | | | infeasible |
| 20 | X6=0 | −17 | −17 | |
| 21 | (under 13) X4=1 | −15 | −18 | |
| 22 | (under 13) X4=0 | −16 | −18 | |
| 23 | X5=1 | −16 | −18 | |
| 24 | X5=0 | −14 | −14 | |
| 25 | X6=1 | | | infeasible |
| 26 | X6=0 | −16 | −16 | |
| 27 | (under 21) X5=1 | | | infeasible |
| 28 | (under 21) X5=0 | −15 | −18 | |
| 29 | X6=1 | | | infeasible |
| 30 | X6=0 | −15 | −15 | |

The branch labels in the figure are `X1` (level 1, nodes 1/2), `X2` (nodes 3/4), `X3` (5/6 and 13/14), `X4` (7/8, 21/22, 15/16), `X5` (9/10, 27/28, 23/24, 17/18), `X6` (11/12, 29/30, 25/26, 19/20). The annotation "(a good upper bound is found here)" sits at node 14. The optimal value −17 surfaces along the node 14 → 15 → 17/18 → 20 chain (X1=0,…) consistent with the optimal set `{1,4,5}` giving −17 in §10.
> Resolves reconstruction item #16 — all per-node U.B./L.B. values now transcribed (root −16/−18 confirmed).

### Fig. 6-36 — A\* Search Tree (progressive-expansion snapshots, slides 37–42)
- **Sources:** slides 37–42 (`render/A05full/slide-37..42.png`) — the A\* search **tree** built on the Fig. 6-36 graph (slide 36). ✅ Verified.
- A search tree rooted at `R`. Each edge has a letter id and a weight `g`-increment; each node has a heuristic `h` value shown beneath it. `×` marks a node not (yet) expanded / a leaf in that snapshot. (The exact `g/h/f` table is given just below.)

**Edges (from slides 37–42):**

| Edge id | From → To | weight |
|---------|-----------|--------|
| a | R → A | 2 |
| b | R → B | 4 |
| c | R → C | 3 |
| d | A → D | 2 |
| e | A → E | 3 |
| g | B → J | 2 |
| k | C → F | 2 |
| f | C → G | 2 |
| h | D → H | 1 |
| i | D → I | 3 |
| h | F → K | 1 |
| l | F → L | 3 |

**Exact `g/h/f` per node (read directly from slides 37–42):**

| Node | g | h | f | source |
|------|---|---|---|--------|
| A | 2 | 2 | 4 | slide 37 |
| B | 4 | 2 | 6 | slide 37 |
| C | 3 | 2 | 5 | slide 37 |
| D | 4 | 1 | 5 | slide 38 |
| E | 5 | 2 | 7 | slide 38 (×) |
| F | 5 | 1 | 6 | slide 39 |
| G | 5 | 5 | 10 | slide 39 (×) |
| H | 5 | 5 | 10 | slide 40 (×) |
| I | 7 | 0 | 7 | slide 40 — **GOAL** |
| J | 6 | 5 | 11 | slide 41 (×) |
| K | 6 | 5 | 11 | slide 42 (×) |
| L | 8 | 0 | 8 | slide 42 (×) |

Expansion order (each step picks the smallest-`f` open node): **A(4) → C(5) → D(5) → B(6) → F(6)**. After expanding F, the smallest open node is **I (f=7)**, which is a goal node ("I is a goal node !", slide 42) → stop, optimal.
> ✅ Verified against slides 36–42 (resolves item #17). **Correction:** goal node is **I**, not F.

### Fig. 6-48 — A\* Partial Solution Tree for the Channel Routing Problem (was mislabeled "best-first g+h tree")
- **Source:** slide 49 (`render/A05full/slide-49.png`) — ✅ Verified.
- `root` with three children; nodes labeled A–I. Edge labels are `g+h` sums; node interiors hold the net set assigned to that track; `g(n)` = tree level, `h(n)` = maximal local density. Goal reached at node **I**.

```
root
├─[1+3]→ A  {8,1}      (f=4)
├─[1+3]→ B  {7,3,1}    (f=4)
│          ├─[2+3]→ D  {4,2}   (f=5)
│          ├─[2+2]→ E  {8,2}   (f=4)
│          │          ├─[3+2]→ G  {4}    (f=5)
│          │          └─[3+1]→ H  {5}    (f=4)
│          │                     └─[4]→ I  {4,6}   ← GOAL
│          └─[2+2]→ F  {5}     (f=4)
└─[1+3]→ C  {7,5}      (f=4)
```
> ✅ Verified against slide 49: this is **Fig. 6-48**. The three root children `{8,1}, {7,3,1}, {7,5}` are exactly the three maximal HCG cliques (= Fig. 6-46 first level). The node states are net-cliques assigned to successive tracks; goal is node I.

### Fig. 6-41 — Horizontal Constraint Graph (HCG) (was the uncaptioned "personnel/VCG ordering graph")
- **Source:** slide 47 (`render/A05full/slide-47.png`) — ✅ Verified.
- A directed graph over nets `1`–`8`. Edge tail → head means "tail must be left of head if in the same track". Arrows:

```
7 → 5,  7 → 6,  7 → 3,  7 → 1,  7 → 2
8 → 1,  8 → 2
4 → 6,  4 → 1,  4 → 2
3 → 1,  3 → 2
```
Sinks `1` and `2` receive the most arrows; `7, 8, 4` are sources; `3, 5, 6` intermediate.
> ✅ Verified against slide 47: this is the **channel-routing HCG** (slide annotation: "net 8 must be to the left of net 1 and net 2 if they are in the same track"), NOT a personnel/VCG graph.

### Fig. 6-40 — Channel Specification (newly transcribed)
- **Source:** slide 43. ✅ Verified.
- 13 columns; each column has a top terminal and bottom terminal (net number, `0` = none):

| Column | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|--------|---|---|---|---|---|---|---|---|---|----|----|----|----|
| **Top** | 4 | 8 | 0 | 7 | 0 | 3 | 6 | 0 | 0 | 2 | 1 | 5 | 0 |
| **Bottom** | 0 | 0 | 7 | 0 | 5 | 4 | 0 | 8 | 3 | 0 | 2 | 6 | 1 |

### VCG — Vertical Constraint Graph (newly transcribed)
- **Source:** slide 48. ✅ Verified.
- Edges (top-net → bottom-net at shared column): `1 → 2`, `3 → 4`, `5 → 6`. Nets 7 and 8 are isolated. Annotation: "e.g. net 3 must be wired before net 4."
- Same slide states the **max cliques in HCG: {1,8}, {1,3,7}, {5,7}** and shows the **Fig. 6-46** first level (root → {8,1}, {7,3,1}, {7,5}).

### Fig. 6-6 — Graph Containing a Hamiltonian Circuit (newly transcribed)
- **Source:** slide 4. ✅ Verified.
- Vertices laid out: top row `1, 2, 7, 5`; bottom row `6, 3, 4`. Edges: `1-2, 1-6, 1-3, 2-3, 6-5` (long crossing edge), `7-5, 7-4, 3-4, 4-5`.

### Tables 6-1 / 6-2 — Personnel cost & reduced matrices (newly transcribed)
- **Source:** slides 16, 17, 18. ✅ Verified — see §8 for the full Markdown tables. Table 6-1 P3 row = `3,21,7,9`; Table 6-2 row reductions `−12,−26,−3,−10` + column-2 `−3`; lower bound **54**.

### Personnel B&B trees (newly transcribed)
- **Sources:** slide 19 (solution tree), slide 20 (best-first with bounds), slide 21 (bounding).
- **Solution tree (slide 19, "Person Assigned" levels 1–4):**
```
            0
          /   \
         1      2
        / \      \
       2   3      1
      /|   |     / \
     3 4   2    3   4
     | |   |    |   |
     4 3   4    4   3
```
- **Best-first tree (slide 20)** — node value = partial cost; "Only one node is pruned away":
```
0(0)
├─ 1(29)
│   ├─ 2(59) ─┬─ 3(66) ── 4(81)
│   │          └─ 4(68) ── 3(78)
│   └─ 3(55) ── 2(76)
└─ 2(19)
    └─ 1(51) ─┬─ 3(58) ── 4(73)
               └─ 4(60) ── 3(70)
```
- **Bounding tree (slide 21)** — node value = lower bound; spine `0(54) → 2(58) → 1(64) → {3(68)→4(73), 4(70)→3(70)}`; optimal feasible cost = **70**.

### Tables 6-3 / 6-4 / 6-5 / 6-6 / 6-7 — TSP cost & reduced matrices (newly transcribed)
- **Sources:** slides 22, 23, 24, 26, 27. ✅ Verified — full Markdown tables in §9. Row-reduction sum 84 (Table 6-4); column reductions `−7,−1,−4` (Table 6-5) → lower bound **96**. Table 6-6 = "arc 4-6 included" with `(6,4)=∞`; Table 6-7 reduces row 5 by `−3` → lower bound **99**.

### Fig. 6-25 — Highest Level of the TSP Decision Tree (newly transcribed)
- **Source:** slide 25. ✅ Verified.
```
          [All solutions]  L.B. = 96
          /                       \
[with arc 4-6]            [without arc 4-6]
  L.B. = 96                L.B. = 96+32 = 128
```
Splitting arc = **4-6** (exclusion penalty 32, the largest; the 3-5 alternative penalty is 17+1=18).

---

### Summary — all reconstruction flags now ✅ Verified against the clean renders
With the full 49-slide render set (`render/A05full/`), **every** previously-reconstructed item (#1–#18) is now verified directly from a slide. Newly transcribed figures/tables added to this Appendix: **Fig. 6-6** (Hamiltonian graph, slide 4), **Tables 6-1/6-2** (personnel, slides 16–18), **personnel B&B trees** (slides 19–21), **Tables 6-3..6-7** (TSP, slides 22–27), **Fig. 6-25** (TSP decision tree top, slide 25), **Fig. 6-40** (channel spec, slide 43), **Fig. 6-41 HCG** (slide 47), **VCG** (slide 48), **Fig. 6-46/6-48** (channel A\* trees, slides 48–49).

**Corrections made during the clean-render pass:**
- The graph called "Fig. 6-17" before is **Fig. 6-36** (A\* example, slide 36); the true **Fig. 6-17** is the `V₀…V₃` multi-stage graph (slide 12, B&B tree slide 13).
- **Fig. 6-21** has only `J1→J3` and `J2→J4` — no `J1→J4` diagonal (was wrong).
- The A\* **goal node is I**, not F (slide 42).
- The uncaptioned `png_014` graph = **Fig. 6-41 HCG**; the uncaptioned `png_015` tree = **Fig. 6-48**.
