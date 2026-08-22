# BoardGameGeek API Technical Spike

## Purpose
Verify that BoardGameGeek XML API2 can support the MVP recommendation inputs and identify technical, licensing and architectural constraints before production implementation begins.

## Initial findings

### Registration and authorization
BoardGameGeek's current XML API usage guide states that registration and authorization are required for nearly all XML API use. Applications are registered through the BGG applications page. Once approved, an application token is created and sent as a Bearer token in the `Authorization` header.

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

### Thing endpoint
The `/xmlapi2/thing` endpoint provides detailed information about games. `stats=1` can be used to include rating and ranking statistics. The current API2 documentation allows multiple comma-separated game IDs, with a listed maximum of 20 items per request.

Source: https://boardgamegeek.com/wiki/page/BGG_XML_API2

### Attribution and terms
Public-facing uses of the XML API must credit BoardGameGeek and display a linked "Powered by BGG" logo. BGG's XML API terms should be reviewed carefully before production implementation, particularly around permitted use and presentation of API data.

Sources:
- https://boardgamegeek.com/using_the_xml_api
- https://boardgamegeek.com/wiki/page/XML%20API%20Terms%20of%20Use

## MVP field investigation

| Requirement | BGG support | Notes |
| --- | --- | --- |
| Number of players | To verify | Test `/thing` response |
| Available play time | To verify | Test `/thing` response |
| Desired complexity | To verify | Investigate weight/complexity statistics |
| Experience / mood | Likely derived | May require mapping from categories, mechanics and other data |
| Game style / mechanics | To verify | Investigate category/mechanic links in `/thing` |
| Age appropriateness | To verify | Test minimum age and any community recommendation data |
| Game image | To verify | Test image/thumbnail fields |
| Ratings/rankings | Likely available | Verify with `stats=1` |

## Questions still to answer
- Which exact XML fields are returned for the games we need?
- Are BGG's minimum age and play-time values reliable enough for recommendations?
- How should community complexity/weight map to beginner-friendly wording?
- How should categories and mechanics map to plain-language game styles and moods?
- What information should be treated as a hard filter versus a weighted preference?
- What caching duration is appropriate for relatively slow-changing game metadata?
- What retry strategy should be used for BGG throttling and temporary errors?
- Do BGG's terms create any restrictions on calculated recommendation scores, summaries or other derived presentation that require further clarification?

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
In progress. Documentation research has started; authenticated endpoint testing has not yet been completed.
