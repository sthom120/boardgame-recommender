# Internal API Contract

## Purpose

This document defines the provisional internal API contract for the Board Game Recommender MVP.

The contract separates:

- raw BoardGameGeek source data
- normalised backend game data
- recommendation request data
- recommendation response data
- frontend-facing fields

The frontend and recommendation engine should not depend directly on BoardGameGeek XML or BGG-specific field names.

The backend is responsible for:

- authenticating with BGG
- retrieving XML data
- parsing and validating source values
- normalising source data into an application-owned JSON shape
- applying recommendation logic
- returning stable frontend-facing responses

The contract is provisional and may change during implementation, but changes should be deliberate and documented.

---

## Design Principles

The Version 1 internal contract follows these principles:

1. **BGG XML stays behind the backend boundary.**
2. **Frontend code uses application-owned field names.**
3. **Source facts and application-derived values remain distinguishable.**
4. **Missing values are represented explicitly rather than guessed.**
5. **Community poll data preserves its original evidence where useful.**
6. **Recommendation results contain the evidence needed to explain why a game matched.**
7. **Mock data must use the same shape as normalised production data.**
8. **The contract must support deterministic recommendation testing without live BGG requests.**

---

## Normalised Game Record

The backend will convert BoardGameGeek source data into a stable application-owned game record.

Recommendation code and mock fixtures should use this shape rather than raw BGG XML fields.

### Provisional Shape

```json
{
  "id": "game-266192",
  "source": {
    "provider": "boardgamegeek",
    "externalId": "266192"
  },
  "title": "Wingspan",
  "description": "A strategy game about attracting birds to your wildlife preserves.",
  "yearPublished": 2019,
  "images": {
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "imageUrl": "https://example.com/image.jpg"
  },
  "playerRange": {
    "min": 1,
    "max": 5
  },
  "playTime": {
    "minMinutes": 40,
    "maxMinutes": 70
  },
  "age": {
    "publisherMinimum": 10,
    "communityPoll": [
      {
        "age": "8",
        "votes": 120
      },
      {
        "age": "10",
        "votes": 200
      }
    ]
  },
  "complexity": {
    "average": 2.48
  },
  "playerCountPoll": [
    {
      "players": "1",
      "bestVotes": 120,
      "recommendedVotes": 200,
      "notRecommendedVotes": 30
    },
    {
      "players": "2",
      "bestVotes": 350,
      "recommendedVotes": 250,
      "notRecommendedVotes": 20
    }
  ],
  "mechanics": [
    "Open Drafting",
    "Hand Management",
    "Set Collection"
  ],
  "categories": [
    "Animals"
  ],
  "ratings": {
    "bayesianAverage": 7.93,
    "usersRated": 90000
  },
  "relationships": {
    "baseGameIds": []
  },
  "content": {
    "classification": "family-friendly"
  }
}
```

The values above demonstrate the structure only. Mock records should later use validated or deliberately constructed test values.

---

## Game Record Fields

### `id`

```text
string
required
```

Application-owned stable identifier for the game record.

Example:

```text
game-266192
```

The frontend should use this identifier rather than depending directly on a BoardGameGeek ID.

For the MVP, the internal ID may be derived from the source record because the catalogue uses BGG as its game-data provider.

---

### `source`

```json
{
  "provider": "boardgamegeek",
  "externalId": "266192"
}
```

Stores information needed to trace the normalised record back to its external source.

Fields:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `provider` | string | yes | Identifies the external data provider |
| `externalId` | string | yes | Stores the provider's record identifier |

External IDs are stored as strings so the application does not depend on numeric identifier behaviour.

The `source` object is backend metadata. It does not need to be exposed in every frontend response.

---

### `title`

```text
string
required
```

Primary display name of the game.

Example:

```text
Wingspan
```

---

### `description`

```text
string | null
```

A cleaned plain-language description of the game for display purposes.

The backend is responsible for normalising source description text before it reaches the frontend.

The frontend should not need to process raw external markup or source formatting.

If no usable description is available:

```text
null
```

The recommendation response may use a shortened version of this field for result cards.

The description is display information only and does not affect Version 1 recommendation scoring.

---

### `yearPublished`

```text
integer | null
```

Year the record was published.

Example:

```text
2019
```

A missing year is represented as:

```text
null
```

The year is useful for identification and edition disambiguation but is not part of Version 1 recommendation scoring.

---

### `images`

```json
{
  "thumbnailUrl": "string | null",
  "imageUrl": "string | null"
}
```

Stores normalised image references.

Fields:

| Field | Type |
| --- | --- |
| `thumbnailUrl` | string or null |
| `imageUrl` | string or null |

Missing image URLs must remain `null` rather than being replaced with invented source values.

The frontend may later use an application-owned placeholder when an image is unavailable.

---

### `playerRange`

```json
{
  "min": 1,
  "max": 5
}
```

Stores the game's official supported player range.

Fields:

| Field | Type | Required |
| --- | --- | --- |
| `min` | integer or null | yes |
| `max` | integer or null | yes |

The `playerRange` object and both properties remain present in the normalised record.

If the source value cannot be validated, the relevant property is `null`.

For example:

```json
{
  "playerRange": {
    "min": null,
    "max": 5
  }
}

These values control the hard player-count eligibility rule.

If either value is missing or invalid, the recommendation engine cannot verify player eligibility and the record is excluded from recommendation candidates.

Community polling must never expand this range.

---

### `playTime`

```json
{
  "minMinutes": 40,
  "maxMinutes": 70
}
```

Stores the normal published play-time range in minutes.

Fields:

| Field | Type |
| --- | --- |
| `minMinutes` | integer or null |
| `maxMinutes` | integer or null |

Version 1 recommendation scoring primarily uses:

```text
playTime.maxMinutes
```

because the questionnaire asks how much time the user has available.

Missing play-time values remain `null`.

---

### `age`

```json
{
  "publisherMinimum": 10,
  "communityPoll": [
    {
      "age": "8",
      "votes": 120
    }
  ]
}
```

Preserves publisher and community age evidence separately.

#### `publisherMinimum`

```text
integer | null
```

The publisher-provided minimum age.

This value controls the Version 1 hard age-eligibility rule.

#### `communityPoll`

```text
array
```

Each poll item contains:

```json
{
  "age": "8",
  "votes": 120
}
```

The `age` value is stored as a string because external poll labels should be preserved safely before application interpretation.

The recommendation engine may derive a community suggested age from this evidence, but the derived value must not overwrite `publisherMinimum`.

---

### `complexity`

```json
{
  "average": 2.48
}
```

Stores the normalised community complexity measure.

#### `average`

```text
number | null
```

The value is based on BGG community complexity data.

The application uses this number internally but presents beginner-friendly terms such as:

- Light and easy
- Some strategy
- Moderately challenging
- Deep and challenging

If complexity data is unavailable:

```json
{
  "average": null
}
```

The recommendation engine then applies the documented missing-data behaviour.

---

### `playerCountPoll`

```json
[
  {
    "players": "4",
    "bestVotes": 500,
    "recommendedVotes": 250,
    "notRecommendedVotes": 30
  }
]
```

Preserves community evidence about how well the game works at different player counts.

Each record contains:

| Field | Type |
| --- | --- |
| `players` | string |
| `bestVotes` | integer |
| `recommendedVotes` | integer |
| `notRecommendedVotes` | integer |

The `players` value must remain a **string**.

This is necessary because BGG community polls may contain labels such as:

```text
1+
2+
5+
7+
```

The application must not discard or incorrectly convert these values to integers.

Vote totals are preserved so the recommendation engine can calculate:

- proportional suitability
- evidence confidence
- the confidence-adjusted player-count score

A missing poll is represented by an empty array:

```json
[]
```

---

### `mechanics`

```json
[
  "Cooperative Game",
  "Hand Management",
  "Set Collection"
]
```

Array of normalised mechanic names.

```text
string[]
```

Mechanics are source-derived evidence used by the application-owned mood and game-style mappings.

An unavailable mechanic list is represented by:

```json
[]
```

The application should not invent mechanics when source evidence is missing.

---

### `categories`

```json
[
  "Fantasy",
  "Adventure"
]
```

Array of normalised category names.

```text
string[]
```

Categories are mainly supporting evidence for themes and some mood/style mappings.

An unavailable category list is represented by:

```json
[]
```

---

### `ratings`

```json
{
  "bayesianAverage": 7.93,
  "usersRated": 90000
}
```

Stores supporting community quality evidence.

Fields:

| Field | Type |
| --- | --- |
| `bayesianAverage` | number or null |
| `usersRated` | integer or null |

Ratings are not part of the main Version 1 preference score.

They are used only as late tie-break signals after recommendation-fit factors have been compared.

Missing rating values remain `null`.

---

### `relationships`

```json
{
  "baseGameIds": []
}
```

Stores relationships needed to distinguish standalone games from expansions.

#### Standalone game

```json
{
  "baseGameIds": []
}
```

#### Expansion

```json
{
  "baseGameIds": [
    "game-266192"
  ]
}
```

A record with one or more `baseGameIds` is treated as an expansion for Version 1 standalone recommendations.

It is excluded before recommendation scoring begins.

This field is required because the technical spike showed that an expansion may still appear as a normal top-level board-game record.

---

### `content`

```json
{
  "classification": "family-friendly"
}
```

Stores reviewed application-owned content metadata.

Allowed Version 1 values are:

```text
family-friendly
mature
unknown
```

This value is not inferred automatically from mechanics, categories or the title.

If content has not been reviewed:

```json
{
  "classification": "unknown"
}
```

When the user selects **Family-friendly only**, records classified as `mature` or `unknown` are excluded.

For other content preferences, this field does not affect the numeric recommendation score.

---

## Null and Missing-Value Rules

The normalised model should use predictable missing-value behaviour.

Use:

```text
null
```

for a missing single value.

Examples:

```json
{
  "yearPublished": null,
  "complexity": {
    "average": null
  }
}
```

Use:

```text
[]
```

for a known collection that contains no available values.

Examples:

```json
{
  "mechanics": [],
  "categories": [],
  "playerCountPoll": []
}
```

Objects that are part of the defined contract should normally remain present even when their child values are missing.

For example:

```json
{
  "ratings": {
    "bayesianAverage": null,
    "usersRated": null
  }
}
```

This gives recommendation and frontend code a predictable structure and reduces the need for different object shapes for different games.

---

## Recommendation Request

The frontend sends one recommendation request after the user completes and reviews the six questionnaire inputs.

The frontend should send application-owned values rather than BoardGameGeek terminology.

### Provisional Request Shape

```json
{
  "players": 4,
  "time": "up-to-120",
  "complexity": "moderate",
  "mood": "strategic",
  "style": "building-collecting",
  "youngestPlayerAge": 10,
  "contentPreference": "family-friendly"
}
```

---

### Request Fields

| Field | Type | Required | Allowed values |
| --- | --- | --- | --- |
| `players` | integer | yes | Whole number `>= 1` |
| `time` | string | yes | `up-to-20`, `up-to-30`, `up-to-60`, `up-to-120`, `over-120`, `no-preference` |
| `complexity` | string | yes | `light`, `some-strategy`, `moderate`, `deep`, `no-preference` |
| `mood` | string | yes | `relaxed`, `social`, `competitive`, `cooperative`, `strategic`, `immersive`, `chaotic`, `no-preference` |
| `style` | string | yes | `working-things-out`, `building-collecting`, `planning-managing`, `talking-guessing`, `working-together`, `competing-directly`, `theme-story`, `quick-simple`, `no-preference` |
| `youngestPlayerAge` | integer | yes | Whole number `>= 0` |
| `contentPreference` | string | yes | `family-friendly`, `mature-okay`, `no-preference` |

The questionnaire contains six questions, but Q6 supplies two request fields: `youngestPlayerAge` and `contentPreference`. The recommendation request therefore contains seven fields.

---

### `players`

Example:

```json
{
  "players": 4
}
```

Represents the exact number of people who will play.

The backend validates that the value:

- is an integer
- is at least `1`

The recommendation engine compares this value with each game's official `playerRange`.

---

### `time`

Allowed values:

```text
up-to-20
up-to-30
up-to-60
up-to-120
over-120
no-preference
```

These values correspond to the user-facing questionnaire choices:

| Internal value | User-facing choice |
| --- | --- |
| `up-to-20` | Up to 20 minutes |
| `up-to-30` | About 30 minutes |
| `up-to-60` | About 45–60 minutes |
| `up-to-120` | About 1–2 hours |
| `over-120` | More than 2 hours |
| `no-preference` | No preference |

The frontend does not need to send the calculated minute budget.

The recommendation service owns the mapping between these values and the Version 1 scoring rules.

This keeps recommendation logic out of the user interface.

---

### `complexity`

Allowed values:

```text
light
some-strategy
moderate
deep
no-preference
```

These correspond to:

| Internal value | User-facing choice |
| --- | --- |
| `light` | Light and easy |
| `some-strategy` | Some strategy |
| `moderate` | Moderately challenging |
| `deep` | Deep and challenging |
| `no-preference` | No preference |

The frontend does not send BGG complexity numbers or ranges.

The recommendation service translates these application-owned values into the Version 1 complexity rules.

---

### `mood`

Allowed values:

```text
relaxed
social
competitive
cooperative
strategic
immersive
chaotic
no-preference
```

These correspond to the user-facing experience choices defined in the recommendation-engine specification.

Only one mood preference is accepted in Version 1.

The frontend does not attempt to map the selected mood to mechanics or categories.

That mapping belongs to the recommendation service.

---

### `style`

Allowed values:

```text
working-things-out
building-collecting
planning-managing
talking-guessing
working-together
competing-directly
theme-story
quick-simple
no-preference
```

Only one game-style preference is accepted in Version 1.

The frontend sends the application-owned value.

The recommendation service determines which game mechanics, categories or structured characteristics provide evidence for that style.

---

### `youngestPlayerAge`

Example:

```json
{
  "youngestPlayerAge": 10
}
```

Represents the exact age of the youngest player.

The backend validates that the value is a whole number and is not negative.

The recommendation engine compares it with:

```text
age.publisherMinimum
```

Community age evidence does not replace this hard eligibility check.

---

### `contentPreference`

Allowed values:

```text
family-friendly
mature-okay
no-preference
```

These correspond to:

| Internal value | User-facing choice |
| --- | --- |
| `family-friendly` | Family-friendly only |
| `mature-okay` | Mature or adult humour is okay |
| `no-preference` | No preference |

When `family-friendly` is selected, the recommendation engine requires a game to have:

```text
content.classification = family-friendly
```

The other two values do not create a hard content filter in Version 1.

---

## Request Validation

The backend must validate recommendation requests before scoring begins.

A valid request must:

1. contain all seven request fields
2. contain a valid integer player count
3. contain a valid youngest-player age
4. use only recognised questionnaire option values
5. contain only one value for mood
6. contain only one value for style

An invalid request should not be silently corrected into a different preference.

For example:

```json
{
  "players": 0
}
```

is invalid rather than being automatically changed to:

```json
{
  "players": 1
}
```

Similarly, an unknown value such as:

```json
{
  "complexity": "kind-of-hard"
}
```

should produce a validation error rather than being guessed as one of the recognised complexity choices.

This keeps questionnaire behaviour deterministic and testable.

---

## Why the Request Uses Application-Owned Values

The request deliberately does **not** contain fields such as:

```text
averageweight
maxplaytime
suggested_numplayers
boardgamemechanic
```

Those concepts belong to the external source and backend implementation.

The frontend communicates what the **user wants**.

The backend is responsible for translating those preferences into recommendation rules and comparing them with normalised game records.

This means the frontend can remain stable even if the application's external data source or normalisation implementation changes later.

---

## Recommendation Response

After validating the request and applying the recommendation rules, the backend returns a ranked set of qualifying recommendations.

The frontend should receive information that is ready to display without needing to reproduce recommendation logic.

### Example Response

```json
{
  "resultState": "limited-matches",
  "recommendationCount": 1,
  "recommendations": [
    {
      "rank": 1,
      "gameId": "game-266192",
      "title": "Wingspan",
      "summary": "A strategy game about attracting birds to competing wildlife preserves.",
      "imageUrl": "https://example.com/image.jpg",
      "matchLabel": "Strong match",
      "players": {
        "min": 1,
        "max": 5
      },
      "playTime": {
        "minMinutes": 40,
        "maxMinutes": 70
      },
      "complexity": {
        "label": "Moderately challenging"
      },
      "age": {
        "publisherMinimum": 10
      },
      "matchReasons": [
        "A strong fit for 4 players.",
        "Matches the strategic experience you selected."
      ],
      "caveats": [],
      "detailsUrl": "https://boardgamegeek.com/boardgame/266192"
    }
  ]
}
```

The example demonstrates the response structure with one returned recommendation. It is not intended to represent a final recommendation-quality judgement about Wingspan.

---

## Response-Level Fields

### `resultState`

```text
string
required
```

Allowed values:

```text
matches
limited-matches
no-matches
```

Behaviour:

| Value | Meaning |
| --- | --- |
| `matches` | At least 3 qualifying recommendations are returned |
| `limited-matches` | Only 1–2 games meet the Version 1 display threshold |
| `no-matches` | No game meets the eligibility and display requirements |

The frontend can use this value to choose the appropriate results message without recreating recommendation-count rules.

---

### `recommendationCount`

```text
integer
required
```

Number of recommendations returned.

Examples:

```text
5
2
0
```

The value must equal the number of objects in:

```text
recommendations
```

---

### `recommendations`

```text
array
required
```

Contains zero to five ranked recommendation objects.

The backend returns this array already ordered from strongest to weakest recommendation.

The frontend must not independently recalculate recommendation ranking.

For a no-match result:

```json
{
  "resultState": "no-matches",
  "recommendationCount": 0,
  "recommendations": []
}
```

---

## Recommendation Object

### `rank`

```text
integer
required
```

Display order assigned by the recommendation service.

Example:

```text
1
```

The first recommendation has rank `1`.

The backend determines ranking after weighted scoring and tie-breaking.

---

### `gameId`

```text
string
required
```

Application-owned identifier corresponding to the normalised game record.

Example:

```text
game-266192
```

The frontend should not need to use the external source ID as the primary game identifier.

---

### `title`

```text
string
required
```

Display title of the game.

---

### `summary`

```text
string | null
```

Short plain-language description suitable for a recommendation card.

It may be produced from the game's normalised description, but should remain concise enough for the results interface.

A missing usable description is represented as:

```text
null
```

Recommendation quality must not depend on whether a description is available.

---

### `imageUrl`

```text
string | null
```

Preferred image for the result card.

The backend selects the most appropriate normalised image value.

If unavailable:

```text
null
```

The frontend may display an application-owned placeholder.

---

### `matchLabel`

```text
string
required
```

Allowed Version 1 values:

```text
Excellent match
Strong match
Good match
```

The backend calculates the internal numeric recommendation score but does **not** expose that score as a percentage to the user.

Only the user-facing label is required by the frontend contract.

This avoids suggesting false precision such as:

```text
92% match
```

---

### `players`

```json
{
  "min": 1,
  "max": 5
}
```

Official supported player range for display.

These values are copied from the normalised game record after eligibility has already been checked.

---

### `playTime`

```json
{
  "minMinutes": 40,
  "maxMinutes": 70
}
```

Published play-time range for display.

Either value may be `null` if unavailable, subject to the recommendation engine's missing-data rules.

---

### `complexity`

```json
{
  "label": "Moderately challenging"
}
```

Frontend-facing complexity information uses the application's beginner-friendly terminology rather than exposing raw BGG complexity values.

Allowed display labels are:

```text
Light and easy
Some strategy
Moderately challenging
Deep and challenging
Unknown
```

The label describes the game's interpreted complexity rather than simply repeating the user's selected preference.

#### Display mapping

The frontend-facing complexity label is derived from `complexity.average` using a separate non-overlapping display mapping.

| `complexity.average` | Display label |
| --- | --- |
| `1.00 <= value < 1.75` | Light and easy |
| `1.75 <= value < 2.25` | Some strategy |
| `2.25 <= value < 3.50` | Moderately challenging |
| `3.50 <= value <= 5.00` | Deep and challenging |
| `null`, invalid, or outside the supported range | Unknown |

This display mapping is deliberately separate from the recommendation engine's complexity preference scoring bands.

The recommendation scoring bands may overlap because a game can reasonably be a partial or strong fit for neighbouring user preferences. The display mapping must not overlap because each game needs exactly one complexity label in the frontend response.

---

### `age`

```json
{
  "publisherMinimum": 10
}
```

Publisher minimum age for display.

The value may be:

```text
integer | null
```

A game with missing required age information may already have been excluded depending on the user's request.

Community age evidence does not need to be included on every result card.

If it triggers a meaningful discrepancy, the recommendation service can expose that information through a caveat.

---

### `matchReasons`

```text
string[]
required
```

Contains the structured plain-language reasons selected by the recommendation engine.

Version 1 normally returns up to two primary reasons.

Example:

```json
[
  "A strong fit for 4 players.",
  "Matches the cooperative style you selected."
]
```

These statements must come from actual recommendation evidence.

The frontend must not invent additional reasons based on game metadata.

---

### `caveats`

```text
string[]
required
```

Contains any user-facing trade-offs triggered by the documented caveat rules.

Example:

```json
[
  "This is slightly more complex than the level you selected."
]
```

When no caveat applies:

```json
[]
```

Using an array allows more than one relevant caveat while keeping caveat generation inside the recommendation service.

The frontend should display the provided caveats rather than attempting to determine whether one is required.

---

### `detailsUrl`

```text
string
required
```

External details page for the game.

For the MVP this points to the corresponding BoardGameGeek game page.

Example:

```text
https://boardgamegeek.com/boardgame/266192
```

The frontend may label this link:

```text
View on BoardGameGeek
```

The URL is created by the backend from trusted normalised source information rather than accepted from the recommendation request.

---

## Information Deliberately Not Returned

The standard frontend recommendation response does not need to expose:

```text
raw BGG XML
community poll vote totals
raw complexity values
internal scoring weights
internal numeric match score
confidence calculations
source parsing details
tie-break calculations
```

These values may be useful internally for testing and debugging, but they are not required to render the normal results experience.

Keeping them behind the backend boundary prevents frontend code from becoming coupled to recommendation implementation details.

---

## Response Responsibility

The backend recommendation service is responsible for:

1. validating the questionnaire request
2. filtering ineligible records
3. calculating active preference scores
4. normalising weights when preferences are inactive
5. ranking qualifying games
6. resolving ties
7. applying the minimum display threshold
8. selecting the final zero-to-five recommendations
9. assigning user-facing match labels
10. generating structured match reasons
11. generating applicable caveats
12. returning frontend-ready display information

The frontend is responsible for presenting the response clearly.

It should not duplicate the recommendation algorithm.
