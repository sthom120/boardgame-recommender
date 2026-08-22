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
