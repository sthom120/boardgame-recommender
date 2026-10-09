# MVP Sprint Plan

This document is the working delivery plan from the October 2026 integration checkpoint to the first public Shuffled MVP.

The plan deliberately separates **technical integration**, **catalogue scale**, **recommendation quality**, **interface quality**, **automated quality**, **deployment**, and **portfolio evidence** so that recommendation behaviour is evaluated against a realistic data set rather than tuned against the original 15-game technical-spike catalogue.

## Product direction

Shuffled should behave like a knowledgeable board-game shop assistant for a casual or relatively inexperienced buyer:

- ask a small number of understandable questions;
- treat hard constraints as hard constraints;
- rank softer preferences transparently;
- allow sensible near-matches rather than requiring a perfect match;
- explain why each game fits and call out meaningful trade-offs;
- avoid letting popularity dominate questionnaire fit;
- provide enough catalogue breadth for genuine discovery.

The original controlled BGG catalogue remains useful for deterministic tests, but it is not the intended MVP catalogue.

## Catalogue targets

The catalogue targets are staged:

- **~15 games** — technical spike / deterministic integration set;
- **~100 varied games** — development catalogue for meaningful recommendation-quality testing;
- **~300–500 games** — credible first MVP catalogue;
- **beyond 500** — future growth supported by the same import/storage boundary.

These are delivery targets, not architectural limits.

BGG should be used as an upstream source through batched, paced, authenticated requests. User recommendation requests should rank locally cached/stored normalized records rather than fetching hundreds of BGG records live.

BGG-derived fields and Shuffled-owned metadata or display transformations must remain clearly separated.

---

## MVP Sprint 1 — Finish integration and developer workflow

**Primary issues:** #26, #38

### Goal
Close the live recommendation integration cleanly and make the normal local-development workflow reliable.

### Work
- Merge the real recommendation-service integration.
- Preserve the existing frontend API contract.
- Keep fixture and BGG-backed data sources interchangeable.
- Keep safe 503 handling for temporary recommendation outages.
- Keep fresh-cache reuse and stale-cache fallback during temporary BGG outages.
- Fix the combined `npm run dev` workflow so the backend remains available behind the Vite proxy.
- Re-run the browser happy path after the dev-script fix.

### Exit criteria
- `npm run dev` keeps frontend and backend alive together.
- A browser questionnaire submission returns live BGG-backed recommendations.
- The server test suite is green.
- Issue #26 can be closed.

---

## MVP Sprint 2 — Build the scalable game catalogue

**Primary issue:** #39

### Goal
Replace the technical-spike candidate pool with a persisted, scalable normalized catalogue.

### Work
- Choose and document the persisted catalogue format/storage approach.
- Maintain a curated source list of BGG IDs.
- Implement batched import/update logic using the existing BGG integration.
- Respect the 20-ID request maximum, pacing, retry and caching behaviour.
- Persist normalized results so recommendation requests are fast and do not depend on many live BGG calls.
- Build the first ~100-game development catalogue with deliberate coverage across player count, time, complexity, experience/mood and play style.
- Keep app-owned content classifications or editorial metadata separate from BGG-derived fields.
- Add deterministic import/update tests.

### Exit criteria
- At least ~100 varied games are available locally to the recommendation engine.
- A recommendation request does not need to fetch the whole catalogue live.
- The catalogue can expand toward 300–500 without changing the recommendation-engine interface.

---

## MVP Sprint 3 — Tune recommendation quality

**Primary issue:** #40

### Goal
Tune ranking against a realistic catalogue rather than against the 15-game technical set.

### Work
- Create a repeatable scenario matrix from realistic customer requests.
- Re-run the browser scenarios that exposed repetitive/famous-game results.
- Add meaningful contradiction handling, for example when a user selects competitive but a game is explicitly cooperative.
- Review multi-select mood/style behaviour so one strong match cannot completely mask another selected preference.
- Review coarse 0 / 0.5 / 1 scoring where it creates excessive ties.
- Review Bayesian rating and `usersRated` as late tie-breakers so popularity cannot override stronger questionnaire fit.
- Verify suitable lesser-known games can outrank famous but weaker-fit games.
- Add a regression test for each scoring change.
- Grow the catalogue toward roughly 300–500 games once the import pipeline is proven.

### Exit criteria
- Strong contradictions lower rankings without turning every preference into a hard filter.
- Multiple selected preferences are meaningfully represented.
- Questionnaire fit is more important than popularity.
- Scenario results are defensible in plain language.
- The recommendation engine remains deterministic and explainable.

---

## MVP Sprint 4 — Result content, responsive and accessibility quality

**Primary issues:** #41, #27

### Goal
Make the real-data interface readable, resilient and accessible.

### Work
- Decode embedded entities such as `&mdash;` for display.
- Replace overly long raw descriptions with a deterministic, concise display treatment while preserving source provenance.
- Test long titles, missing images and missing optional metadata.
- Complete keyboard, focus, contrast, semantic and zoom checks.
- Test narrow/mobile layouts.
- Verify loading, validation, no-match and API-error states.
- Review user-facing board-game terminology.
- Add required BGG attribution to the public-facing experience before deployment.

### Exit criteria
- No raw HTML entities appear in result cards.
- Results are easy to scan on desktop and mobile.
- Core flow works without a mouse and at increased zoom.
- Serious accessibility findings are fixed or explicitly tracked.

---

## MVP Sprint 5 — Automated quality and CI

**Primary issue:** #28

### Goal
Protect the main contracts and browser journey with repeatable automated checks.

### Work
- Consolidate backend API integration coverage.
- Add contract-focused matches / limited-matches / no-matches coverage.
- Add frontend interaction tests.
- Add at least one practical end-to-end happy-path test.
- Keep regression tests for discovered bugs.
- Add one-command local checks.
- Add GitHub Actions checks for pull requests.
- Keep normal CI independent of live BGG availability.

### Exit criteria
- Critical tests fail the CI build when broken.
- Recommendation tests stay deterministic.
- The core user journey has automated protection.

---

## MVP Sprint 6 — Deploy the public MVP

**Primary issue:** #29

### Goal
Publish a production-safe, publicly usable Shuffled MVP.

### Work
- Choose hosting for frontend/backend and document the architecture.
- Configure environment variables securely.
- Keep the BGG token server-side only.
- Configure production API routing/CORS/error behaviour.
- Deploy and run the complete recommendation journey.
- Verify required BGG attribution and current API terms before public release.
- Document hosting limitations and operational notes.

### Exit criteria
- A public URL completes the full recommendation journey.
- No secrets are exposed.
- Production failure states remain safe and useful.
- Deployment instructions are documented.

---

## MVP Sprint 7 — Portfolio polish and release evidence

**Primary issue:** #30

### Goal
Turn the shipped MVP into a strong portfolio case study.

### Work
- Rewrite the README as a recruiter-facing project overview.
- Add screenshots of the finished application.
- Explain the architecture and transparent recommendation approach.
- Link requirements, UX, API, accessibility and ADR documentation.
- Record the catalogue-scaling decision and recommendation-quality testing.
- Record important debugging/review stories, including:
  - player-poll exact-vs-open-ended regression;
  - concurrent BGG pacing race;
  - safe outage handling and stale-cache fallback;
  - live-browser findings that changed the catalogue/ranking plan.
- Separate shipped MVP features from future ideas.
- Check repository for stale instructions, temporary files and secrets.

### Exit criteria
- A recruiter can understand the problem, product decisions and technical contribution from the repository.
- Live application, testing evidence and architectural decisions are easy to find.
- The project story clearly shows iteration from discovery through deployment.

---

## MVP release definition

The first MVP is ready when:

- the public application completes the six-question recommendation journey;
- the recommendation engine searches a varied catalogue of roughly 300–500 games;
- recommendations honour hard constraints and meaningfully reflect selected preferences;
- explanations and caveats are understandable;
- popularity does not dominate fit;
- real BGG content is presented cleanly;
- the application passes the agreed responsive/accessibility quality bar;
- automated CI protects the core contracts;
- the app is deployed with safe server-side BGG credentials and required attribution;
- the repository contains enough evidence to explain the product, architecture, testing and iteration decisions.
