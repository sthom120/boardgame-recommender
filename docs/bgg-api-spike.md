# BoardGameGeek API Technical Spike

## Purpose

This technical spike investigates whether BoardGameGeek (BGG) XML API2 can provide the data required by the Board Game Recommender MVP.

The goals are to:

- verify that the six MVP recommendation inputs can be supported
- understand BGG authentication and API behaviour
- identify which data can be taken directly from BGG
- identify which recommendation concepts require application-owned interpretation
- validate a normalised internal game-data model against varied real records
- identify technical, licensing and data-quality risks before implementation begins

---

## Status

**Core authenticated validation complete.**

The Board Game Recommender was registered with BoardGameGeek as a **public, non-commercial portfolio application** and approved on **26 August 2026**.

Authenticated `/xmlapi2/search` and `/xmlapi2/thing?stats=1` requests were then tested against a deliberately varied **15-record matrix** covering:

- light and party games
- family games
- medium and heavy strategy games
- cooperative games
- fixed two-player and solo games
- large-group games
- children's games
- short and very long games
- older and recent releases
- an expansion edge case

The validation found that BGG can directly supply most structured data required by the MVP. The main recommendation concepts that are **not direct BGG fields** are subjective experience/mood, audience fit, content fit, match strength and explanation text. These must remain application-owned, transparent rules.

The spike also identified several important modelling and integration edge cases, including community poll values outside official player ranges, non-numeric player-count buckets such as `5+`, duplicate exact-title search results, expansion classification, varying community poll sample sizes and a UTF-8/display concern that must be handled during normalisation.

---

# Registration, Authentication and Terms

## Authentication

BGG's XML API usage guidance requires registration and authorization for nearly all XML API use.

The application token is sent using the `Authorization` header:

```text
Authorization: Bearer <application-token>
```

Authenticated requests returned `200 OK` during the spike.

The token must remain server-side and must not be:

- committed to GitHub
- written directly into source code
- included in documentation
- exposed to the frontend

Source:

- https://boardgamegeek.com/using_the_xml_api

---

## Server-Side Requests and Caching

BGG recommends server-side requests and caching to reduce request volume.

Direct browser access would create several problems:

- expose the application token
- tightly couple the frontend to BGG XML
- increase unnecessary external requests
- make retry and throttling behaviour harder to control

The backend should therefore handle:

- BGG authentication
- API requests
- XML parsing
- data validation and normalisation
- caching
- throttling
- retry behaviour

This supports the architecture recorded in ADR 001.

Source:

- https://boardgamegeek.com/using_the_xml_api

---

## Rate Limiting and Temporary Errors

BGG documentation notes that requests made too frequently may receive HTTP `500` or `503` responses and indicates that roughly five seconds between repeated requests may sometimes be necessary.

The production integration should therefore:

- cache relatively slow-changing game data
- batch requests where appropriate
- avoid repeatedly retrieving unchanged records
- avoid aggressive polling
- implement controlled retry/backoff behaviour for temporary failures

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

## Attribution and AI Constraint

A public-facing application using BGG XML API data must provide appropriate **Powered by BGG** attribution and link.

BGG's terms should be reviewed again immediately before public deployment.

A significant future constraint is that current BGG terms prohibit using XML API or site data to train AI or Large Language Model systems. Any future AI-assisted feature will therefore require a separate compliance review and must not assume BGG data can be used for model training.

Sources:

- https://boardgamegeek.com/using_the_xml_api
- https://boardgamegeek.com/wiki/page/XML%20API%20Terms%20of%20Use

---

# API Endpoints Validated

## `/xmlapi2/search`

Used to search BGG records and obtain BGG IDs.

Example:

```text
/xmlapi2/search?query=Wingspan&type=boardgame&exact=1
```

Authenticated exact-title searches succeeded throughout the test matrix.

However, `exact=1` does **not** guarantee one unique result.

Two important examples were found:

- **Patchwork** returned the 2014 primary title plus a 2009 record where `Patchwork` was an alternate title.
- **Love Letter** returned two separate primary-title records, from 2012 and 2019.

Production search resolution must therefore not assume that an exact title uniquely identifies one game.

A sensible resolution strategy is to:

1. prefer an exact **primary-name** match over an alternate-name match
2. if multiple primary-name matches remain, use year/edition or another explicit selection rule
3. prefer known BGG IDs when importing a controlled recommendation catalogue rather than repeatedly resolving titles at runtime

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

## `/xmlapi2/thing?stats=1`

Used to retrieve detailed game records and community statistics.

Example:

```text
/xmlapi2/thing?id=266192&stats=1
```

The authenticated tests confirmed access to fields including:

- primary name and year published
- minimum and maximum players
- playing time, minimum play time and maximum play time
- publisher minimum age
- community suggested player-count polls
- community suggested player-age polls
- categories
- mechanics
- image and thumbnail URLs
- average rating
- Bayesian average rating
- users rated
- rankings
- average community weight / complexity
- relationship links such as expansion/base-game links

The API can retrieve multiple comma-separated IDs, with the current API2 documentation listing a maximum of 20 items in one request.

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

# MVP Data Support

| MVP requirement | Finding | Production interpretation |
| --- | --- | --- |
| Number of players | **Supported** | Official `minplayers`/`maxplayers` provide hard eligibility; community polls provide suitability within that range |
| Available play time | **Supported** | `minplaytime` and `maxplaytime` can be matched to the user's time preference |
| Desired complexity | **Supported** | `averageweight` provides a structured community complexity signal |
| Experience / mood | **Partly supported; derived** | Mechanics/categories provide signals, but mood requires application-owned mapping |
| Game style / mechanics | **Supported** | BGG mechanics can be translated into simpler user-facing style options |
| Age appropriateness | **Supported; interpretation required** | Publisher age and community age poll should both be retained |
| Game image | **Supported** | Image and thumbnail URLs are available |
| Ratings / rankings | **Supported** | Useful as supporting quality evidence, not as the main recommendation criterion |

### Conclusion for the six questionnaire inputs

The six MVP inputs can be supported.

Five have direct or strongly structured BGG evidence. **Experience / mood** is the main input that requires an explicit application-owned interpretation layer rather than a single BGG field.

---

# 15-Record Authenticated Validation Matrix

The detailed test plan is stored in `docs/bgg-test-matrix.md`.

The table below summarises the core values and the main reason each record was useful to the spike.

| Game | BGG ID | Year | Players | Time | Min age | Weight | Main validation finding |
| --- | ---: | ---: | --- | --- | ---: | ---: | --- |
| Codenames | 178900 | 2015 | 2–8 | 15 min | 10 | 1.2533 | 6 players is much stronger than 2–3 despite all being inside official range |
| Ticket to Ride | 9209 | 2004 | 2–5 | 30–60 min | 8 | 1.8184 | Accessible family-game data behaves cleanly; community strongly prefers 4 players |
| Wingspan | 266192 | 2019 | 1–5 | 40–70 min | 10 | 2.4815 | Confirmed core fields, multiple rankings, polls, images and medium complexity |
| Brass: Birmingham | 224517 | 2018 | 2–4 | 60–120 min | 14 | 3.86 | Heavy-strategy end of complexity scale represented clearly |
| Pandemic | 30549 | 2008 | 2–4 | 45 min | 8 | 2.3933 | Mechanic includes Solo/Solitaire despite official minimum of 2; mechanics cannot define hard eligibility |
| Patchwork | 163412 | 2014 | 2 | 15–30 min | 8 | 1.5976 | Fixed two-player record works; exact search also returned an alternate-title match |
| Under Falling Skies | 306735 | 2020 | 1 | 20–40 min | 12 | 2.3904 | Fixed solo record works; community poll still includes a `1+` bucket |
| Just One | 254640 | 2018 | 3–7 | 20–60 min | 8 | 1.0327 | Very light game; 6–7 players strongly preferred; cooperative/word mechanics are useful signals |
| My First Carcassonne | 41010 | 2009 | 2–4 | 10–20 min | 4 | 1.1265 | Children's age data behaves sensibly and community voting can differ slightly from publisher age |
| Love Letter | 129622 | 2012 | 2–4 | 20 min | 10 | 1.1842 | Community strongly prefers 4; age poll peaks at 8; same exact primary title exists for another edition |
| Twilight Imperium: Fourth Edition | 233078 | 2017 | 3–6 | 240–480 min | 14 | 4.3625 | Extreme long/heavy record represented correctly; 6 players strongest |
| 7 Wonders | 68448 | 2010 | 2–7 | 30 min | 10 | 2.3145 | 4–5 strongest; 2 is officially valid but community opinion is poor |
| Carcassonne | 822 | 2000 | 2–5 | 30–45 min | 7 | 1.8838 | 2–3 strongest; community age peaks at 8 while publisher minimum is 7 |
| Wyrmspan | 410201 | 2024 | 1–5 | 90 min | 14 | 2.8337 | Recent record works; poll sample is much smaller and community age peaks at 12 |
| Wingspan: European Expansion | 290448 | 2019 | 1–5 | 40–70 min | 10 | 2.4345 | Expansion looks like a normal `boardgame` record; relationship links are required to exclude it from standalone recommendations |

The matrix provides enough variation to validate the shape of the integration model. It is **not** intended to prove recommendation quality; that requires a larger dataset later.

---

# Cross-Game Findings

## 1. Official Player Range Is Eligibility, Not Suitability

Across multiple games, the community poll showed large differences between player counts that are all technically valid.

Examples:

- Codenames officially supports 2–8, but community opinion strongly favours 6 and is poor at 2–3.
- 7 Wonders officially supports 2–7, but 4–5 are clearly stronger and 2 performs poorly.
- Love Letter officially supports 2–4, but 4 is overwhelmingly the strongest configuration.
- Carcassonne officially supports 2–5, but 2–3 are strongest and 5 is substantially weaker.

The recommendation engine should therefore use:

- official `minplayers` and `maxplayers` as **hard eligibility boundaries**
- community player-count polls as a **suitability signal within those boundaries**

A poll must never widen the official playable range.

This is important because poll data can include values outside or beyond that range. For example:

- Pandemic has official minimum 2 but includes a community poll row for 1 player.
- Under Falling Skies is officially 1 player but includes a `1+` poll bucket.

---

## 2. Player-Count Poll Values Must Be Strings

BGG player polls contain values such as:

```text
1+
2+
4+
5+
6+
7+
8+
```

The normalised model must therefore store the poll's `players` value as a **string**, not an integer.

These open-ended buckets should be preserved as source data but should not be used to override official `minplayers`/`maxplayers`.

---

## 3. Community Polls Need Proportional Scoring and Confidence

Raw vote totals vary greatly between records because popular older games have far more community responses than newer or less widely rated games.

For example, Wyrmspan's player and age polls contain far fewer votes than long-established games such as Carcassonne, Codenames or Ticket to Ride.

Future suitability scoring should therefore avoid comparing raw vote counts across games.

A better approach is likely to use:

- proportions within each player-count row, such as Best / total and Recommended / total
- total votes as a confidence or evidence-strength signal
- a minimum-evidence rule or smoothing strategy for very small samples

The exact scoring formula belongs in the recommendation-design work rather than this integration spike.

---

## 4. Publisher Age and Community Age Are Different Signals

The tests show that publisher minimum age and community suggested age often agree, but not always.

Examples:

- Ticket to Ride: publisher 8 and community peak 8
- Brass: Birmingham: publisher 14 and community peak 14
- Wingspan: publisher 10 and community peak 10, with substantial support for 8
- Love Letter: publisher 10 while community peak is 8
- Carcassonne: publisher 7 while community peak is 8
- Wyrmspan: publisher 14 while community peak is 12

Neither value should silently replace the other.

The normalised record should preserve:

- publisher minimum age as a source fact
- the complete community age poll
- any derived community-age summary as a clearly application-derived value

Age eligibility also remains different from broader **audience fit**. BGG data alone cannot determine whether a technically age-appropriate game is the best recommendation for a specific mixed group.

---

## 5. `averageweight` Is Useful for Complexity

The test matrix produced a sensible spread from very light to very heavy games:

- Just One: `1.0327`
- My First Carcassonne: `1.1265`
- Love Letter: `1.1842`
- Ticket to Ride: `1.8184`
- Wingspan: `2.4815`
- Wyrmspan: `2.8337`
- Brass: Birmingham: `3.86`
- Twilight Imperium: Fourth Edition: `4.3625`

This supports using `averageweight` as the primary structured complexity signal.

The frontend should not expose the BGG term **weight** to casual users. Recommendation-design work will map ranges to plain-language questionnaire choices such as:

- Light and easy
- Some strategy
- Moderately challenging
- Deep and challenging

The final thresholds still require separate testing.

---

## 6. Mechanics Are Strong Signals, But Not Hard Rules

BGG mechanics are useful source data for translating technical concepts into the questionnaire's plain-language game styles.

Examples found during the matrix include:

- `Set Collection`, `Open Drafting`, `Hand Management` → useful evidence for collecting/building and planning/resource-oriented play
- `Cooperative Game` → strong evidence for cooperative experience
- `Deduction` → useful evidence for solving/figuring things out
- `Team-Based Game` and `Word Game` → useful evidence for social/word-oriented games
- `Network and Route Building`, `Market`, `Loans`, `Income` and `Tech Trees / Tech Tracks` → strong evidence for strategic planning/resource management

However, mechanics must not define hard eligibility.

Pandemic demonstrates this clearly: BGG lists `Solo / Solitaire Game` as a mechanic while the official player range is 2–4.

Therefore:

- official player range controls hard player eligibility
- mechanics/categories contribute to preference scoring and explanation
- subjective mood remains derived from multiple signals rather than a one-to-one mechanic mapping

---

## 7. Categories Often Describe Theme More Than Play Style

Categories such as:

- Trains
- Animals
- Fantasy
- Medieval
- Medical
- Spies / Secret Agents

are useful for theme and context, but frequently say less about what players actually do.

For Q5 game-style mapping, mechanics are generally the stronger source.

Categories may still help with theme, immersive experience and future filtering.

---

## 8. Expansions Require Explicit Classification

The expansion test produced an important edge case.

**Wingspan: European Expansion (BGG ID 290448)** is returned as a normal top-level `boardgame` item and contains plausible player, time, age, weight and mechanic data.

A recommender that checks only item type and normal game fields could therefore accidentally recommend an expansion as though it were a standalone game.

Expansion/base-game relationships are exposed through `boardgameexpansion` links. In the tested record, inbound expansion links identified more than one compatible/base game relationship.

The internal model should therefore use a structure such as:

```js
classification: {
  isExpansion: true,
  baseGames: [
    { bggId: 266192, name: "Wingspan" },
    { bggId: 366161, name: "Wingspan Asia" }
  ]
}
```

`baseGames` must be an array rather than a single `baseGameId`.

For the MVP, expansion records should be **excluded from normal recommendation candidates** unless expansion support is deliberately added later.

---

## 9. Exact Search Needs Resolution Logic

Authenticated search testing showed two different ambiguity types:

### Alternate-title collision

Searching `Patchwork` exactly returned:

- BGG 163412 — 2014, primary title `Patchwork`
- BGG 41585 — 2009, `Patchwork` as an alternate title

A resolver should prefer the exact primary-name match.

### Multiple primary editions

Searching `Love Letter` exactly returned:

- BGG 129622 — 2012, primary title `Love Letter`
- BGG 277085 — 2019, primary title `Love Letter`

Primary-name preference alone cannot distinguish these records.

The resolver therefore needs edition/year context or another explicit catalogue-selection rule.

---

## 10. UTF-8 / Display Handling Needs Validation

During the expansion inspection, one linked title containing an en dash displayed in Windows PowerShell as `â€“`.

This should be treated as an **encoding/display concern**, not automatically as proof that BGG supplied corrupted text.

The production Node/XML normalisation layer should explicitly handle UTF-8 and include a parser test containing non-ASCII punctuation or characters.

---

# Source Data vs Application-Derived Data

A core design boundary emerged from the spike.

## BGG source facts

The normalised BGG integration layer may preserve facts/evidence such as:

- game identity
- year published
- official player range
- player-count community poll
- play-time values
- publisher minimum age
- community age poll
- average weight
- categories
- mechanics
- images
- ratings
- rankings
- expansion relationships

## Application-derived concepts

The recommendation layer should calculate concepts such as:

- player-count suitability score
- community-age summary
- plain-language game-style mappings
- social / relaxed / competitive / strategic / cooperative / immersive / chaotic mood signals
- beginner-friendly labels
- audience fit
- content fit
- match score or match band
- recommendation explanations
- caveats / "good to know" text

Derived values should not be stored or presented as though they were facts supplied directly by BGG.

This separation makes the recommendation behaviour easier to explain and test.

---

# Refined Internal Game-Data Model

The rest of the application should not consume raw BGG XML.

The BGG integration layer should transform each response into predictable application-owned JSON while preserving important source evidence.

Illustrative model:

```js
{
  bggId: 266192,
  name: "Wingspan",
  yearPublished: 2019,

  classification: {
    isExpansion: false,
    baseGames: []
  },

  players: {
    min: 1,
    max: 5,
    communityPoll: [
      {
        players: "1",
        best: 116,
        recommended: 848,
        notRecommended: 395
      },
      {
        players: "2",
        best: 636,
        recommended: 1165,
        notRecommended: 103
      },
      {
        players: "3",
        best: 1250,
        recommended: 606,
        notRecommended: 26
      }
    ]
  },

  playTime: {
    minMinutes: 40,
    maxMinutes: 70,
    playingTime: 70
  },

  age: {
    publisherMinimum: 10,
    communityPoll: [
      { age: "8", votes: 165 },
      { age: "10", votes: 224 },
      { age: "12", votes: 84 }
    ]
  },

  complexity: {
    averageWeight: 2.4815
  },

  categories: [],
  mechanics: [],

  rating: {
    average: 7.99493,
    bayesAverage: 7.84153,
    usersRated: 114991
  },

  rankings: [
    {
      name: "boardgame",
      friendlyName: "Board Game Rank",
      value: 38
    },
    {
      name: "strategygames",
      friendlyName: "Strategy Game Rank",
      value: 49
    },
    {
      name: "familygames",
      friendlyName: "Family Game Rank",
      value: 6
    }
  ],

  media: {
    imageUrl: null,
    thumbnailUrl: null
  },

  source: {
    provider: "BoardGameGeek",
    fetchedAt: null
  }
}
```

The example arrays are shortened for readability. Production normalisation should retain the complete useful poll and ranking records.

Important model decisions from the 15-record test are:

- player poll `players` is a **string**
- preserve the full useful player-count poll rather than only a `communityBest` value
- preserve the community age poll rather than replacing publisher age
- rankings are a collection rather than one universal rank
- expansion classification is explicit
- `baseGames` is an array
- source facts remain separate from recommendation-derived values

---

# Normalisation Rules Identified by the Spike

The integration layer should apply rules such as:

1. Parse BGG XML only inside the backend integration layer.
2. Validate required identifiers and safely handle absent optional values.
3. Convert numeric source attributes to numbers only when they are genuinely numeric.
4. Preserve poll player-count labels such as `5+` as strings.
5. Preserve complete community vote counts needed for later proportional scoring.
6. Treat official `minplayers`/`maxplayers` as the hard player-range boundary.
7. Do not infer hard player eligibility from mechanics or community poll rows.
8. Preserve publisher age and community age evidence separately.
9. Preserve ranking records as a collection and safely handle missing or non-numeric ranking values such as `N/A`.
10. Inspect relationship links to classify expansions and compatible/base games.
11. Normalise text as UTF-8 and test non-ASCII characters.
12. Attach a `fetchedAt` timestamp so cache age can be evaluated.

---

# Architecture Decision Supported by the Spike

ADR 001 is stored at:

```text
docs/adr/001-normalise-bgg-data.md
```

The decision is:

> All BGG requests should be handled by a dedicated backend integration layer that authenticates with BGG, retrieves XML, parses and validates the response, and converts it into an application-owned JSON model.

The 15-record authenticated validation strongly supports this decision.

Proposed direction:

```text
User
  |
  v
React / Vite frontend
  |
  v
Our Node / Express API
  |
  +-------------------------------+
  |                               |
  v                               v
Recommendation service       BGG integration service
                                  |
                                  +--> Authentication
                                  +--> XML parsing
                                  +--> Validation / normalisation
                                  +--> Cache
                                  +--> Retry / throttling
                                  |
                                  v
                           BGG XML API2
```

The frontend and recommendation service should depend on the internal JSON contract rather than BGG's XML structure.

---

# Remaining Risks and Follow-Up Work

The spike has answered the architecture-level questions required to proceed, but it deliberately does not solve every recommendation or production concern.

The following belong in later work:

- define exact `averageweight` thresholds for the four user-facing complexity choices
- define player-poll suitability formula and confidence handling
- define mappings from BGG mechanics/categories to plain-language Q4/Q5 choices
- decide which mood/content classifications require application-owned metadata
- define cache duration and retry/backoff policy
- implement and test UTF-8 XML parsing in Node
- test safe handling of missing/null/`N/A` optional values during parser implementation
- determine whether a controlled BGG-ID catalogue is preferable to runtime title resolution for the MVP
- evaluate recommendation quality using a larger controlled set of approximately 30–50+ games
- review BGG attribution and terms again before public deployment
- perform a separate compliance review before any future AI-assisted functionality

These are not blockers to beginning requirements, architecture and recommendation-design work because the source-data boundary and integration strategy are now clear.

---

# Testing Scale Going Forward

The project deliberately separates integration testing from recommendation-quality evaluation.

## API connectivity

A small set of records is sufficient to demonstrate endpoint access.

## Data-model validation

The completed **15 deliberately varied records** provide the current technical-spike evidence for the integration model.

## Recommendation-engine evaluation

A larger controlled dataset of approximately:

```text
30–50+ games
```

will be used later to determine whether recommendation behaviour is sensible across different questionnaire combinations.

A successful API integration should not be mistaken for proof that the recommendation algorithm is effective.

---

# Technical Spike Conclusion

The authenticated BGG XML API2 validation supports proceeding with the Board Game Recommender MVP.

The spike confirms that BGG can provide the key structured source data required for:

- player eligibility and player-count suitability evidence
- play-time matching
- complexity matching
- age evidence
- mechanics and categories
- images
- ratings and rankings

The API does **not** directly provide the complete subjective recommendation experience. Mood, audience fit, content fit, match strength and explanations must be derived by the application using transparent rules.

The most important implementation consequence is that BGG should be treated as a **source-data provider**, not as the recommendation engine itself.

A backend BGG integration layer will authenticate, retrieve XML, normalise it into an application-owned model and preserve the evidence required by the recommendation service. The recommendation service can then apply explicit, testable rules without coupling the rest of the application to BGG's raw XML format.

The 15-record validation uncovered enough edge cases to refine the model before implementation, particularly around player-count polls, age evidence, expansion detection, search ambiguity and poll confidence.

**Technical-spike outcome: suitable to proceed, with identified follow-up risks documented for implementation and recommendation-design phases.**
