# Shuffled catalogue schema

## Purpose

The Shuffled catalogue stores normalized BoardGameGeek data locally so recommendation requests do not need to fetch the candidate catalogue from BGG in real time.

The schema is designed to support:

- approximately 100 games during development;
- approximately 300–500 games for the first MVP;
- future catalogue growth without changing the recommendation-engine interface;
- separation between BGG-derived information and Shuffled-owned metadata.

The recommendation engine should continue to receive the same normalized JavaScript game objects that it receives today.

## Design approach

The catalogue uses two main tables:

1. `games` — normalized data derived from BoardGameGeek;
2. `catalogue_entries` — metadata owned by Shuffled.

Fields containing lists or poll structures are stored as JSON text.

This avoids unnecessary relational complexity while preserving the current normalized game model.

## `games`

Each row represents one normalized BGG game.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | TEXT PRIMARY KEY | Shuffled game ID, for example `game-178900` |
| `source_provider` | TEXT NOT NULL | Source provider, currently `boardgamegeek` |
| `source_external_id` | TEXT NOT NULL | BGG game ID |
| `title` | TEXT | Primary BGG game title |
| `description` | TEXT | BGG description |
| `year_published` | INTEGER | Publication year |
| `thumbnail_url` | TEXT | BGG thumbnail image URL |
| `image_url` | TEXT | BGG full image URL |
| `min_players` | INTEGER | Official minimum player count |
| `max_players` | INTEGER | Official maximum player count |
| `min_play_minutes` | INTEGER | Minimum play time |
| `max_play_minutes` | INTEGER | Maximum play time |
| `publisher_min_age` | INTEGER | Publisher minimum age |
| `complexity_average` | REAL | BGG average complexity |
| `bayesian_average` | REAL | BGG Bayesian rating |
| `users_rated` | INTEGER | Number of BGG ratings |
| `community_age_poll_json` | TEXT NOT NULL | Normalized community age poll |
| `player_count_poll_json` | TEXT NOT NULL | Normalized player-count poll |
| `mechanics_json` | TEXT NOT NULL | BGG mechanics |
| `categories_json` | TEXT NOT NULL | BGG categories |
| `base_game_ids_json` | TEXT NOT NULL | Base-game relationships for expansions |

The combination of `source_provider` and `source_external_id` must be unique.

## `catalogue_entries`

Each row contains information controlled by Shuffled rather than BGG.

| Column | Type | Purpose |
| --- | --- | --- |
| `game_id` | TEXT PRIMARY KEY | References `games.id` |
| `content_classification` | TEXT NOT NULL | Shuffled content classification |
| `curated_tags_json` | TEXT NOT NULL | Future Shuffled-owned editorial tags |
| `is_included` | INTEGER NOT NULL | Whether the game is active in the recommendation catalogue |
| `imported_at` | TEXT NOT NULL | When the BGG record was last successfully imported |

`game_id` is a foreign key referencing `games.id`.

Deleting a game should also remove its catalogue entry.

## Content classification

BGG does not currently provide the content classification required by the Shuffled questionnaire.

Therefore this field remains explicitly Shuffled-owned.

Initial supported values are:

- `unknown`
- `family-friendly`
- `mature`

Newly imported games default to:

```text
unknown
```

Shuffled must not imply that this classification came from BoardGameGeek.

## JSON fields

Several parts of the existing normalized model contain arrays or structured poll data.

These will initially be stored as JSON text:

- `community_age_poll_json`
- `player_count_poll_json`
- `mechanics_json`
- `categories_json`
- `base_game_ids_json`
- `curated_tags_json`

For example:

```json
[
  "Cooperative Game",
  "Hand Management",
  "Set Collection"
]
```

and:

```json
[
  {
    "players": "3",
    "bestVotes": 210,
    "recommendedVotes": 80,
    "notRecommendedVotes": 10
  }
]
```

The catalogue data source will parse these fields back into arrays before passing a game to the recommendation engine.

This means the recommendation engine does not need to know that SQLite is being used.

## Reconstructed application object

A catalogue row should be reconstructed into the existing application-owned format:

```js
{
  id: 'game-30549',

  source: {
    provider: 'boardgamegeek',
    externalId: '30549',
  },

  title: 'Pandemic',
  description: '...',

  yearPublished: 2008,

  images: {
    thumbnailUrl: '...',
    imageUrl: '...',
  },

  playerRange: {
    min: 2,
    max: 4,
  },

  playTime: {
    minMinutes: 45,
    maxMinutes: 45,
  },

  age: {
    publisherMinimum: 8,
    communityPoll: [],
  },

  complexity: {
    average: 2.39,
  },

  playerCountPoll: [],

  mechanics: [
    'Cooperative Game',
  ],

  categories: [
    'Medical',
  ],

  ratings: {
    bayesianAverage: 7.5,
    usersRated: 130000,
  },

  relationships: {
    baseGameIds: [],
  },

  content: {
    classification: 'family-friendly',
  },
}
```

## Indexes

The initial schema should include indexes for:

- game title;
- catalogue inclusion status.

The recommendation engine currently evaluates the candidate catalogue in application code, so extensive database indexing is unnecessary for the MVP.

Additional indexes can be introduced later if recommendation pre-filtering moves into SQLite.

## Recommendation request flow

Normal user requests should follow this path:

```text
questionnaire
→ recommendation API
→ SQLite catalogue data source
→ normalized JavaScript game objects
→ recommendation engine
→ ranked recommendations
```

BGG should not be contacted as part of this normal request path.

## Catalogue import flow

Catalogue updates should follow a separate path:

```text
controlled BGG ID list
→ groups of no more than 20 IDs
→ authenticated BGG requests
→ existing BGG normalizer
→ SQLite upsert
→ Shuffled catalogue metadata
```

The existing BGG pacing, retry, authentication and caching behaviour should continue to apply.

## Initial constraints

The first implementation should enforce:

- unique game IDs;
- unique source-provider/external-ID combinations;
- valid foreign-key relationships;
- `is_included` restricted to `0` or `1`;
- content classification restricted to supported Shuffled values;
- JSON collection fields defaulting to empty arrays.

## Future considerations

The schema deliberately does not attempt to solve every future catalogue requirement.

Possible later changes include:

- normalized mechanic/category tables if SQL-level filtering becomes useful;
- richer curated Shuffled metadata;
- import history;
- catalogue versioning;
- automated freshness tracking;
- hosted database storage if deployment requirements outgrow SQLite.

These changes should not require redesigning the recommendation engine because the catalogue data-source boundary will continue returning the existing normalized application object.