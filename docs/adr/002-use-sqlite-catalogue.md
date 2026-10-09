# ADR 002: Use SQLite for the Shuffled game catalogue

## Status

Accepted

## Context

The original BoardGameGeek integration used a deliberately small controlled catalogue of approximately 15 records. This was suitable for technical validation and deterministic testing, but it is too small to evaluate recommendation quality or support useful game discovery.

The MVP direction is now:

- approximately 100 varied games for development and recommendation-quality testing;
- approximately 300–500 games for the first public MVP;
- support for further catalogue growth without redesigning the recommendation engine.

Fetching hundreds of BoardGameGeek records whenever a user requests recommendations would be slow, unnecessarily dependent on the upstream API, and inconsistent with the existing caching and request-pacing approach.

The recommendation engine already consumes normalized application-owned JavaScript objects and should remain independent of how those records are stored.

## Decision

Shuffled will use SQLite as the persisted local catalogue for normalized game records.

BoardGameGeek data will be imported separately through a controlled catalogue-update process:

```text
BoardGameGeek
→ batched authenticated requests
→ BGG normalizer
→ SQLite catalogue
→ recommendation service
→ recommendation engine
```

Recommendation requests will read locally stored normalized records rather than fetching the full candidate catalogue from BoardGameGeek at request time.

The existing fixture data source will remain available for deterministic tests.

The current BGG request limit, pacing, retry and cache behaviour will continue to apply to catalogue imports.

## Data ownership

BGG-derived source data and Shuffled-owned metadata must remain distinguishable.

Examples of BGG-derived data include:

- title;
- player range;
- play time;
- complexity;
- mechanics;
- categories;
- ratings;
- publisher age guidance;
- community polls;
- image URLs.

Examples of Shuffled-owned data include:

- content classification;
- editorial or curated tags;
- catalogue inclusion status;
- import metadata;
- future display-specific derived fields.

Shuffled-owned metadata must not be presented as though it came from BoardGameGeek.

## Why SQLite

SQLite was chosen because:

- the MVP catalogue is small enough to fit comfortably in a local relational database;
- it requires no separate database server;
- it provides durable storage between recommendation requests;
- it supports indexed lookup and future catalogue-management queries;
- it is straightforward to test locally;
- it allows the recommendation engine to remain storage-agnostic;
- the catalogue can grow well beyond the initial MVP target without requiring a new recommendation-engine interface.

## Alternatives considered

### JSON file

A generated JSON catalogue would be simple and sufficient for several hundred games.

It was not selected as the primary catalogue because catalogue updates, metadata separation, querying and incremental maintenance would become increasingly awkward as the dataset grows.

JSON fixtures will still be used for deterministic tests.

### Fetch directly from BGG for every recommendation

Rejected because it would:

- make recommendation latency dependent on BGG;
- require multiple requests as the catalogue grows;
- create unnecessary upstream traffic;
- make temporary BGG outages directly affect normal recommendation requests.

### External hosted database

Not required for the MVP. The initial catalogue size and single-service architecture do not justify the additional operational complexity.

A hosted database can be reconsidered later if the application requires multi-instance writes, user-generated catalogue data or significantly larger operational requirements.

## Consequences

### Positive

- recommendation requests can remain fast and predictable;
- BGG availability is separated from normal recommendation requests;
- catalogue size can grow independently of the recommendation engine;
- imported data can be refreshed in controlled batches;
- app-owned metadata can be maintained separately from BGG-derived fields.

### Trade-offs

- an import/update workflow must be built and maintained;
- deployment must provide access to the SQLite catalogue file;
- catalogue freshness becomes an explicit operational concern;
- schema changes will need simple migrations or controlled rebuilds.

## Initial delivery plan

1. Define the SQLite catalogue schema.
2. Implement a catalogue repository/data-source boundary.
3. Implement batched BGG import/update logic.
4. Import an initial varied development catalogue of approximately 100 games.
5. Run recommendation-quality scenarios against that catalogue.
6. Expand toward approximately 300–500 games for the MVP.