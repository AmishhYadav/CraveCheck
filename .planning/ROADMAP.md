# Roadmap

## Proposed Roadmap

**3 phases** | **12 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Feed Implementation | Render scrollable high-fidelity UI feed. | FEED-01, FEED-02, BEHAV-01 | 3 |
| 2 | Real View Mechanics | Build flip animations and reveal states. | DISC-01, DISC-02, DISC-03, DISC-04 | 4 |
| 3 | Scoring & Insights | Model telemetry scoring and comparisons. | BEHAV-02, SCORE-01, SCORE-02, SCORE-03, SCORE-04 | 5 |

### Phase Details

**Phase 1: Feed Implementation**
Goal: Render scrollable high-fidelity UI feed to mimic real social media apps.
Requirements: FEED-01, FEED-02, BEHAV-01
Success criteria:
1. User can enter an age demographic securely and frictionlessly.
2. User can scroll through at least 5 populated dummy food items.
3. Feed scroll mimics native app physics without jank or excessive reflow.

**Phase 2: Real View Mechanics**
Goal: Build flip animations and reveal states for all post interactions.
Requirements: DISC-01, DISC-02, DISC-03, DISC-04
Success criteria:
1. Toggling "Real View" initiates a smooth CSS/Framer motion flip revealing the back card.
2. Back card accurately displays nutritional facts formatted clearly.
3. Back card displays AI persuasion tactics analysis snippet.
4. Bias Score visualizer clearly depicts the deception margin.

**Phase 3: Scoring & Insights**
Goal: Model telemetry scoring and baseline demographic comparisons.
Requirements: BEHAV-02, SCORE-01, SCORE-02, SCORE-03, SCORE-04
Success criteria:
1. User can lock in a food decision.
2. The user action is immediately compared against dataset logic to update the running aggregate.
3. Awareness Score increments/decrements locally visible in real-time.
4. Healthier alternative is conditionally recommended per interaction.
5. Finishing the post queue resolves directly to a summary statistics dashboard.
