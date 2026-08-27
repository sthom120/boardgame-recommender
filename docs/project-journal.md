# Project Journal

This journal records meaningful project progress, decisions, discoveries, problems and lessons. It is not intended to capture every coding action.

## 2026-08-22 — Project setup and discovery

### Completed
- Created the public `boardgame-recommender` repository.
- Added README, Node `.gitignore` and MIT License during repository setup.
- Established GitHub as the source of truth for project planning and development history.
- Added the initial project brief.
- Defined the primary user as a casual or relatively inexperienced player looking to buy a new game.
- Defined the core problem as choice overload.
- Defined three key user needs: an easy starting point, situation-specific recommendations and clear explanations of why a game is recommended.
- Defined six MVP inputs: player count, play time, complexity, experience/mood, game style/mechanics and age appropriateness.
- Defined the initial recommendation output format and explicit out-of-scope features.
- Recorded future ideas including AI-assisted interpretation and local shopping/availability.

### Technical discovery
- Opened Issue #3 for a BoardGameGeek API technical spike.
- Submitted the BGG application registration as a public, non-commercial portfolio application; approval is pending.
- Reviewed BGG API documentation around authentication, XML responses, throttling, server-side access, caching, attribution and terms.
- Identified that most MVP fields appear to have strong documented BGG support; experience/mood will likely require our own derived mapping layer.
- Proposed an internal JSON game-data model so the rest of the application does not depend on raw BGG XML.
- Added ADR 001 documenting the decision to normalise BGG data behind the backend.

### Workflow evidence
- Created branch `docs/internal-game-model`.
- Added the model and ADR on the branch.
- Opened PR #4, reviewed its diff, and squash-merged it into `main`.

### Current blocker
Authenticated `/search` and `/thing?stats=1` testing is waiting on BGG application approval.

### Next
- Refine the source-field mapping and select representative test games.
- Perform live endpoint testing once the BGG token is available.
- Continue documenting data gaps and risks before production development begins.

## 2026-08-26 to 2026-08-27 — UX and BGG technical spike completion

### Completed
- Set up the GitHub Project workflow and roadmap structure.
- Defined the MVP user flow and low-fidelity wireframes, including the six-question recommendation journey, review screen, results state and supporting loading/error/no-match states.
- Merged the UX work through PR #12 and closed Issue #7.
- Received BGG application approval on 26 August 2026 and completed authenticated XML API2 testing.
- Validated `/xmlapi2/search` and `/xmlapi2/thing?stats=1` across the full 15-record test matrix.
- Rewrote `docs/bgg-api-spike.md` around the completed evidence and refined the internal game-data model.
- Reviewed and merged PR #13, which closed Issue #3 as completed.

### Important findings
- Official player minimum/maximum values are hard eligibility boundaries; community player polls are better treated as suitability evidence within those boundaries.
- Community player-count poll labels must remain strings because values such as `1+`, `5+` and similar open-ended buckets occur.
- Publisher age and community suggested-age evidence should both be retained because they can disagree.
- Exact-title search is not guaranteed to return one unique record; alternate titles and multiple primary editions require explicit resolution logic.
- Expansions can look like normal board-game records and must be identified from relationship links; an expansion may have multiple compatible/base games.
- Mechanics and categories provide useful recommendation signals, but mood, audience fit, content fit, match strength and explanations remain application-owned derived logic.
- Community poll sample sizes vary, so later scoring should consider proportions and confidence rather than raw vote counts across games.
- The production XML normalisation layer should explicitly test UTF-8/non-ASCII text handling.

### Architecture outcome
- ADR 001 is strongly supported by live evidence: BGG access should remain behind a backend integration layer that handles authentication, XML parsing, validation, normalisation, caching and retry/throttling behaviour.
- The recommendation engine should consume the application's internal JSON model rather than raw BGG XML.
- BGG should be treated as a source-data provider rather than as the recommendation engine itself.

### Pause checkpoint
- PR #13 is merged into `main`.
- Issue #3 is closed as completed.
- The BGG technical spike is complete; there is no unresolved external blocker.
- No application scaffolding has been started prematurely.
- The next planned work is requirements and recommendation design rather than implementation.

### Resume here
1. Start with Issue #8 — document MVP functional and non-functional requirements and acceptance criteria.
2. Then continue Issue #9 — define questionnaire vocabulary, hard constraints versus weighted preferences, and the first transparent scoring approach.
3. Keep Issues #10 and #11 in the backlog until the requirements/recommendation work is ready to support them.
