# Phase 3: Scoring & Insights - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Model telemetry scoring, user interaction capture, algorithmic healthy alternatives, and the overall end-of-session demographic comparison dashboard.

</domain>

<decisions>
## Implementation Decisions

### Action Choices UX
- Replace the social media action buttons (Like/Comment) with explicit "Would Eat" (Check) and "Pass" (X) decision buttons for each post.
- Clicking a decision locks it in visually for that post.

### Awareness Score Display
- Use a persistent, sticky header bar pinned to the top of the viewport (e.g. "Awareness Score: 100").
- The score increments/decrements locally immediately upon the user selecting an action.

### Providing Alternatives
- Display the algorithmic healthy alternative directly inside the "Real View" back card (adding a new section there instead of cluttering the feed).

### End of Session Trigger
- Automatically disable scrolling and overlay the "Scoring & Insights" summary screen immediately after the user makes an action on the final (5th) post.

### the agent's Discretion
- Easing and animation for the score incrementing.
- Visual design of the final summary dashboard and statistical charts (can use pure CSS charts or SVG).

</decisions>

<specifics>
## Specific Ideas

- When "Would Eat" is pressed on a high-bias deceptive post, the Awareness Score drops and pulses red to provide immediate operant conditioning feedback.
- Final summary dashboard should directly compare the user's final score to a mock baseline (e.g., "You are 15% more aware than others in your age group").

</specifics>

<canonical_refs>
## Canonical References

### Project Docs
- `.planning/PROJECT.md` — Core constraints (mobile-first 430px, ephemeral sessions, pure performance focus)
- `.planning/REQUIREMENTS.md` — BEHAV-02, SCORE-01, SCORE-02, SCORE-03, SCORE-04 details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` — `#feed-view` container can prepend a score header.
- `src/main.js` — Interaction event delegation can cleanly handle the new "Would Eat" / "Pass" mechanics in the exact same click listener.

</code_context>

<deferred>
## Deferred Ideas

None — discussion mapped directly onto final phase scope.

</deferred>
