# ADR 001: Normalise BoardGameGeek data behind the backend

## Status
Accepted for the initial architecture, subject to validation during authenticated API testing.

## Context
BoardGameGeek XML API2 returns external data in XML using BGG-specific field names and nested structures. The frontend and recommendation engine need a predictable application-specific representation of a game.

If raw BGG responses are allowed to flow throughout the application, UI components and recommendation logic would become tightly coupled to the external API. Changes to BGG response structure, parsing behaviour or field selection could then require changes in many parts of the codebase.

The project also needs to distinguish between:
- factual source data received from BGG; and
- values derived by our application, such as mood mappings, beginner-friendly complexity labels, recommendation scores and explanations.

## Decision
All BoardGameGeek requests will be handled by a backend BGG integration layer.

That layer will:
1. authenticate with BGG;
2. request XML API2 data;
3. parse the XML response;
4. validate and normalise relevant fields into an internal game-data model; and
5. return application-owned JSON to the rest of the system.

The recommendation engine and frontend will consume the internal model rather than raw BGG XML.

Derived recommendation concepts will be calculated outside the source-data model wherever practical.

## Consequences
### Benefits
- BGG-specific XML and field names are isolated in one place.
- Frontend components receive simpler, consistent JSON.
- Recommendation logic can be tested without making live BGG requests.
- Cached and freshly fetched games can share the same representation.
- Changes to the external API should have a smaller impact on the application.
- Source facts remain distinguishable from our own interpretation and recommendation logic.

### Costs / trade-offs
- An additional transformation layer must be written and maintained.
- Some BGG data may be omitted from the internal model and later need to be added.
- We must validate assumptions about field types, missing values and community poll structures during the technical spike.

## Validation required
Before this ADR is treated as fully stable, authenticated `/thing?stats=1` testing should confirm that the proposed fields can be mapped reliably across several different types of games.

## Related work
- Issue #3: Technical spike — verify BoardGameGeek API data and constraints
- `docs/bgg-api-spike.md`
