# BoardGameGeek API Test Matrix

## Purpose

Use a deliberately varied set of games during the BGG API technical spike so the internal data model is tested against different player counts, complexity levels, audiences, play times and game types rather than a handful of similar hobby games.

This is a **technical-spike dataset**, not the final recommendation catalogue.

## Test set

| # | Game | Why it is included |
| --- | --- | --- |
| 1 | Codenames | Light social/party game; team play and larger player counts |
| 2 | Ticket to Ride | Accessible family game and useful mainstream baseline |
| 3 | Wingspan | Medium-weight modern strategy game |
| 4 | Brass: Birmingham | Heavy strategy game; tests high complexity values |
| 5 | Pandemic | Cooperative game; useful for experience/mood mapping |
| 6 | Patchwork | Dedicated two-player game |
| 7 | Under Falling Skies | Solo-focused game; tests one-player suitability |
| 8 | Just One | Large-group party game with very light complexity |
| 9 | My First Carcassonne | Children's game; important for age-appropriateness data |
| 10 | Love Letter | Very short, light game; tests compact play-time ranges |
| 11 | Twilight Imperium: Fourth Edition | Very long, heavy game; stresses play-time and complexity extremes |
| 12 | 7 Wonders | Wider player-count range and simultaneous play |
| 13 | Carcassonne | Older modern classic; useful for comparing mature metadata with newer titles |
| 14 | Wyrmspan | Recent game; checks newer BGG records and modern metadata |
| 15 | Wingspan: European Expansion | Expansion edge case; verifies that expansions can be identified and excluded from normal standalone recommendations |

## What to inspect for every game

The same checks should be performed for all 15 games so results can be compared consistently.

### Identity and classification
- BGG ID
- primary name
- alternative names if relevant
- year published
- item type / subtype
- whether the item is a standalone game or expansion
- links to parent/base games where relevant

### Player information
- publisher minimum players
- publisher maximum players
- community recommended/best player-count poll
- whether community data disagrees materially with the publisher range

### Play time
- playing time
- minimum play time
- maximum play time
- missing or obviously unrealistic values

### Age suitability
- publisher minimum age
- community suggested-age poll
- size of the community response where available
- disagreements between publisher and community age guidance

### Complexity
- community average weight / complexity
- number of complexity votes where available
- missing or low-confidence complexity data

### Style data
- categories
- mechanics
- whether these fields provide enough information to map the game into beginner-friendly styles
- whether they plausibly support derived experience/mood labels

### Quality/supporting statistics
- average rating
- Bayesian average if supplied
- overall/subtype ranking where supplied
- number of ratings
- whether rating data is sufficiently populated to be useful as supporting evidence

### Media
- image URL
- thumbnail URL
- missing-image behaviour

### Data quality and parsing
- optional/missing fields
- unexpected XML nesting or arrays
- values requiring numeric conversion
- entities/escaped characters or unusual title text
- any field that cannot be mapped cleanly into the proposed internal model

## Questions this matrix should answer

After testing the set, we should be able to answer:

1. Does the proposed internal model work across substantially different games?
2. Which fields can be trusted as direct source facts?
3. Which fields need fallbacks, null handling or confidence checks?
4. When should community data supplement publisher data?
5. Can expansions and other non-standalone records be reliably excluded?
6. Are age, play-time and complexity values consistent enough to drive recommendations?
7. Are categories/mechanics rich enough to support our own transparent mood/style mapping?
8. Do newer, older, children's, solo, party and heavy games expose materially different data structures?

## Testing stages

### Stage 1 — API structure validation
Use the 15-game set to validate BGG responses and the internal model.

### Stage 2 — recommendation-engine evaluation
Once the integration is stable, use a larger controlled dataset of at least 30–50 games to test ranking behaviour, edge cases and whether the recommendation logic produces sensible results across varied user scenarios.

### Stage 3 — broader catalogue validation
As caching/importing becomes available, expand beyond the controlled test set and evaluate behaviour across a much larger catalogue.

## Status

Planned. Live testing is blocked until the pending BGG application is approved and an application token can be generated.
