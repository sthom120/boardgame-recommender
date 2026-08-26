# BoardGameGeek API Technical Spike

## Purpose

This technical spike investigates whether BoardGameGeek (BGG) XML API2 can provide the data required by the Board Game Recommender MVP.

The goals are to:

- verify that the six MVP recommendation inputs can be supported
- understand BGG authentication and API behaviour
- identify which data can be taken directly from BGG
- identify which recommendation concepts require application-owned interpretation
- establish a safe and maintainable integration approach
- identify technical, licensing and data-quality risks before implementation begins

---

## Current Status

The Board Game Recommender was registered with BoardGameGeek as a **public, non-commercial portfolio application**.

The application was **approved by BoardGameGeek on 26 August 2026**.

An application token has been generated and authenticated API testing has begun successfully.

Initial authenticated testing using **Wingspan (BGG ID 266192)** has confirmed that:

- authentication using a Bearer token works
- `/xmlapi2/search` works for exact game-title lookup
- `/xmlapi2/thing?stats=1` returns the expected detailed game data
- player counts, play time, age, complexity, mechanics, categories, images, ratings and rankings are available
- community polls provide additional information about recommended player counts and suggested player age

The next stage of the technical spike is to repeat the same inspection across the full 15-game test matrix to identify edge cases and data inconsistencies.

---

# Initial Findings

## Registration and Authorization

BoardGameGeek's XML API usage guide states that registration and authorization are required for nearly all XML API use.

Applications are registered through the BGG applications page. Once approved, an application token can be created and sent with requests using the `Authorization` header.

Example authentication structure:

```text
Authorization: Bearer <application-token>
```

The Board Game Recommender application was approved on **26 August 2026**, and authenticated requests have now been successfully completed.

The application token is treated as a secret and must not be:

- committed to GitHub
- written directly into source code
- included in documentation
- exposed to the frontend

Source:

- https://boardgamegeek.com/using_the_xml_api

---

## Server-Side Requests and Caching

BGG recommends that applications make requests from their own servers where possible and cache results to reduce request volume.

Making BGG requests directly from the browser would:

- expose the application token
- increase unnecessary external traffic
- tightly couple the frontend to BGG's XML format
- make caching and retry behaviour more difficult to control

This supports an architecture where the frontend communicates with the application's own backend.

The backend will be responsible for:

- BGG authentication
- API requests
- XML parsing
- data normalisation
- caching
- throttling
- retry behaviour

Source:

- https://boardgamegeek.com/using_the_xml_api

---

## API Format

BGG XML API2 returns **XML rather than JSON**.

The production application will therefore require an XML parsing layer.

Raw BGG XML should not be passed directly through the rest of the application. Instead, BGG responses should be transformed into a predictable internal JSON structure.

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

## Rate Limiting and Throttling

BGG states that requests sent too frequently may receive HTTP `500` or `503` responses.

The current XML API2 documentation indicates that approximately five seconds between requests may be necessary when making repeated requests.

The application should therefore:

- minimise unnecessary external requests
- cache game data
- batch requests where appropriate
- avoid repeatedly retrieving unchanged game records
- implement controlled retry behaviour
- avoid aggressive automatic polling

This will be tested further during the multi-game API validation.

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

# API Endpoints

## Search Endpoint

The `/xmlapi2/search` endpoint searches the BGG database by name.

It supports:

- searching by game title
- filtering by item type
- exact title matching using `exact=1`

Likely production use:

1. search for a game by name
2. obtain its BGG ID
3. retrieve the detailed record using `/thing`

Example:

```text
/xmlapi2/search?query=Wingspan&type=boardgame&exact=1
```

Authenticated testing of this endpoint has now been successful.

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

## Thing Endpoint

The `/xmlapi2/thing` endpoint provides detailed information about BGG items.

Using:

```text
stats=1
```

adds rating and ranking statistics.

The API supports retrieving multiple comma-separated IDs, with the current documentation listing a maximum of 20 items per request.

Useful returned data includes:

- minimum and maximum players
- playing time
- minimum play time
- maximum play time
- publisher minimum age
- community suggested player-count polls
- community suggested player-age polls
- categories
- mechanics
- images
- thumbnails
- ratings
- Bayesian ratings
- number of ratings
- rankings
- community complexity / weight

Example:

```text
/xmlapi2/thing?id=266192&stats=1
```

Authenticated testing using Wingspan returned `200 OK` and confirmed these structures are available in practice.

Source:

- https://boardgamegeek.com/wiki/page/BGG_XML_API2

---

# Attribution and Terms

Public-facing applications using BGG XML API data must provide appropriate BoardGameGeek attribution.

The production application will need to include the required **Powered by BGG** attribution and link.

BGG's terms should be reviewed again before public deployment.

A significant future constraint is that BGG's current terms prohibit using XML API or site data to train an AI or Large Language Model system.

Therefore, any future AI functionality must **not train a model using BGG data**.

Possible future AI-assisted functionality would require a separate compliance review before implementation.

Sources:

- https://boardgamegeek.com/using_the_xml_api
- https://boardgamegeek.com/wiki/page/XML%20API%20Terms%20of%20Use

---

# MVP Field Investigation

| Requirement | Current finding | Notes |
| --- | --- | --- |
| Number of players | **Confirmed** | `minplayers`, `maxplayers` and community player-count polls are available |
| Available play time | **Confirmed** | `playingtime`, `minplaytime` and `maxplaytime` returned successfully |
| Desired complexity | **Confirmed** | Community `averageweight` returned through `stats=1` |
| Experience / mood | **Derived rather than direct** | Requires application-owned mapping from mechanics, categories and other game characteristics |
| Game style / mechanics | **Confirmed** | `boardgamemechanic` and `boardgamecategory` links returned successfully |
| Age appropriateness | **Confirmed, interpretation required** | `minage` and community suggested-player-age poll are available |
| Game image | **Confirmed** | Image and thumbnail fields returned successfully |
| Ratings / rankings | **Confirmed** | Ratings and multiple ranking records returned using `stats=1` |

The structured inputs needed by the MVP are therefore strongly supported by BGG.

The main exception is **experience / mood**, which is not a direct BGG field and will require transparent application-owned interpretation.

---

# Interpretation of the Six MVP Inputs

## 1. Number of Players

BGG provides:

- publisher minimum players
- publisher maximum players
- community voting for individual player counts

The community data appears particularly valuable.

A game being technically playable at a certain player count does not necessarily mean it is particularly good at that count.

The recommender should eventually distinguish between:

- playable
- recommended
- especially strong

for the selected number of players.

---

## 2. Available Play Time

BGG provides:

- `minplaytime`
- `maxplaytime`
- `playingtime`

The recommender can use the minimum and maximum values to compare games against the user's selected time range.

Further multi-game testing is required to determine how reliable publisher play-time estimates are across different types of games.

---

## 3. Desired Complexity

BGG provides the community statistic:

```text
averageweight
```

This can be used internally as the main structured complexity signal.

The application should not expose the term **weight** to casual users without explanation.

Instead, numerical weight ranges can later be mapped to plain-language options such as:

- Light and easy
- Some strategy
- Moderately challenging
- Deep and challenging

The exact thresholds will be designed and tested separately in the recommendation-engine work.

---

## 4. Experience / Mood

BGG does not provide one direct field describing how a game feels to play.

The project's questionnaire currently includes experiences such as:

- Social & lively
- Relaxed & easy-going
- Competitive
- Strategic & thoughtful
- Cooperative
- Immersive & thematic
- Funny, silly & chaotic

These concepts will require a transparent mapping layer using information such as:

- mechanics
- categories
- player interaction
- cooperative mechanics
- theme
- application-owned tags where BGG data is insufficient

This should remain separate from raw BGG data.

---

## 5. Game Style / Mechanics

BGG provides structured mechanics and categories.

These are useful for recommendation logic but frequently use terminology unfamiliar to the target user.

For example:

```text
Set Collection
Hand Management
Open Drafting
```

may contribute internally to user-facing categories such as:

- Collecting & building
- Planning & managing resources

The application should retain BGG's technical mechanic names internally while presenting simpler language to the user.

---

## 6. Age Appropriateness

BGG provides:

- publisher minimum age
- community suggested-player-age voting

These can help determine **age eligibility**.

However, age eligibility is not the same as **audience fit**.

For example, a game may be technically suitable for a 10-year-old but still be a better recommendation for:

- a mixed family group aged 10–70

than:

- a group consisting entirely of 10-year-olds

Audience fit will therefore require application-owned recommendation rules in addition to BGG age data.

---

# Proposed Internal Game-Data Model

The rest of the application should not consume raw BGG XML.

The BGG integration layer should transform each response into an application-owned structure.

The initial model should remain close to source facts.

Derived concepts such as:

- mood
- beginner-friendly labels
- match strength
- audience fit
- explanation text

should be calculated separately.

An updated illustrative structure is:

```js
{
  bggId: 266192,
  name: "Wingspan",
  yearPublished: 2019,

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
    communitySuggested: 10,

    communityPoll: [
      {
        age: "8",
        votes: 165
      },
      {
        age: "10",
        votes: 224
      },
      {
        age: "12",
        votes: 84
      }
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

The arrays above are illustrative rather than exhaustive.

For example, the complete player-count and age poll records would be preserved when the data is normalised.

---

## Why This Separation Matters

Keeping raw source facts separate from recommendation logic provides several advantages:

- the frontend receives predictable JSON instead of BGG-specific XML
- XML parsing remains isolated in the BGG integration layer
- BGG field-name changes affect fewer parts of the application
- source facts remain distinguishable from application-derived judgements
- recommendation rules can be tested independently
- cached records can use the same internal structure as freshly retrieved records
- the recommendation engine can evolve without changing the external integration

This decision is documented separately in:

```text
docs/adr/001-normalise-bgg-data.md
```

---

# Authenticated Validation — Wingspan

Authenticated testing began after BoardGameGeek approved the application on **26 August 2026**.

Wingspan was selected as the first validation game.

BGG ID:

```text
266192
```

---

## Search Endpoint Test

Request:

```text
/xmlapi2/search?query=Wingspan&type=boardgame&exact=1
```

Result:

```text
HTTP 200 OK
```

Returned identity data:

| Field | Value |
| --- | --- |
| BGG ID | 266192 |
| Type | boardgame |
| Primary name | Wingspan |
| Year published | 2019 |

This confirms that authenticated `/search` requests work as expected for exact board-game title lookup.

---

## Thing Endpoint Test

Request:

```text
/xmlapi2/thing?id=266192&stats=1
```

Result:

```text
HTTP 200 OK
```

Key fields returned:

| Field | Value |
| --- | ---: |
| BGG ID | 266192 |
| Name | Wingspan |
| Minimum players | 1 |
| Maximum players | 5 |
| Minimum play time | 40 minutes |
| Maximum play time | 70 minutes |
| Playing time | 70 minutes |
| Publisher minimum age | 10 |
| Average rating | 7.99493 |
| Bayesian average | 7.84153 |
| Average weight | 2.4815 |
| Users rated | 114991 |

This confirms that the main structured fields proposed for the internal data model are present in an authenticated response.

---

## Categories

BGG returned the following categories:

- Animals
- Card Game
- Educational
- Environmental

Categories appear to describe theme and broad classification rather than necessarily describing the actions performed by players.

They should therefore not automatically be treated as mechanics or play style.

---

## Mechanics

BGG returned:

- Action Queue
- Dice Rolling
- End Game Bonuses
- Hand Management
- Once-Per-Game Abilities
- Open Drafting
- Set Collection
- Solo / Solitaire Game
- Turn Order: Progressive

This supports the planned approach of treating BGG mechanics as raw technical source data and translating them into simpler user-facing concepts.

For example:

```text
Set Collection
Hand Management
Open Drafting
```

could contribute to categories such as:

```text
Collecting & building
Planning & managing resources
```

The mapping rules will be documented separately when the recommendation engine is designed.

---

## Images

The detailed Wingspan response included:

- an image URL
- a thumbnail URL

This confirms that BGG can supply the visual assets required for MVP recommendation cards.

The application should store these as external source URLs rather than embedding image data in the normalised record.

---

## Rankings

BGG returned multiple ranking records rather than one universal ranking:

| Ranking | Value |
| --- | ---: |
| Board Game Rank | 38 |
| Strategy Game Rank | 49 |
| Family Game Rank | 6 |

The internal data model should therefore support a collection of rankings rather than a single `rank` property.

Rankings may be useful as supporting quality information.

However, rankings should not automatically determine recommendation order because the purpose of the application is to identify the **best fit for the user's situation**, not simply the highest-ranked BGG games.

---

# Community Player-Count Validation

BGG returned community voting for different Wingspan player counts.

| Players | Best | Recommended | Not Recommended |
| ---: | ---: | ---: | ---: |
| 1 | 116 | 848 | 395 |
| 2 | 636 | 1165 | 103 |
| 3 | 1250 | 606 | 26 |
| 4 | 556 | 946 | 243 |
| 5 | 54 | 567 | 878 |
| 5+ | 3 | 32 | 1048 |

This is significantly more informative than the publisher minimum and maximum values alone.

Wingspan technically supports:

```text
1–5 players
```

However, the poll shows major differences in community opinion across that range.

### Three players

Three players received:

- 1250 Best votes
- 606 Recommended votes
- only 26 Not Recommended votes

This is the strongest player-count result.

### Two players

Two players also performs very strongly:

- 636 Best
- 1165 Recommended
- 103 Not Recommended

### Four players

Four players remains well supported:

- 556 Best
- 946 Recommended
- 243 Not Recommended

### Five players

Five players is technically supported but receives much weaker community feedback:

- 54 Best
- 567 Recommended
- 878 Not Recommended

This demonstrates why the recommender should not rely on publisher player limits alone.

A future scoring model may distinguish between:

1. **Playable** — the selected player count is inside the publisher range.
2. **Recommended** — community data indicates the game works well at that count.
3. **Excellent fit** — the player count is one of the game's strongest configurations.

The BGG integration layer should therefore preserve enough community-poll data to support this interpretation rather than immediately reducing the information to a single `communityBest` value.

---

# Community Suggested-Age Validation

Wingspan's publisher minimum age is:

```text
10
```

BGG community voting returned:

| Suggested age | Votes |
| --- | ---: |
| 2 | 0 |
| 3 | 0 |
| 4 | 0 |
| 5 | 2 |
| 6 | 13 |
| 8 | 165 |
| 10 | 224 |
| 12 | 84 |
| 14 | 8 |
| 16 | 0 |
| 18 | 0 |
| 21 and up | 0 |

Age `10` received the largest number of votes.

This agrees with the publisher minimum age.

However, there is also substantial support for age `8`.

This suggests that community age data may provide useful additional context when assessing whether younger players can realistically understand a game.

It should not automatically replace the publisher age.

Instead, the model should retain both.

For Wingspan:

```js
age: {
  publisherMinimum: 10,
  communitySuggested: 10
}
```

---

## Age Eligibility vs Audience Fit

The BGG age poll appears useful for answering:

> Can players of approximately this age reasonably understand and play the game?

It does not fully answer:

> Is this game particularly enjoyable for this specific group?

For example, the API alone cannot determine whether Wingspan is a better recommendation for:

- a group entirely composed of 10-year-olds
- a mixed family group aged 10–70
- experienced adult hobby gamers

The recommender must therefore distinguish between:

### Age eligibility

Whether the youngest player can realistically understand and participate in the game.

### Audience fit

Whether the game is likely to suit the interests and situation of the entire group.

Audience fit will require transparent application-owned recommendation rules.

---

# Initial Authenticated Validation Outcome

The Wingspan test confirms that BGG can directly supply a substantial portion of the proposed internal model.

Confirmed fields include:

- game identity
- year published
- player range
- community player-count suitability
- minimum play time
- maximum play time
- general playing time
- publisher minimum age
- community suggested age
- complexity / weight
- categories
- mechanics
- image
- thumbnail
- average rating
- Bayesian average
- number of ratings
- overall rankings
- category-specific rankings

This strongly supports the existing decision to normalise BGG XML into an application-owned JSON structure before data enters the recommendation engine.

However, one successful game is not sufficient to establish that the data model is robust.

Further testing is required across games with different structures and edge cases.

---

# Data Still Requiring Application-Owned Interpretation

The API investigation has identified an important boundary between **source data** and **recommendation logic**.

## BGG can provide source facts such as:

- players
- play time
- minimum age
- complexity
- mechanics
- categories
- community polls
- ratings
- rankings

## The application will need to derive concepts such as:

- social
- relaxed
- competitive
- strategic
- cooperative
- funny / silly / chaotic
- beginner-friendly
- audience fit
- match strength
- recommendation explanation
- useful caveats

These derived concepts should remain transparent and testable.

They should not be stored as though they were facts supplied directly by BoardGameGeek.

---

# Questions Still to Answer

The remaining technical-spike questions include:

- How consistent are these fields across all 15 test games?
- How does BGG represent expansions compared with standalone games?
- How should missing or null values be handled?
- Are publisher play-time values reliable enough for recommendation scoring?
- Are age values consistent across children's, family and hobby games?
- How should community player-count voting be converted into a suitability score?
- Should community recommended player counts supplement rather than override publisher limits?
- How should `averageweight` values map to the application's four plain-language complexity levels?
- How should BGG mechanics map to plain-language play-style options?
- Which mechanics and categories can reliably indicate mood?
- Which mood/content classifications require application-owned metadata?
- What information should be treated as a hard eligibility rule?
- What information should be treated as a weighted preference?
- How long should relatively slow-changing BGG records remain cached?
- What retry strategy should be used after a temporary `500` or `503` response?
- How should `"N/A"` or other non-numeric ranking values be normalised?
- How should community polls with very small numbers of votes be treated?
- How should different language editions or duplicate title results be handled?
- What BGG data identifies expansions and their parent/base games?
- Do BGG's terms create restrictions around calculated match scores or derived summaries that require additional clarification?
- What future AI-assisted functionality, if any, would remain compliant with BGG's restrictions?

---

# Multi-Game Test Matrix

The technical spike uses a deliberately varied set of 15 games.

The purpose is not to evaluate recommendation quality yet.

The purpose is to test whether the API integration and internal data model can handle different kinds of BGG records.

| # | Game | Reason for inclusion |
| ---: | --- | --- |
| 1 | Codenames | Light/social/party game and larger team play |
| 2 | Ticket to Ride | Accessible family game |
| 3 | Wingspan | Medium strategy game and initial authenticated validation |
| 4 | Brass: Birmingham | Heavy/high-complexity strategy game |
| 5 | Pandemic | Cooperative game |
| 6 | Patchwork | Dedicated two-player game |
| 7 | Under Falling Skies | Solo-focused game |
| 8 | Just One | Large-group/light game |
| 9 | My First Carcassonne | Children's game |
| 10 | Love Letter | Very short/light game |
| 11 | Twilight Imperium: Fourth Edition | Very long/heavy game |
| 12 | 7 Wonders | Wider player-count game with simultaneous play |
| 13 | Carcassonne | Older modern classic |
| 14 | Wyrmspan | Recent game |
| 15 | Wingspan: European Expansion | Expansion edge case |

The detailed checklist is documented separately in:

```text
docs/bgg-test-matrix.md
```

---

# Multi-Game Inspection Checklist

For each game, inspect:

## Identity and Classification

- BGG ID
- primary name
- year published
- item type
- standalone game vs expansion
- parent/base game relationship where available

## Player Information

- minimum players
- maximum players
- suggested player-count poll
- unusual player-count values
- number of community votes

## Time

- playing time
- minimum play time
- maximum play time
- missing or unusual values

## Age

- publisher minimum age
- community suggested-age poll
- vote distribution
- missing or contradictory values

## Complexity

- average weight
- number of complexity votes where available
- missing or unusual values

## Classification

- categories
- mechanics
- other useful structured links

## Ratings and Rankings

- average rating
- Bayesian average
- users rated
- overall rank
- family/category ranks
- `"N/A"` or missing rank values

## Media

- image
- thumbnail

## Data Quality

- missing values
- null values
- unexpected XML nesting
- escaped characters
- duplicate or alternate names
- conversion problems
- fields not currently represented by the internal model

---

# Testing Scale

The project separates API-model testing from recommendation-quality testing.

## API connectivity

Approximately:

```text
5 games
```

is enough to demonstrate that basic endpoint access works.

## Data-model validation

Approximately:

```text
12–15 deliberately varied games
```

is appropriate for identifying most obvious integration and modelling issues.

## Recommendation-engine evaluation

A larger controlled dataset of approximately:

```text
30–50+ games
```

will later be used to determine whether the recommendation logic behaves sensibly across different preference combinations.

This avoids treating a technically successful API integration as evidence that the recommendation algorithm itself is effective.

---

# Proposed Architecture

The current integration direction is:

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
                                  |
                                  +--> XML parsing
                                  |
                                  +--> Normalisation
                                  |
                                  +--> Cache
                                  |
                                  +--> Retry / throttling
                                  |
                                  v
                           BGG XML API2
```

The frontend and recommendation engine should not depend directly on BGG's XML format.

This architecture remains subject to refinement as the technical spike continues, but authenticated testing so far supports the approach.

---

# Architecture Decision

The current architecture decision is documented in:

```text
docs/adr/001-normalise-bgg-data.md
```

The decision is:

> All BGG requests should be handled by a dedicated backend integration layer that authenticates with BGG, retrieves XML, parses and validates the response, and converts it into an application-owned JSON model.

The authenticated Wingspan test provides the first live evidence supporting this decision.

---

# Next Steps

1. Repeat authenticated `/search` and `/thing?stats=1` testing across the remaining games in the 15-game matrix.
2. Record missing, unusual or inconsistent data.
3. Test the expansion record deliberately.
4. Refine the internal game-data model where required.
5. Define how community player-count polls should be normalised.
6. Decide how community age information should be represented.
7. Identify which mood and content classifications require application-owned metadata.
8. Confirm XML parsing requirements using multiple response structures.
9. Finalise the technical-spike findings.
10. Close Issue #3 once the remaining acceptance criteria are satisfied.

---

# Status

**In progress.**

BoardGameGeek application approval has been received and authenticated XML API2 access has been successfully validated.

The first detailed test using Wingspan confirms strong support for most structured MVP recommendation inputs.

The remaining work is to validate these findings across the full 15-game test matrix, identify edge cases and refine the internal model before the technical spike is considered complete.