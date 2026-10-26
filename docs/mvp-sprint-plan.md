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

## Repository review checkpoint — 2026-10-26

A full repository review confirmed that Shuffled is a **working technical alpha with a strong engineering foundation**, but not yet a public-ready MVP.

Key review findings have been incorporated into the sprint plan rather than tracked as a separate wish list:

- the live BGG normalizer sets content classification to `unknown`, so **Family-friendly only** is not fully useful until Shuffled-owned content metadata is populated;
- recommendation scoring and displayed complexity labels currently use slightly different bands and must be unified;
- some mood/style rules reuse time or complexity evidence, so possible double-counting should be reviewed during ranking work;
- result cards currently duplicate recommendation explanations through both **Why it fits you** and **Why this game?**;
- the current blue/violet-on-white treatment likely needs contrast adjustment during accessibility review;
- result-screen focus management, repeat-use actions and final Shuffled branding need a deliberate quality pass;
- backend tests are strong, but frontend, end-to-end and CI protection remain incomplete;
- deployment must explicitly support Node's built-in SQLite runtime and a suitable catalogue-file strategy;
- stale README/scaffold/license metadata should be cleaned before portfolio release;
- the BGG client contains a duplicated exhausted-retry block that should be simplified without changing behaviour.

These findings are assigned below to the sprint where they can be fixed with the least disruption.

---

## MVP Sprint 1 — Finish integration and developer workflow ✅ COMPLETE

**Primary issues:** #26, #38

### Goal
Close the live recommendation integration cleanly and make the normal local-development workflow reliable.

### Completed
- Merged the real recommendation-service integration.
- Preserved the existing frontend API contract.
- Kept fixture and BGG-backed data sources interchangeable.
- Added safe 503 handling for temporary recommendation outages.
- Kept fresh-cache reuse and stale-cache fallback during temporary BGG outages.
- Fixed the combined `npm run dev` workflow so the backend remains available behind the Vite proxy.
- Re-ran the browser happy path with live BGG-backed recommendations.
- Closed Issues #26 and #38 through PR #43.

### Exit criteria
- ✅ `npm run dev` keeps frontend and backend alive together.
- ✅ A browser questionnaire submission returns live BGG-backed recommendations.
- ✅ The server test suite is green.
- ✅ Issues #26 and #38 are closed.

---

## MVP Sprint 2 — Build the scalable game catalogue 🟡 IN PROGRESS

**Primary issue:** #39

### Goal
Replace the technical-spike candidate pool with a persisted, scalable normalized catalogue.

### Completed foundation
- Chose SQLite and documented the decision in ADR 002.
- Documented the catalogue schema and BGG-vs-Shuffled data-ownership boundary.
- Added SQLite schema constraints and regression tests.
- Added a catalogue repository that stores and reconstructs normalized game records.
- Verified that re-importing BGG data preserves Shuffled-owned content classification.
- Reached 130 passing server tests at the current checkpoint.

### Remaining work
- Add the SQLite catalogue data-source boundary used by the recommendation service.
- Maintain a curated source list of BGG IDs with provenance/status.
- Implement batched import/update logic using the existing BGG integration.
- Respect the 20-ID request maximum, pacing, retry and caching behaviour.
- Persist normalized results so recommendation requests are fast and do not depend on many live BGG calls.
- Build the first ~100-game development catalogue with deliberate coverage across player count, time, complexity, experience/mood and play style.
- Define a practical Shuffled-owned content-classification workflow so **Family-friendly only** works against the real catalogue.
- Keep app-owned content classifications, curated tags and inclusion status separate from BGG-derived fields.
- Add deterministic tests for batching, persistence/update behaviour, partial failures and recovery.
- Switch the normal recommendation path from the live 15-ID BGG data source to the local catalogue.
- Re-run the browser flow against the persisted catalogue.
- Simplify the duplicated exhausted-retry block in `bggClient.js` while retaining the existing regression coverage.

### Exit criteria
- At least ~100 varied games are available locally to the recommendation engine.
- A recommendation request does not need to fetch the whole catalogue live.
- Family-friendly filtering has usable Shuffled-owned metadata rather than defaulting the catalogue to `unknown`.
- The catalogue can expand toward 300–500 without changing the recommendation-engine interface.
- Existing BGG pacing/cache/outage behaviour remains protected by tests.

---

## MVP Sprint 3 — Tune recommendation quality

**Primary issue:** #40

### Goal
Tune ranking against a realistic catalogue rather than against the 15-game technical set.

### Work
- Create a repeatable scenario matrix from realistic customer requests.
- Re-run the browser scenarios that exposed repetitive/famous-game results.
- Add meaningful contradiction handling, for example when a user selects competitive but a game is explicitly cooperative.
- Review multi-select mood/style behaviour as a soft-AND so one strong match cannot completely mask another selected preference.
- Review coarse 0 / 0.5 / 1 scoring where it creates excessive ties.
- Review Bayesian rating and `usersRated` as late tie-breakers so popularity cannot override stronger questionnaire fit.
- Verify suitable lesser-known games can outrank famous but weaker-fit games.
- **Unify complexity scoring bands and displayed complexity labels so the same game is not scored as one tier and described as another.**
- **Review possible double-counting where style/mood signals reuse time or complexity evidence already scored elsewhere. Decide deliberately whether that amplification is desirable.**
- Keep explanation text aligned with the factors that actually drove ranking.
- Add a regression test for each scoring change.
- Grow the catalogue toward roughly 300–500 games once the import pipeline is proven.
- If the engine becomes harder to reason about during tuning, perform a small decomposition of the current large module into configuration/signals, eligibility, scoring and explanation/response concerns without changing the public engine interface.

### Exit criteria
- Strong contradictions lower rankings without turning every preference into a hard filter.
- Multiple selected preferences are meaningfully represented.
- Questionnaire fit is more important than popularity.
- Complexity labels and complexity scoring use one coherent source of truth.
- Reused scoring evidence has been reviewed and intentional double-counting is documented.
- Scenario results are defensible in plain language.
- The recommendation engine remains deterministic and explainable.

---

## MVP Sprint 4 — Result content, responsive and accessibility quality

**Primary issues:** #41, #27

### Goal
Make the real-data interface readable, resilient, visually coherent and accessible.

### Work
- Decode embedded entities such as `&mdash;` for display.
- Replace overly long raw descriptions with a deterministic, concise display treatment while preserving source provenance.
- Test long titles, missing images and missing optional metadata.
- Decide whether **Why it fits you** and **Why this game?** should have distinct purposes; remove duplicated explanation content if not.
- Add a clear repeat-use action from results, such as **Start again**, alongside changing answers.
- Complete keyboard, focus, semantic and zoom checks.
- Ensure focus is deliberately moved/announced when entering review and results screens, not only between questionnaire steps.
- Run automated accessibility checks and manual keyboard testing.
- Verify colour contrast, especially white text on the blue/violet primary-button treatment and blue progress text on the page background; introduce darker accessible variants where required.
- Test narrow/mobile layouts, 200% zoom and long real-world content.
- Verify loading, validation, no-match and API-error states.
- Review user-facing board-game terminology.
- Integrate the final Shuffled logo/identity so the product feels distinctive rather than like a generic Vite app.
- Add required BGG attribution to the public-facing experience before deployment.
- Tidy frontend styling where iterative overrides or inconsistent indentation make maintenance unnecessarily difficult.

### Exit criteria
- No raw HTML entities appear in result cards.
- Results are concise and easy to scan on desktop and mobile.
- Recommendation explanations are not needlessly duplicated.
- Core flow works without a mouse and at increased zoom.
- Focus transitions are understandable to keyboard/screen-reader users.
- Primary interactive text meets the agreed contrast bar.
- Serious accessibility findings are fixed or explicitly tracked.

---

## MVP Sprint 5 — Automated quality and CI

**Primary issue:** #28

### Goal
Protect the main contracts and browser journey with repeatable automated checks.

### Work
- Consolidate backend API integration coverage.
- Add explicit invalid-request and invalid-JSON API tests.
- Add contract-focused `matches` / `limited-matches` / `no-matches` coverage.
- Add frontend interaction tests for questionnaire validation, multi-select behaviour, review/edit flow, submission errors and results states.
- Add at least one practical end-to-end happy-path test using deterministic local catalogue data rather than live BGG.
- Add regression tests for important bugs discovered during implementation.
- Add one-command local lint/test/build checks.
- Add GitHub Actions checks for pull requests.
- Keep normal CI independent of live BGG availability.
- Verify the client production build as part of CI.

### Exit criteria
- Critical tests fail the CI build when broken.
- Recommendation tests stay deterministic.
- The core user journey has automated frontend/end-to-end protection.
- Normal CI does not require a BGG token or network availability.

---

## MVP Sprint 6 — Deploy the public MVP

**Primary issue:** #29

### Goal
Publish a production-safe, publicly usable Shuffled MVP.

### Work
- Choose hosting for frontend/backend and document the architecture.
- Explicitly choose a host/runtime compatible with the Node version required by `node:sqlite`.
- Add an appropriate Node `engines` requirement so deployment does not silently select an incompatible runtime.
- Decide and document the SQLite production model:
  - preferably a read-mostly populated catalogue shipped with the application for normal recommendation traffic;
  - run BGG catalogue imports as an explicit update/build/admin process unless persistent runtime writes are genuinely required.
- Verify the chosen host's filesystem persistence/read-only constraints before deployment.
- Configure environment variables securely.
- Keep the BGG token server-side only.
- Configure production API routing/CORS/error behaviour.
- Deploy and run the complete recommendation journey.
- Verify required BGG attribution and current API terms before public release.
- Document catalogue refresh/operational steps and hosting limitations.

### Exit criteria
- A public URL completes the full recommendation journey.
- The deployed runtime supports the chosen SQLite strategy.
- No secrets are exposed.
- Production failure states remain safe and useful.
- Deployment and catalogue-refresh instructions are documented.

---

## MVP Sprint 7 — Portfolio polish and release evidence

**Primary issue:** #30

### Goal
Turn the shipped MVP into a strong portfolio case study.

### Work
- Rewrite the README as a recruiter-facing project overview.
- Add screenshots of the finished application and prominent live-demo link.
- Explain the architecture and transparent recommendation approach.
- Link requirements, UX, API, accessibility and ADR documentation.
- Record the catalogue-scaling decision and recommendation-quality testing.
- Record important debugging/review stories, including:
  - player-poll exact-vs-open-ended regression;
  - concurrent BGG pacing race;
  - safe outage handling and stale-cache fallback;
  - Windows combined-dev workflow bug;
  - live-browser findings that changed the catalogue/ranking plan;
  - repository review findings that changed quality/deployment tasks.
- Make the project journal current through deployment.
- Remove or replace the stock `client/README.md`.
- Remove unused Vite/React scaffold assets and other temporary files.
- Make repository/package metadata consistent, including the MIT-vs-ISC license mismatch.
- Check README commands/status text for stale issue references.
- Add a concise architecture diagram and testing/CI evidence.
- Separate shipped MVP features from future ideas.
- Check repository/history for accidental secrets.
- Keep the detailed supporting docs, but make the README concise enough that a recruiter can understand the project without reading every document.

### Exit criteria
- A recruiter can understand the problem, product decisions and technical contribution from the README alone.
- Live application, testing evidence and architectural decisions are easy to find.
- The repository contains no obvious scaffold leftovers or contradictory project metadata.
- The project story clearly shows iteration from discovery through deployment.

---

## MVP release definition

The first MVP is ready when:

- the public application completes the six-question recommendation journey;
- the recommendation engine searches a varied catalogue of roughly 300–500 games;
- Family-friendly filtering is backed by usable Shuffled-owned content metadata;
- recommendations honour hard constraints and meaningfully reflect selected preferences;
- explanations and caveats are understandable and non-duplicative;
- complexity scoring and displayed complexity descriptions are coherent;
- popularity does not dominate fit;
- real BGG content is presented cleanly;
- the application passes the agreed responsive/accessibility quality bar, including contrast and focus behaviour;
- automated CI protects backend, frontend and at least one end-to-end core journey;
- the app is deployed on a runtime compatible with the selected SQLite strategy;
- BGG credentials remain server-side and required attribution is visible;
- the repository contains enough evidence to explain the product, architecture, testing, debugging and iteration decisions.

## Current priority

Continue **Sprint 2 / Issue #39**. Do not tune ranking deeply or polish presentation against the tiny technical catalogue first.

The immediate next implementation path is:

```text
SQLite catalogue data source
→ batched BGG importer
→ curated source list
→ Shuffled-owned content metadata
→ ~100 varied development records
→ switch normal requests to local catalogue
→ browser verification
→ Sprint 3 ranking scenarios
```
