# CraveCheck

## What This Is

CraveCheck is an AI-powered web application that simulates a social media food feed to help users understand the difference between visually appealing “reel” food and its actual nutritional reality. Users scroll a curated feed of influencer-style posts and flip to a "Real View" to reveal nutritional facts, while the system compares their interaction patterns to pre-collected survey data to generate an Awareness Score indicating their susceptibility to social media influence.

## Core Value

Visually and experientially demonstrate the gap between social media food aesthetics and nutritional reality, without the friction of user accounts or live LLM latency.

## Requirements

### Validated

*(None yet — ship to validate)*

### Active

- [ ] Provide an ephemeral session model where users enter age demographic data to start.
- [ ] Render a scrollable, social media-like feed with pre-seeded food images and deceptive influencer-style captions.
- [ ] Implement a "Real View" toggle to reveal actual nutritional data (calories, sugar, fat, additives) for each post.
- [ ] Include pre-computed AI analysis of captions that highlights emotional persuasion and misleading claims.
- [ ] Capture user interaction decisions (e.g., "Would you eat this regularly?").
- [ ] Compare decisions and behavior against a pre-collected, age-segmented survey dataset.
- [ ] Calculate and display a real-time Awareness Score to the user.
- [ ] Show a Bias Score for posts reflecting how misleading the original content is.
- [ ] Provide healthier alternative recommendations for selected food items.

### Out of Scope

- User authentication / accounts — Ephemeral sessions lower the barrier to entry and keep interactions frictionless.
- Live, on-the-fly LLM analysis — Pre-computing insights avoids API latency and costs, ensuring a snappy UI.
- Live scraping of Instagram/TikTok — Pre-seeding controlled data scenarios ensures consistent test reliability and avoids platform scraping bans.
- Telemetry across sessions — Scores and comparisons reset at the end of the session to prioritize privacy and reduce storage overhead.

## Context

- The platform is designed to educate and calibrate user behavior concerning deceptive digital food marketing.
- The UI needs to heavily mimic modern mobile feeds to properly immerse the user in the context before subverting their expectations.
- As a brownfield GSD project environment, the initial setup confirmed an empty `.planning/codebase` state, meaning all architectural definitions and technology selections will be from scratch (greenfield execution).

## Constraints

- **Performance**: Feed interactions and the "Real View" flip must be sub-100ms and highly responsive — to model modern apps precisely.
- **Dependencies**: Survey dataset is assumed to be provided (e.g. CSV or JSON file) for local querying.
- **AI Processing**: All AI insights must be baked into the pre-seeded dataset rather than called securely via live API keys from the client to eliminate latency.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Ephemeral Sessions | Removes friction, prevents PII storage overhead, focuses strictly on the interaction. | — Pending |
| Pre-computed AI & Content | Keeps latency low and avoids scraping instability constraints, ensuring consistent user experience. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initial project creation*
