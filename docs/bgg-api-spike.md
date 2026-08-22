# BoardGameGeek API Technical Spike

## Purpose
Verify that BoardGameGeek XML API2 can support the MVP recommendation inputs and identify technical, licensing and architectural constraints before production implementation begins.

## Current status
The non-commercial public application registration has been submitted to BoardGameGeek and is currently **pending approval**. Authenticated endpoint testing cannot be completed until the application is approved and a token can be generated.

Documentation research is continuing while approval is pending.

## Initial findings

### Registration and authorization
BoardGameGeek's current XML API usage guide states that registration and authorization are required for nearly all XML API use. Applications are registered through the BGG applications page. Once approved, an application token is created and sent as a Bearer token in the `Authorization` header.

The project has been registered as a public, non-commercial portfolio application. Approval is currently pending.

BGG notes that application approval may take a week or more.

Source: https://boardgamegeek.com/using_the_xml_api

### Server-side requests and caching
BGG recommends that applications make requests from their own servers where possible and cache results to keep request volume low. Client-side requests can expose the application token and increase traffic.

This supports a likely architecture where the React frontend talks to our own backend, and the backend handles BGG authentication, XML parsing, caching and retry logic.

Source: https://boardgamegeek.com/using_the_xml_api

### API format
XML API2 returns XML rather than JSON. The production application will therefore need an XML parsing layer and its own internal game-data model.

Source: https://boardgamegeek.com/wiki/page/BGG_XML_API2

### Rate limiting and throttling
BGG states that requests sent too frequently may receive HTTP 500 or 503 responses. The current API2 documentation notes that approximately five seconds between requests appears sufficient.

The application should minimise external requests, batch requests where appropriate, cache game data and implement controlled retry behaviour.

Source: https://boardgamegeek.com/wiki/page/BGG_XML_API2

### Search endpoint
The `/xmlapi2/search` endpoint searches the BGG database by name. It supports filtering by item type and an `exact=1` option for exact title matching.

Likely production use: search/resolve candidate game IDs before retrieving full game details.

Source: https://boardgamegeek.com/wiki/page/BGG_XML_API2

### Thing endpoint
The `/xmlapi2/thing` endpoint provides detailed information about games. `stats=1` can be used to include rating and ranking statistics. The current API2 documentation allows multiple comma-separated game IDs, with a listed maximum of 20 items per request.

Published XML response examples show fields useful to the recommender, including:
- minimum and maximum players
- playing time, minimum play time and maximum play time
- minimum publisher age
- community suggested player-count polls
- community suggested player-age polls
- categories
- mechanics
- game images/thumbnails
- statistics when requested with `stats=1`, including rating/ranking information and community complexity/weight

Authenticated testing will still be used to confirm the exact response structure we receive in practice.

Sources:
- https://boardgamegeek.com/wiki/page/BGG_XML_API2
- published XML API2 response examples

### Attribution and terms
Public-facing uses of the XML API must credit BoardGameGeek and display a linked "Powered by BGG" logo. BGG's XML API terms should be reviewed carefully before production implementation, particularly around permitted use and presentation of API data.

A significant future constraint is that BGG's current terms explicitly prohibit using XML API or site data to train an AI or Large Language Model system. The project's future AI concept must therefore not involve training a model on BGG data. Any later use of AI to interpret or present BGG-derived information must be separately reviewed against the current terms before implementation.

Sources:
- https://boardgamegeek.com/using_the_xml_api
- https://boardgamegeek.com/wiki/page/XML%20API%20Terms%20of%20Use

## MVP field investigation

| Requirement | Current finding | Notes |
| --- | --- | --- |
| Number of players | Strong documented support; live test pending | `minplayers`, `maxplayers` plus community suggested-player polls |
| Available play time | Strong documented support; live test pending | `playingtime`, `minplaytime`, `maxplaytime` |
| Desired complexity | Strong documented support; live test pending | Community `averageweight` statistic via detailed stats |
| Experience / mood | Derived rather than direct | Likely our own mapping from mechanics, categories and other structured data |
| Game style / mechanics | Strong documented support; live test pending | `boardgamemechanic` and `boardgamecategory` links |
| Age appropriateness | Strong documented support; live test pending | `minage` plus community suggested-player-age poll; reliability must be assessed |
| Game image | Strong documented support; live test pending | Image and thumbnail fields are present in thing responses |
| Ratings/rankings | Documented with `stats=1`; live test pending | Useful as supporting quality evidence, not necessarily the main recommendation criterion |

## Early interpretation for the six MVP inputs

1. **Number of players** — likely direct BGG data, with community player-count recommendations potentially more useful than publisher min/max alone.
2. **Available play time** — likely direct BGG data using min/max play-time fields.
3. **Desired complexity** — likely based on BGG community `averageweight`, translated into beginner-friendly labels rather than exposing the raw terminology alone.
4. **Experience / mood** — not a direct BGG field. This will probably require our own transparent mapping layer from categories/mechanics to concepts such as relaxed, competitive, social, strategic or cooperative.
5. **Game style / mechanics** — BGG mechanics and categories can provide structured source data, but the UI should translate them into plain language for the target user.
6. **Age appropriateness** — BGG provides publisher minimum age and community suggested-age data. We need to test how reliable these are and decide which should be preferred.

## Questions still to answer
- Which exact XML fields are returned once our application token is active?
- Are BGG's minimum age and play-time values reliable enough for recommendations across different game types?
- Should community recommended player counts override or supplement publisher player ranges?
- How should community complexity/weight map to beginner-friendly wording?
- How should categories and mechanics map to plain-language game styles and moods?
- What information should be treated as a hard filter versus a weighted preference?
- What caching duration is appropriate for relatively slow-changing game metadata?
- What retry strategy should be used for BGG throttling and temporary errors?
- Do BGG's terms create any restrictions on calculated recommendation scores, summaries or other derived presentation that require further clarification?
- What AI-assisted functionality, if any, would remain compliant with BGG's prohibition on training AI/LLM systems using its data and its other restrictions on API data?

## Planned test games
Use several different types of games so the data model is not designed around one example only. Candidate set:
- a light party game
- a family game
- a medium-weight strategy game
- a heavier hobby game
- a cooperative game

Exact titles will be selected during testing.

## Proposed direction (not yet an accepted architecture decision)

```text
React frontend
      |
      v
Our Node/Express API
      |
      +--> Recommendation service
      |
      +--> BGG integration service
                |
                +--> cache
                |
                v
          BGG XML API2
```

This remains provisional until the technical spike is complete.

## Status
In progress. BGG application registration has been submitted and is pending approval. Documentation research indicates strong support for most structured MVP inputs, while experience/mood will require our own derived mapping layer. Authenticated endpoint testing remains outstanding.
