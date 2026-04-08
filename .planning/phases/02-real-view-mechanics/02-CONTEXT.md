# Phase 2: Real View Mechanics - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Build flip animations and reveal states for all post interactions (DISC requirements).

</domain>

<decisions>
## Implementation Decisions

### Interaction Trigger
- Dedicated "Reveal Reality" toggle button overlay on the card.
- Avoid tapping the image directly to prevent accidental flips while the user is casually scrolling.

### Animation Mechanics
- Pure CSS 3D transforms (flips card container 180deg).
- Maintains the zero-dependency, lightweight Vanilla CSS established in Phase 1.

### Back Card Data Presentation
- Continuous scrollable back-card mapped with distinct block sections.
- Fits Nutrition facts block, AI persuasion tactics snippet, and visual Bias Score within the mobile-first 430px bounds.

### the agent's Discretion
- Visual styling of the toggle button and Bias Score.
- Easing functions and flip duration for the perfect physical feel.

</decisions>

<specifics>
## Specific Ideas

- Ensure flip animation performs smoothly (sub-100ms response) without jank.
- Match Phase 1 UI style (plain HTML/CSS architecture, mimicking native social apps).

</specifics>

<canonical_refs>
## Canonical References

### Project Docs
- `.planning/PROJECT.md` — Core constraints (mobile-first 430px, ephemeral sessions, strict performance focus)
- `.planning/REQUIREMENTS.md` — Specifically DISC-01, DISC-02, DISC-03, DISC-04 details
- `.planning/phases/01-feed-implementation/01-UI-SPEC.md` — Design tokens (colors, fonts, constraints) established in Phase 1

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` structure and `src/style.css` CSS variables.
- `src/data.js` object schema (will need to expand this to contain the new "real" data).
- `src/main.js` dynamic feed rendering functions (will need to adjust layout to include the back of the card).

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed right on target for the 'DISC' requirements.

</deferred>
