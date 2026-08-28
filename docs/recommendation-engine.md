# Recommendation Engine

## Purpose

This document defines the first recommendation strategy for the Board Game Recommender MVP.

The recommendation engine will use transparent, rule-based logic rather than AI or machine learning.

Its purpose is to:

- turn the user's six questionnaire answers into recommendation criteria
- separate hard requirements from preferences
- score suitable games consistently
- explain why each game was recommended
- identify important trade-offs or caveats
- provide behaviour that can be tested and refined later

The first scoring model is a starting hypothesis. It should be evaluated against real game data and adjusted when testing shows that the results are not sensible.

---

## Questionnaire Inputs

### Q1 — Number of Players

**Question:** How many people will be playing?

The user selects or enters the exact number of players. The value must be a whole number of at least `1`.

Examples:

- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10

The interface may use a number selector or similar control rather than displaying every possible value as a separate option.

Player count is primarily a **hard eligibility requirement**.

A game is excluded when the selected player count falls outside the game's official minimum and maximum player range.

Community player-count data may then be used to distinguish between games that technically support the selected number but are better or worse at that player count.

---

### Q2 — Available Play Time

**Question:** How much time do you have?

Suggested choices:

- Up to 20 minutes
- About 30 minutes
- About 45–60 minutes
- About 1–2 hours
- More than 2 hours
- No preference

Play time is a weighted preference with a Version 1 exclusion boundary.

Games at or below the selected time budget receive the strongest time score.

Games no more than 10% above the selected budget remain candidates with a caveat.

Games more than 10% above the selected budget are excluded.

Selecting **No preference** removes play time from both filtering and scoring.

---

### Q3 — Desired Complexity

**Question:** How challenging do you want the game to feel?

Suggested choices:

- **Light and easy** — quick to learn and easy to get into
- **Some strategy** — simple rules with interesting decisions
- **Moderately challenging** — more rules, planning and depth
- **Deep and challenging** — complex rules and substantial strategic depth
- **No preference**

The application will translate these choices into ranges based on the normalised `complexity.average` value, which is sourced from BoardGameGeek community complexity data.

The raw BGG term **weight** should not be shown to users without explanation.

Version 1 numeric thresholds are defined in the Complexity Score section and will later be validated against representative games.

---

### Q4 — Desired Experience or Mood

**Question:** What kind of experience are you looking for?

Version 1 allows the user to select **one** mood option or **No preference**.

Suggested choices:

- **Relaxed** — low-pressure and easygoing
- **Social and lively** — conversation, laughter and interaction
- **Competitive** — direct competition and trying to outplay others
- **Cooperative** — working together toward a shared goal
- **Strategic** — planning ahead and making meaningful decisions
- **Immersive** — getting absorbed in a theme, story or world
- **Chaotic and funny** — unpredictable, silly or high-energy play
- **No preference**

Mood is not a direct BoardGameGeek field.

The application will derive mood signals from combinations of mechanics, categories and other game characteristics using transparent rules.

A game may match more than one mood, but the user selects only one mood preference in Version 1.

Mood is a **weighted preference**, not a hard filter.

---

### Q5 — Preferred Game Style

**Question:** What sounds fun to you?

Version 1 allows the user to select **one** style option or **No preference**.

Suggested choices:

- **Working things out** — deduction, puzzles or solving problems
- **Building and collecting** — collecting sets, cards, resources or combinations
- **Planning and managing** — managing resources, routes, actions or long-term strategy
- **Talking and guessing** — words, clues, communication or social deduction
- **Working together** — cooperative play and shared goals
- **Competing directly** — blocking, attacking, racing or taking things from opponents
- **Exploring a theme or story** — thematic, narrative or immersive play
- **Something quick and simple** — easy decisions and fast turns
- **No preference**

These user-facing styles will be mapped to BoardGameGeek mechanics and, where useful, categories.

The application should not show specialist mechanic names unless they are explained in plain language.

Game style is a **weighted preference**.

A game can match several styles at the same time, but the user selects only one style preference in Version 1.

---

### Q6 — Age and Content Suitability

**Question:** Who needs the game to be suitable for?

The user enters or selects the exact age of the youngest player.

The user also selects one content preference:

- Family-friendly only
- Mature or adult humour is okay
- No preference

Age suitability is a **hard eligibility requirement** in Version 1.

The application preserves both:

- publisher minimum age
- community suggested-age evidence

Publisher minimum age controls eligibility. Community age evidence is kept separately and may support a caveat, but it does not override the publisher value.

Content suitability uses reviewed application-owned metadata because BoardGameGeek does not provide one reliable field that fully describes whether a game is family-friendly, mature or adult-humour based.

When the user selects **Family-friendly only**, records with `mature` or `unknown` content classification are excluded. Other content selections do not act as hard filters.

---

## Hard Constraints and Weighted Preferences

The recommendation engine will not treat every questionnaire answer in the same way.

Some answers determine whether a game is suitable enough to be considered at all. Other answers help rank otherwise suitable games.

### Hard Constraints

Hard constraints are requirements that cannot be overridden by a strong match elsewhere in Version 1.

#### Candidate Type

Version 1 recommends standalone base games, not expansions.

The BGG technical spike showed that an expansion may still be returned as a top-level `boardgame` record, so record type alone is not enough to determine eligibility.

The normalised model preserves base-game relationship links in `relationships.baseGameIds`.

The Version 1 rule is:

```text
if relationships.baseGameIds.length > 0:
    exclude game from standalone recommendations
```

A record with one or more base-game relationships is treated as an expansion and is removed before questionnaire scoring begins.

This rule prevents an expansion from being recommended as though it were a playable standalone game.

#### Player Count

The selected number of players must fall within the game's official minimum and maximum player range.

For example:

- user selects 6 players
- game officially supports 2–5 players
- game is excluded

Community player-count polls must not be used to expand the official player range.

Once a game passes this eligibility check, community poll data may be used to judge how well the game works at the selected player count.

#### Age Suitability

Version 1 will use the publisher minimum age as the hard eligibility value.

The rule is:

```text
if youngestPlayerAge < age.publisherMinimum:
    exclude game
```

For example:

```text
Youngest player: 8
Publisher minimum age: 10
Result:
Exclude
```

If the youngest player's age is equal to or above the publisher minimum age, the game passes the age eligibility check.

Community suggested-age data does **not** override the publisher minimum age.

Instead, it may be used as supporting evidence and for caveats.

##### Community Suggested Age

Where community age-poll data exists, the Version 1 engine will define the community suggested age as the age option with the highest number of votes.

For example:

| Community age | Votes |
| ---: | ---: |
| 8 | 40 |
| 10 | 85 |
| 12 | 30 |

The derived community suggested age is:

```text
10
```

If two age values have the same highest vote count, the lower age value will be used as the community suggested age.

This derived value must remain clearly identified as community evidence rather than publisher information.

##### Age Caveat Rule

If:

```text
absolute difference between publisher minimum age
and community suggested age >= 2 years
```

the recommendation displays an age caveat.

For example:

> The publisher recommends ages 10+, while community feedback most strongly suggests ages 8+.

The publisher minimum age still controls eligibility.

##### Missing Age Data

If the publisher minimum age is unavailable and the user has provided a youngest-player age, Version 1 will exclude the game from recommendation results.

This is deliberately conservative because the engine cannot verify age suitability from its primary source.

The missing value should remain recorded in the normalised game data and may be revisited when the controlled catalogue is expanded.

If the questionnaire later allows age to be genuinely unspecified, age filtering may be skipped for that case.

---

#### Content Suitability

Version 1 will use application-owned content metadata rather than attempting to infer content suitability from unrelated BGG fields.

Each controlled catalogue record may contain:

```text
family-friendly
mature
unknown
```

These values must be supported by reviewed information rather than generated automatically from the game's title, category or mechanics.

##### Family-Friendly Only

If the user selects:

```text
Family-friendly only
```

the engine will:

- include records classified as `family-friendly`
- exclude records classified as `mature`
- exclude records classified as `unknown`

Unknown records are excluded because the application cannot confidently confirm that they satisfy the user's restriction.

##### Mature or Adult Humour Is Okay

If the user selects:

```text
Mature or adult humour is okay
```

content classification does not act as a hard filter.

Games classified as:

- `family-friendly`
- `mature`
- `unknown`

may remain candidates, subject to the other recommendation rules.

##### No Preference

If the user selects:

```text
No preference
```

content classification does not affect eligibility or weighted scoring.

##### Content Metadata Rule

Content suitability is not part of the numeric recommendation score.

It acts only as an eligibility rule when the user explicitly requests family-friendly content.

The recommendation engine must not invent a content classification when the stored value is `unknown`.

---

### Strong Preference with an Eligibility Boundary

#### Available Play Time

Play time is a weighted preference with a clear exclusion boundary.

The user's answer represents the maximum amount of time available.

Version 1 allows a game to remain a candidate when its `playTime.maxMinutes` is no more than **10% above** the selected time budget.

For example:

- user has about 60 minutes
- game maximum play time is 65 minutes
- the game remains a candidate with a time caveat

A larger mismatch excludes the game.

For example:

- user has 30 minutes
- game maximum play time is 90 minutes
- the game is excluded

The exact Version 1 time budgets and scoring values are defined in the Play-Time Score section.

Selecting **No preference** removes play time from both scoring and filtering.

---

### Weighted Preferences

Weighted preferences affect ranking but do not normally make a game completely ineligible.

#### Desired Complexity

Games closest to the user's desired complexity should receive the strongest score.

Games one level away may still receive partial credit.

Large complexity mismatches should substantially reduce a game's score but will not automatically exclude it unless later testing shows that this produces poor recommendations.

Selecting **No preference** removes complexity from scoring.

#### Experience or Mood

Games matching the selected experience or mood should receive additional score.

A game may match several mood signals.

A mood mismatch should not normally exclude an otherwise suitable game.

Selecting **No preference** removes mood from scoring.

#### Preferred Game Style

Games whose mechanics or characteristics match the user's selected style should receive additional score.

Games may match more than one style.

A style mismatch should reduce preference fit rather than make the game automatically ineligible.

Selecting **No preference** removes game style from scoring.

---

## Summary of Input Roles

| Input | Recommendation role |
| --- | --- |
| Number of players | Hard constraint + player-count suitability score |
| Available play time | Weighted preference with a 10% exclusion boundary |
| Desired complexity | Weighted preference |
| Experience / mood | Weighted preference |
| Preferred game style | Weighted preference |
| Age suitability | Hard constraint |
| Content preference | Conditional hard constraint when Family-friendly only is selected |

### No Preference Behaviour

Where **No preference** is available, selecting it means that factor contributes neither a bonus nor a penalty.

The factor is removed from both its relevant filtering behaviour and weighted scoring, except where a separate hard requirement still applies.

The engine should not treat **No preference** as a neutral category that games must match.

This prevents users from being disadvantaged for deliberately leaving a preference open.

### Missing Source Data Behaviour

Version 1 uses explicit rules for missing normalised source fields so that individual developers do not need to invent fallback behaviour.

| Missing data | Version 1 behaviour |
| --- | --- |
| Official `playerRange.min` or `playerRange.max` | Exclude the game because player eligibility cannot be verified |
| Publisher minimum age | Exclude the game when youngest-player age is supplied |
| `playTime.maxMinutes` with a defined time budget | Exclude the game because time eligibility cannot be verified |
| `complexity.average` with an active complexity preference | Assign complexity component `0.00` and do not use complexity as an explanation reason |
| Mechanics/categories needed for an active mood or style | Treat missing lists as empty; the relevant mood/style component is `0.00` unless another documented structured signal produces a match |
| Community player-count poll | Use the documented neutral player-count score of `0.50` |
| Normalised rating tie-break fields | Skip the missing field and continue to the next tie-break rule |

When a factor is **No preference**, missing data for that factor does not create a penalty or exclusion unless a separate hard eligibility rule applies.

These rules are intentionally conservative: missing evidence must not be silently converted into a strong recommendation signal.

---

## Initial Scoring Model

The recommendation engine will use a weighted scoring model after hard eligibility checks have been applied.

The internal score may use numeric values for ranking and testing, but the exact numeric score will not be shown to the user.

User-facing results will use simple labels such as:

- Excellent match
- Strong match
- Good match

### Scoring Process

For each candidate game:

1. Apply hard eligibility checks.

2. Exclude games that clearly fail those checks.

3. Calculate scores for the remaining preference factors.

4. Apply the relevant weight to each factor.

5. Combine the weighted scores.

6. Rank games from strongest to weakest match.

7. Generate an explanation and any relevant caveat.

---

## Initial Factor Weights

| Factor | Initial Weight |
| --- | ---: |
| Player-count suitability | 25% |
| Play-time fit | 20% |
| Complexity fit | 20% |
| Experience / mood fit | 20% |
| Game-style fit | 15% |
| **Total** | **100%** |

Age and reliable content suitability are not included in the weighted total because they are primarily handled as eligibility checks.

These weights are initial hypotheses and may be adjusted after recommendation testing.

### Why Player Count Has the Highest Weight

A game may technically support a particular number of players while being substantially better or worse at that count.

The BGG technical spike showed this clearly across games such as Codenames, 7 Wonders and Love Letter.

Player-count suitability therefore receives slightly more weight than the other preference factors.

---

## Handling "No Preference"

If the user chooses **No preference** for a weighted factor, that factor is removed from the calculation.

The remaining active weights are then normalised so that the final internal score still represents the strength of the available evidence.

For example, if the user selects no preference for mood and style, the engine should not give every game zero points for those categories.

Only player-count suitability, time and complexity would contribute to the ranking.

---

## Component Scores

Each active preference factor will initially produce a component score between `0.00` and `1.00`.

| Score | Meaning |
| ---: | --- |
| `1.00` | Very strong fit |
| `0.75` | Good fit |
| `0.50` | Partial or acceptable fit |
| `0.25` | Weak fit |
| `0.00` | No meaningful fit |

The exact rules for producing these component scores are defined below.

---

## Player-Count Suitability Score

A game must first pass the official player-range eligibility check.

If the user's exact player count is outside the game's official `playerRange.min` and `playerRange.max` range, the game is excluded before community polling is considered.

Community polling is then used only to judge **how well the game works at that valid player count**.

### Selecting the Relevant Poll Row

The engine will look for the normalised `playerCountPoll` entry whose `players` label matches the user's exact player count.

For example:

```text
User selects: 4 players
Poll row used: "4"
```

If an exact entry is unavailable, the engine uses an open-ended `playerCountPoll` label such as `7+` where:

- the selected player count is equal to or above the number in that bucket
- the selected player count is still inside the game's official player range
- no more specific poll row exists

If several open-ended buckets could match, the most specific applicable bucket is used.

For example:

```text
Selected player count: 8
Available rows:
7+
8+
Use:
8+
```

Community poll rows must never expand the game's official player range.

---

### Community Poll Values

For the selected poll row, BGG provides vote counts for:

- `Best`
- `Recommended`
- `Not Recommended`

The first version of the engine will assign the following value to each type of vote:

| Vote type | Value |
| --- | ---: |
| Best | `1.00` |
| Recommended | `0.75` |
| Not Recommended | `0.00` |

A **Best** vote therefore contributes more positive evidence than a **Recommended** vote.

A **Not Recommended** vote contributes no positive suitability score.

---

### Raw Player Suitability Score

The raw suitability score is calculated as:

```text
(Best × 1.00) + (Recommended × 0.75)
------------------------------------------------
Best + Recommended + Not Recommended
```

For example:

```text
Best:             100
Recommended:       80
Not Recommended:   20
Raw score =
(100 × 1.00) + (80 × 0.75)
----------------------------
100 + 80 + 20
= 160 / 200
= 0.80
```

This produces a raw score between `0.00` and `1.00`.

The formula uses proportions rather than comparing raw vote totals between different games.

---

### Confidence Adjustment

Community polls with very few votes should not be treated as equally reliable to polls with substantial community evidence.

Version 1 will therefore apply a simple confidence adjustment.

The confidence value is:

```text
minimum(total votes / 50, 1.00)
```

This means:

| Total votes | Confidence |
| ---: | ---: |
| 5 | `0.10` |
| 10 | `0.20` |
| 25 | `0.50` |
| 40 | `0.80` |
| 50 or more | `1.00` |

The threshold of 50 votes is an initial hypothesis and should be evaluated later.

---

### Confidence-Adjusted Player Score

Low-confidence poll results are pulled toward a neutral score of `0.50`.

The final player-count suitability component is:

```text
(confidence × raw score) + ((1 - confidence) × 0.50)
```

For example:

```text
Raw suitability score: 0.90
Total votes:            10
Confidence:
10 / 50 = 0.20
Adjusted score:
(0.20 × 0.90) + (0.80 × 0.50)
= 0.18 + 0.40
= 0.58
```

Although the small poll looks very positive, the engine does not treat ten votes as strong evidence.

By comparison, if the same `0.90` raw score came from at least 50 votes:

```text
Confidence = 1.00
Adjusted score:
(1.00 × 0.90) + (0 × 0.50)
= 0.90
```

---

### Missing Community Poll Data

If:

- no suitable player-count poll row exists, or
- the relevant poll row contains zero votes

the game receives a neutral player-count suitability component score of:

```text
0.50
```

The game is **not excluded** solely because community polling is missing.

Its official player range has already established that the selected player count is supported.

This prevents missing community data from being treated as evidence that a game is either particularly good or particularly bad at that count.

---

### Version 1 Player-Count Algorithm

For each candidate game:

1. Check whether the selected player count is inside official `playerRange.min` and `playerRange.max`.

2. If not, exclude the game.

3. Find the exact matching community player-count poll row.

4. If no exact row exists, use the most specific applicable open-ended row where available.

5. If no usable poll data exists, assign a neutral score of `0.50`.

6. Calculate the raw suitability score from Best, Recommended and Not Recommended votes.

7. Calculate confidence using `minimum(total votes / 50, 1.00)`.

8. Pull low-confidence results toward the neutral value of `0.50`.

9. Use the confidence-adjusted result as the player-count suitability component score.

The 50-vote confidence threshold and vote weights are Version 1 hypotheses.

They should be validated against the larger recommendation-quality dataset and adjusted if testing shows that they produce unreasonable rankings.

## Play-Time Score

The user's play-time answer represents the **maximum amount of time available**, rather than a preferred game length.

A shorter game should therefore not be penalised simply because the user has more time available.

### Time Budgets

The questionnaire choices map to the following internal time budgets:

| User choice | Internal time budget |
| --- | ---: |
| Up to 20 minutes | 20 minutes |
| About 30 minutes | 30 minutes |
| About 45–60 minutes | 60 minutes |
| About 1–2 hours | 120 minutes |
| More than 2 hours | No upper limit for MVP scoring |
| No preference | Factor removed from scoring |

The game's `playTime.maxMinutes` value will be compared with the selected time budget.

### Initial Time-Scoring Rule

For questionnaire choices with a defined time budget:

| Game maximum play time | Component score | Behaviour |
| --- | ---: | --- |
| At or below the user's budget | `1.00` | Strong match |
| Up to 10% above the user's budget | `0.50` | Keep candidate and show a time caveat |
| More than 10% above the user's budget | — | Exclude game |

For example, if the user has selected a 60-minute budget:

- a 45-minute game → `1.00`
- a 60-minute game → `1.00`
- a 65-minute game → `0.50` and a caveat
- a 90-minute game → excluded

The 10% tolerance is an initial hypothesis chosen to allow small differences in published play-time estimates without allowing clearly unsuitable games through.

It should be tested against representative games and adjusted later if recommendation testing shows that it is too strict or too generous.

### More Than 2 Hours

Selecting **More than 2 hours** means that play time will not impose an upper eligibility limit.

Games with long play times may therefore remain candidates.

Play time will contribute a component score of `1.00` for this selection because the user has explicitly indicated that long games are acceptable.

### No Preference

Selecting **No preference** removes play time from both filtering and weighted scoring.

The remaining active weights are then normalised normally.

---

## Complexity Score

The normalised `complexity.average` value is sourced from BoardGameGeek's `averageweight` field, which uses an approximate 1–5 scale.

The MVP will translate this into beginner-friendly categories.

### Initial Complexity Bands

| User choice | Strong match | Partial match |
| --- | --- | --- |
| Light and easy | `1.00 <= complexity.average <= 1.75` | `1.75 < complexity.average <= 2.25` |
| Some strategy | `1.50 <= complexity.average <= 2.50` | `1.00 <= complexity.average < 1.50` or `2.50 < complexity.average <= 3.00` |
| Moderately challenging | `2.50 <= complexity.average <= 3.50` | `2.00 <= complexity.average < 2.50` or `3.50 < complexity.average <= 4.00` |
| Deep and challenging | `3.50 <= complexity.average <= 5.00` | `3.00 <= complexity.average < 3.50` |

Initial scoring:

- inside the strong-match range → `1.00`
- inside the partial-match range → `0.50`
- outside both ranges → `0.00`

The inequalities are explicit so that normalised complexity values with several decimal places cannot fall into gaps between bands.

The ranges deliberately overlap between neighbouring user choices because complexity perception is not exact.

These thresholds are Version 1 hypotheses and must be tested against representative games.

---

## Mood Score

Mood is an application-derived concept.

The engine will calculate mood fit from a documented set of BGG mechanics, categories and structured game characteristics.

Each mood has:

- **primary signals** — strong evidence that the game provides that experience
- **secondary signals** — useful but weaker evidence

### Mood Scoring Rule

For the user's selected mood:

| Evidence | Component score |
| --- | ---: |
| At least one primary signal | `1.00` |
| No primary signal, but at least one secondary signal | `0.50` |
| No mapped signal | `0.00` |

A game may match several moods at once.

The mappings below define the Version 1 rules.

---

### Relaxed

A game receives a strong **Relaxed** signal when all of the following are true:

- `complexity.average <= 2.00`
- `playTime.maxMinutes <= 60`
- the game does not contain a mapped high-conflict mechanic

Version 1 high-conflict mechanics are:

- `Take That`
- `Player Elimination`
- `Area Majority / Influence`
- `Area Control`
- `Auction / Bidding`
- `Betting and Bluffing`

A game receives a secondary Relaxed signal when:

- `complexity.average <= 2.50`
- and none of the high-conflict mechanics above are present

This is an application-derived rule rather than a BGG-supplied mood classification.

---

### Social and Lively

Primary signals:

- `Communication Limits`
- `Team-Based Game`
- `Acting`
- `Singing`
- `Role Playing`
- `Storytelling`
- `Player Judge`
- `Voting`

Secondary signals:

- category `Party Game`
- category `Word Game`
- mechanic `Deduction`
- mechanic `Memory`

---

### Competitive

Primary signals:

- `Take That`
- `Player Elimination`
- `Area Majority / Influence`
- `Area Control`
- `Auction / Bidding`
- `Betting and Bluffing`
- `Race`
- `Trick-taking`

Secondary signals:

- `Network and Route Building`
- `Set Collection`
- `Majority Influence`
- `Market`

A game should not receive a Competitive mood signal solely because it is not cooperative.

---

### Cooperative

Primary signals:

- `Cooperative Game`
- `Team-Based Game`

Secondary signals:

- `Communication Limits` when combined with `Cooperative Game`
- `Traitor Game` when the overall game structure still contains cooperative team play

Official player eligibility remains independent of these mechanics.

A cooperative or solo-related mechanic must never override official `playerRange.min` and `playerRange.max`.

---

### Strategic

Primary signals:

- `Worker Placement`
- `Action Drafting`
- `Action Points`
- `Network and Route Building`
- `Tech Trees / Tech Tracks`
- `Market`
- `Loans`
- `Income`
- `Resource to Move`
- `Area Majority / Influence`

Secondary signals:

- `Hand Management`
- `Set Collection`
- `Open Drafting`
- `End Game Bonuses`
- `Variable Player Powers`

A game may also receive a secondary Strategic signal when:

```text
complexity.average >= 2.50
```

even if no mapped strategic mechanic is present.

---

### Immersive

Primary signals:

- `Narrative Choice / Paragraph`
- `Storytelling`
- `Scenario / Mission / Campaign Game`
- `Role Playing`
- `Campaign / Battle Card Driven`

Secondary signals include the following categories:

- `Adventure`
- `Fantasy`
- `Horror`
- `Science Fiction`
- `Exploration`
- `Mythology`
- `Movies / TV / Radio theme`

A theme category by itself provides secondary rather than primary evidence because theme does not guarantee an immersive experience.

---

### Chaotic and Funny

Primary signals:

- `Take That`
- `Push Your Luck`
- `Player Judge`
- `Acting`
- `Singing`
- `Betting and Bluffing`

Secondary signals:

- category `Party Game`
- mechanic `Dice Rolling`
- mechanic `Simultaneous Action Selection`
- mechanic `Real-Time`

The presence of one of these signals does not mean that the game is objectively funny.

The application uses them only as evidence for unpredictable, high-energy or socially playful experiences.

---

## Game-Style Score

Game style translates BGG terminology into choices that make sense to less experienced players.

Each user-facing style has primary and secondary source signals.

### Style Scoring Rule

For the user's selected style:

| Evidence | Component score |
| --- | ---: |
| At least one primary signal | `1.00` |
| No primary signal, but at least one secondary signal | `0.50` |
| No mapped signal | `0.00` |

A game may match more than one style.

---

### Working Things Out

Primary signals:

- `Deduction`
- `Pattern Recognition`
- `Pattern Building`
- `Logic`
- `Memory`

Secondary signals:

- `Hidden Roles`
- `Secret Unit Deployment`
- `Questions and Answers`

This style represents games focused on solving, identifying, deducing or recognising information.

---

### Building and Collecting

Primary signals:

- `Set Collection`
- `Deck, Bag, and Pool Building`
- `Deck Construction`
- `Pattern Building`
- `Tile Placement`

Secondary signals:

- `Open Drafting`
- `Closed Drafting`
- `Card Drafting`
- `Hand Management`
- `End Game Bonuses`

---

### Planning and Managing

Primary signals:

- `Worker Placement`
- `Action Points`
- `Action Drafting`
- `Network and Route Building`
- `Market`
- `Loans`
- `Income`
- `Tech Trees / Tech Tracks`
- `Resource to Move`

Secondary signals:

- `Hand Management`
- `Open Drafting`
- `Variable Player Powers`
- `End Game Bonuses`
- `Area Majority / Influence`

---

### Talking and Guessing

Primary signals:

- `Communication Limits`
- `Deduction`
- `Acting`
- `Storytelling`
- `Questions and Answers`

Secondary signals:

- `Team-Based Game`
- `Voting`
- `Hidden Roles`
- category `Word Game`
- category `Party Game`

---

### Working Together

Primary signals:

- `Cooperative Game`
- `Team-Based Game`

Secondary signals:

- `Communication Limits` when the game also contains cooperative play
- `Traitor Game` where most players are working toward a shared team objective

This style does not change player eligibility.

---

### Competing Directly

Primary signals:

- `Take That`
- `Player Elimination`
- `Area Majority / Influence`
- `Area Control`
- `Auction / Bidding`
- `Betting and Bluffing`
- `Race`

Secondary signals:

- `Network and Route Building`
- `Trick-taking`
- `Market`

This style is intended for games where players meaningfully affect one another rather than simply comparing final scores after mostly separate play.

---

### Exploring a Theme or Story

Primary signals:

- `Narrative Choice / Paragraph`
- `Storytelling`
- `Scenario / Mission / Campaign Game`
- `Role Playing`

Secondary signals include categories such as:

- `Adventure`
- `Fantasy`
- `Horror`
- `Science Fiction`
- `Exploration`
- `Mythology`

A thematic category alone provides partial evidence rather than a full style match.

---

### Something Quick and Simple

This style is calculated mainly from structured complexity and play-time data rather than one specific mechanic.

A game receives a strong match when:

```text
complexity.average <= 1.75
AND
playTime.maxMinutes <= 30
```

Component score:

```text
1.00
```

A game receives a partial match when:

```text
complexity.average <= 2.25
AND
playTime.maxMinutes <= 45
```

Component score:

```text
0.50
```

Otherwise:

```text
0.00
```

This allows quick and simple games to be identified from their actual characteristics rather than requiring BGG to provide a mechanic with that name.

---

## Mapping Implementation Rules

Version 1 will use the mappings above as explicit lookup rules.

During normalisation, BGG mechanics and categories remain stored using their source names.

The recommendation layer then compares those source values against the configured mood and style mappings.

Matching should use exact normalised names rather than loose keyword searching.

For example:

```text
BGG mechanic:
Cooperative Game
Mapped application values:
Mood → cooperative
Style → working-together
```

One source mechanic may contribute to more than one user-facing concept.

This is intentional.

The mapping configuration should be kept separate from recommendation calculation code so that mappings can be reviewed, tested and changed without rewriting the scoring algorithm.

---

## Unknown or Unmapped Mechanics

BGG may contain mechanics or categories that are not included in the Version 1 mapping.

An unmapped value should:

- remain available in the normalised source record
- contribute no mood or style score
- not cause an error
- not be automatically assigned to a user-facing concept

New mappings should be added deliberately after review rather than inferred automatically from the mechanic name.

---

## Mapping Validation

The Version 1 mappings are hypotheses.

They should later be tested against the controlled recommendation dataset.

Testing should identify cases where:

- a game receives a mood that does not reasonably describe its experience
- a game fails to receive an obvious mood or style
- one common mechanic creates too many unrelated matches
- primary and secondary evidence should be reclassified
- additional mechanics or categories need explicit mappings

Changes should be documented so that the recommendation model remains explainable.

---

## Missing or Unavailable Source Data

Version 1 uses explicit fallback behaviour when required BGG source fields are missing or invalid.

| Missing or invalid field | Version 1 behaviour |
| --- | --- |
| Official `playerRange.min` or `playerRange.max` | Exclude the game because player eligibility cannot be verified |
| Relevant community player-count poll | Keep the game and use the neutral player suitability score of `0.50` |
| `playTime.maxMinutes` when a finite time budget is active | Exclude the game because time fit cannot be verified |
| `playTime.maxMinutes` when **More than 2 hours** is selected | Keep the game and use the time component `1.00` |
| `playTime.maxMinutes` when **No preference** is selected | Ignore play time |
| `complexity.average` when complexity is active | Use complexity component `0.00` because there is no evidence of a complexity match |
| `complexity.average` when complexity is **No preference** | Ignore complexity |
| Publisher minimum age | Exclude the game when a youngest-player age is supplied |
| Community age poll | Keep the game; no community-age caveat is generated |
| Content classification | Treat as `unknown` |
| Mechanics/categories used for selected mood or style | Unmapped or absent signals contribute no mood/style evidence |
| `ratings.bayesianAverage` or `ratings.usersRated` | Skip that tie-break field and continue to the next rule |

For normalised numeric fields, non-numeric values, `N/A`, null values and invalid zero values are treated as missing where the field is expected to be positive.

These rules are deliberately conservative for hard eligibility checks and transparent for weighted preferences.

---

## Internal Score Calculation

The basic internal calculation is:

```text
sum(component score × active factor weight)
------------------------------------------------
sum(active factor weights)
```

This produces an internal score between `0.00` and `1.00`.

For example:

```text
Player suitability: 1.00 × 25
Time:               0.50 × 20
Complexity:         1.00 × 20
Mood:               0.50 × 20
Style:              1.00 × 15
```

With all five factors active:

```text
(25 + 10 + 20 + 10 + 15) / 100 = 0.80
```

The resulting internal score is `0.80`, which falls within the Version 1 **Strong match** range.

The engine uses this score to rank eligible games.

The exact number is an internal implementation detail and should not be shown to users as a precise percentage match.

---

## Match Labels

The internal recommendation score will be used to rank games, but users will see simple match labels instead of numeric percentages.

Version 1 labels:

| Internal score | User-facing label |
| --- | --- |
| `score >= 0.85` | Excellent match |
| `0.70 <= score < 0.85` | Strong match |
| `0.55 <= score < 0.70` | Good match |
| `score < 0.55` | Not shown |

These thresholds are initial values and may be adjusted after recommendation testing.

A game must pass all hard eligibility checks before a match label can be assigned.

Version 1 does not show games below `0.55`, even when fewer than three recommendations remain.

---

## Partial Matches

A game does not need to perfectly match every weighted preference to be recommended.

A partial match may still be useful when:

- the game passes all hard eligibility checks
- one or more weighted factors receive partial credit
- the final internal score remains at or above `0.55`
- any triggered caveat can be clearly explained

For example:

- the user wants a cooperative game for four players
- the game is an excellent four-player cooperative game
- its complexity is slightly higher than requested
- it may still be recommended with a complexity caveat

Partial matches should be ranked below otherwise similar games that match more closely.

---

## Tie Handling

Two games are treated as tied when their final internal scores are equal after rounding to **four decimal places**.

Ties are resolved in this order:

1. higher player-count suitability component
2. higher play-time component
3. higher complexity component
4. higher mood component
5. higher style component
6. higher `ratings.bayesianAverage`
7. higher `ratings.usersRated`
8. game name in ascending alphabetical order
9. application-owned `id` in ascending order as the final stable fallback

If a preference factor is inactive because the user selected **No preference**, that component is skipped during tie-breaking.

If a tie-break field is missing, that field is treated as unavailable and the engine moves to the next tie-break rule.

Ratings are therefore used only as late secondary evidence.

A highly rated game cannot outrank a substantially better preference match merely because it is more popular.

---

## Recommendation Count

The normal target is approximately 3–5 recommendations.

Version 1 will:

- sort eligible games by final internal score
- keep only games with an internal score of at least `0.55`
- return the strongest five qualifying games at most
- return fewer than three when fewer than three games meet the threshold
- show a limited-match message when 1–2 games qualify
- show a no-match message when no game qualifies

The engine will not lower the `0.55` display threshold merely to fill the results list.

The result count is therefore a presentation target rather than a rule that overrides recommendation quality.

---

## Caveat Rules

A caveat is shown when a recommendation is still useful but contains an important trade-off that could affect the user's decision.

Caveats must be:

- short
- specific
- based on identifiable data or recommendation rules
- written in plain language
- limited to information that is likely to matter to the user

Version 1 uses the explicit rules below.

### Player-Count Caveat

Show a player-count caveat when:

- the selected player count is inside the official range
- the confidence-adjusted player-count suitability component is **below `0.50`**
- the game still reaches the overall display threshold

Example:

> Works with 2 players, but community feedback is less positive at this player count.

A game outside the official player range is excluded and never receives this caveat.

Missing poll data produces a neutral `0.50` player score and does not trigger a player-count caveat.

### Play-Time Caveat

Show a time caveat when:

- the game's `playTime.maxMinutes` is above the selected time budget
- the overrun is no more than 10%
- the game therefore remains eligible under the Version 1 tolerance

Example:

> This may run a little longer than your preferred 60 minutes.

A game more than 10% above the selected budget is excluded instead.

### Complexity Caveat

Show a complexity caveat when:

- the complexity component score is `0.50`
- the overall game score still reaches the display threshold

The wording depends on which side of the selected strong-match range the game's `complexity.average` falls:

- above the strong-match range → `This is slightly more complex than the level you selected.`
- below the strong-match range → `This is slightly lighter than the level you selected.`

No complexity caveat is shown when complexity is **No preference**, when the complexity component is `1.00`, or when `complexity.average` is missing.

### Age Caveat

Show an age caveat when:

- community age-poll data exists
- a community suggested age can be derived
- the absolute difference between publisher minimum age and community suggested age is at least 2 years

Example:

> The publisher recommends ages 10+, while community feedback most strongly suggests ages 8+.

Publisher minimum age still controls eligibility.

### Content Caveat

Version 1 does not generate a generic content caveat from BGG categories or mechanics.

Content is handled through the reviewed application-owned classification:

- `family-friendly`
- `mature`
- `unknown`

If **Family-friendly only** is selected, `mature` and `unknown` records are excluded rather than shown with a caveat.

### Low-Confidence Data

Low player-poll confidence affects the internal player-count score through the confidence adjustment.

Version 1 does **not** show a separate low-confidence user-facing caveat.

This avoids cluttering recommendation cards with technical evidence-quality information that is already accounted for internally.

---

## Recommendation Explanations

Each recommendation will generate a short explanation from the structured factors that contributed to its ranking.

Version 1 will:

1. consider the active weighted factors only
2. rank those factors by their weighted contribution to the final score
3. use the strongest **two** factors with component scores of at least `0.50`
4. if weighted contributions are equal, prefer factors in this order: player count, play time, complexity, mood, style
5. use one factor if only one meets the `0.50` threshold
6. append a relevant caveat separately when a caveat rule is triggered

For example:

> A strong fit for 4 players and comfortably inside your one-hour limit.

If cooperative style is also one of the two strongest factors:

> A strong fit for 4 players, with the cooperative style you selected.

The explanation must:

- refer to real scoring factors
- prioritise the strongest matching reasons
- avoid unsupported claims
- use plain language
- avoid exposing internal numeric calculations

The expanded **Why this game?** view may show additional structured detail, including:

- player-count suitability
- time fit
- complexity fit
- mood fit
- style fit
- relevant caveats

The explanation system uses structured recommendation evidence rather than arbitrary marketing-style text.

---

## Example User Scenarios

These scenarios are intended to test whether the recommendation rules produce sensible results before implementation is complete.

They describe the expected characteristics of suitable recommendations rather than requiring one specific game.

---

### Scenario 1 — Casual Family Game

#### User Answers

- Players: 4
- Time: About 45–60 minutes
- Complexity: Light and easy
- Mood: Social and lively
- Style: Talking and guessing
- Youngest player: 10
- Content preference: Family-friendly only

#### Expected Recommendation Characteristics

Suitable games should:

- officially support 4 players
- work well with 4 according to community player-count evidence
- fit comfortably within approximately one hour
- have low complexity
- support social interaction, communication, guessing or similar play
- be appropriate for the selected age
- have reliable family-friendly content information

Games that are technically playable with 4 but perform poorly at that count should rank lower.

Very complex games should rank poorly even if their player count and play time fit.

---

### Scenario 2 — Two-Player Strategic Game

#### User Answers

- Players: 2
- Time: About 1–2 hours
- Complexity: Moderately challenging
- Mood: Strategic
- Style: Planning and managing
- Youngest player: 18
- Content preference: No preference

#### Expected Recommendation Characteristics

Suitable games should:

- officially support 2 players
- preferably have strong community support at 2 players
- fit within the 120-minute time budget
- have medium-to-high strategic depth
- include mechanics associated with planning, resource management, route building, action management or similar systems

A game that technically allows 2 players but is widely considered much better with 4 or more should receive a lower player-count suitability score.

Very light party games should rank poorly because they do not match the selected complexity, mood or style.

---

### Scenario 3 — Quick Cooperative Game

#### User Answers

- Players: 4
- Time: About 30 minutes
- Complexity: Some strategy
- Mood: Cooperative
- Style: Working together
- Youngest player: 12
- Content preference: Family-friendly only

#### Expected Recommendation Characteristics

Suitable games should:

- officially support 4 players
- have strong or acceptable community support at 4
- normally finish within approximately 30 minutes
- contain clear cooperative mechanics or shared-goal play
- offer some decision-making without being highly complex
- be suitable for the selected age and content preference

A strong cooperative game with a maximum play time of up to 33 minutes may still be considered as a partial time match with a caveat.

A 90-minute cooperative game is excluded because the time mismatch is more than 10% above the 30-minute budget.

---

### Scenario 4 — Large Social Group

#### User Answers

- Players: 7
- Time: About 30 minutes
- Complexity: Light and easy
- Mood: Chaotic and funny
- Style: Talking and guessing
- Youngest player: 18
- Content preference: No preference

#### Expected Recommendation Characteristics

Suitable games should:

- officially support at least 7 players
- have positive community evidence at large player counts
- be quick to explain and play
- support high interaction
- favour communication, guessing, humour or unpredictable group play
- avoid requiring substantial strategic planning or long individual turns

A game that officially supports 7 but has poor community feedback at that count should rank below games that perform strongly with larger groups.

---

### Scenario 5 — Solo Immersive Game

#### User Answers

- Players: 1
- Time: About 1–2 hours
- Complexity: Moderately challenging
- Mood: Immersive
- Style: Exploring a theme or story
- Youngest player: 18
- Content preference: No preference

#### Expected Recommendation Characteristics

Suitable games should:

- officially support solo play
- fit reasonably within the available time
- provide meaningful strategic or thematic engagement
- have moderate complexity
- contain strong thematic, narrative or immersive signals

A game that lists a solo-related mechanic but officially requires at least 2 players must be excluded.

This scenario specifically tests the rule that mechanics and community polls must not override official player eligibility.

---

### Scenario 6 — Open Preferences

#### User Answers

- Players: 3
- Time: No preference
- Complexity: No preference
- Mood: No preference
- Style: No preference
- Youngest player: 14
- Content preference: No preference

#### Expected Recommendation Characteristics

The recommendation engine should:

- restrict candidates to games officially supporting 3 players
- apply age eligibility
- use player-count suitability as the main ranking factor
- remove time, complexity, mood and style from the weighted calculation
- normalise the remaining active weights correctly

The engine must not penalise games because the user selected **No preference**.

This scenario tests whether dynamic weight normalisation works correctly.

---

## Scenario Testing Purpose

These scenarios should later become part of recommendation-engine testing.

For each scenario, testing should check:

- whether unsuitable games are excluded correctly
- whether strong matches rank above weaker matches
- whether partial matches behave sensibly
- whether caveats appear only when useful
- whether "No preference" factors are removed correctly
- whether explanations accurately reflect the factors that affected ranking

The initial scoring weights and thresholds should be adjusted if repeated testing produces recommendations that do not match reasonable expectations.

---

## Open Questions and Assumptions

The Version 1 recommendation model is defined well enough to implement consistently.

Several values and mappings are still hypotheses that should be validated through testing rather than treated as permanent rules.

### Complexity Threshold Validation

The Version 1 `complexity.average` bands are defined, but they remain provisional.

They should be tested against representative games to check whether the user-facing categories:

- Light and easy
- Some strategy
- Moderately challenging
- Deep and challenging

produce results that feel sensible.

If games repeatedly fall into unintuitive categories, the thresholds should be adjusted and the change documented.

---

### Play-Time Tolerance Validation

Version 1 uses a **10% tolerance above the user's time budget**.

This is an explicit implementation rule, but it is still a hypothesis.

Testing should determine whether 10%:

- allows reasonable small differences in published play times
- is too strict for shorter games
- is too generous for longer games

If the rule changes, the reason should be recorded.

---

### Player Poll Formula Validation

Version 1 defines an explicit player-count suitability formula using:

- Best votes
- Recommended votes
- Not Recommended votes
- total vote count
- a confidence adjustment based on a 50-vote threshold

The formula is implementable as written.

Testing should determine whether:

- `Best = 1.00`
- `Recommended = 0.75`
- the neutral value of `0.50`
- the 50-vote confidence threshold

produce reasonable rankings across different games.

These values may be refined later without changing the overall source-data model.

---

### Mood Mapping Validation

Version 1 contains explicit primary and secondary mappings between BGG data and user-facing moods.

These mappings should be tested against representative games to identify cases where:

- a game receives a mood that does not reasonably describe it
- an obvious mood is missing
- one mechanic causes too many unrelated matches
- a primary signal should instead be secondary, or vice versa

Changes should be deliberate and documented.

---

### Game-Style Mapping Validation

Version 1 also contains explicit mappings for each user-facing game style.

Testing should determine whether those mappings produce sensible results across varied game types.

Additional BGG mechanics or categories may be added to the mappings later when there is a clear reason to do so.

Unmapped values should remain unmapped rather than being automatically guessed.

---

### Content Metadata

BGG does not provide one reliable field that completely describes whether a game is family-friendly, mature or contains adult humour.

Version 1 therefore uses application-owned content metadata with three states:

- `family-friendly`
- `mature`
- `unknown`

The remaining implementation question is how this reviewed metadata will be created and maintained for the controlled recommendation catalogue.

Content classifications must be based on reliable information rather than automatically inferred from unrelated BGG fields.

---

### Community Age Evidence

Version 1 uses publisher minimum age as the hard eligibility value.

Community age polling is preserved separately and the most-voted age is used as supporting evidence.

The rule is implementable, but recommendation testing should determine whether the current **2-year difference** threshold produces useful age caveats without generating unnecessary warnings.

---

### Recommendation Quality Dataset

The 15-record BGG technical-spike dataset validated the integration model but is not large enough to validate recommendation quality.

A larger controlled dataset of approximately 30–50+ games should later be used to test:

- questionnaire combinations
- scoring behaviour
- ranking quality
- edge cases
- caveat generation
- explanation quality
- confidence behaviour

The purpose of this testing is to refine the Version 1 hypotheses, not to invent missing implementation rules during development.

---

## Current Recommendation Strategy

The MVP recommendation strategy is currently:

1. Collect the six questionnaire inputs.
2. Remove expansion records from the standalone candidate set.
3. Apply the hard official player-count eligibility check.
4. Apply publisher minimum-age eligibility.
5. Apply the family-friendly content filter when that restriction is selected.
6. Apply the 10% play-time exclusion boundary when a time budget is active.
7. Apply the documented missing-source-data rules where required.
8. Score eligible games using:
   - player-count suitability
   - play-time fit
   - complexity fit
   - experience / mood fit
   - game-style fit
9. Remove any weighted factor where the user selected **No preference**.
10. Normalise the remaining active weights.
11. Calculate and rank games by final internal score.
12. Resolve ties using the documented tie-break sequence.
13. Keep only games scoring at least `0.55`.
14. Return up to five qualifying recommendations.
15. Generate plain-language explanations from the strongest scoring factors.
16. Show caveats only when one of the explicit Version 1 caveat rules is triggered.
17. Show limited-match or no-match messaging when too few games qualify.

The recommendation engine is deliberately transparent, rule-based and testable.

Its initial weights, thresholds and mappings are hypotheses that will be refined through implementation and recommendation-quality testing.
