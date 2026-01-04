# Roadmap Review Prompt for Local Claude Code

**Usage:** Copy the prompt below into your local Claude Code session running in planning mode.

---

Enter planning mode. Read and deeply analyze these three documents together:

1. **ROADMAP.md** — the commercialization roadmap (primary plan)
2. **ROADMAP-CHIEF-SOFTWARE-DESIGNER-REVIEW.md** — the architectural review addendum (risk assessment and mitigations)
3. **addendum_ghibli_tree_rendering.md** — the tree rendering aesthetic/technical guidance (Garden implementation specifics)

Using ultrathink, perform the following:

## Phase 1: Review Assessment

### For each of the 10 sections in the Chief Software Designer Review:
- Do you agree with the concern raised? Why or why not?
- Is the proposed alternative/mitigation practical given our stack and timeline?
- What is the real-world impact if we ignore this item?

### For each of the 13 sections in the Ghibli Tree Rendering Addendum:
- Does this guidance align with or conflict with the original roadmap?
- Does it address concerns raised in the Chief Software Designer Review?
- Are there implementation details that need to be added to specific roadmap phases?

## Phase 2: Triage

Categorize each item from BOTH review documents into one of:
- **ACCEPT**: Incorporate into roadmap as written
- **MODIFY**: Accept the concern but propose different solution
- **DEFER**: Valid but not blocking v1.0 launch
- **REJECT**: Disagree with the assessment (explain why)

## Phase 3: Roadmap Integration

For items marked ACCEPT or MODIFY, specify exactly:
- Which phase(s) in ROADMAP.md need updating
- What specific tasks/checkpoints to add
- Any new files to create (e.g., `src/lib/aesthetic.ts` from the tree addendum)
- Any reordering of phases or dependencies
- Updated risk assessments

Pay particular attention to how the tree rendering addendum's recommendations (Aesthetic Modulation Layer, stillness budget, motion design rules) integrate into Phases 5a, 5b, and 5c.

## Phase 4: Cross-Document Synthesis

Identify where the three documents:
- **Reinforce** each other (same concern, same solution)
- **Complement** each other (different concerns, compatible solutions)
- **Conflict** (incompatible recommendations — propose resolution)

## Phase 5: Final Synthesis

Produce a consolidated update plan that I can use to revise ROADMAP.md, preserving its structure while incorporating the accepted changes from both addenda. The output should be:
- A list of specific edits to ROADMAP.md (phase by phase)
- Any new files/structures to add to the project
- Updated test checklists incorporating new validation criteria

Do not modify any files yet. Present your analysis and recommendations in the plan file for my review.
