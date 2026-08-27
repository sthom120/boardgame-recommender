# MVP Requirements

## Purpose

This document defines the requirements for the first working version of the Board Game Recommender.

The application is designed for casual or relatively inexperienced board-game players who want help choosing a game but may not know enough about board games to confidently compare their options.

The MVP will guide the user through a short questionnaire and recommend a small number of games that suit their situation and preferences. Recommendations should explain why each game is a good match rather than relying only on ratings or popularity.

## MVP Scope

The MVP will allow a user to:

- answer six guided questions about their group and preferences
- receive approximately 3–5 suitable board-game recommendations
- see why each game was recommended
- see important information such as player count, play time, complexity and age suitability
- see a useful caveat or trade-off where relevant
- follow a link to the game's BoardGameGeek page

The six recommendation inputs are:

1. Number of players
2. Available play time
3. Desired complexity
4. Desired experience or mood
5. Preferred game style
6. Age and content suitability

The MVP will use BoardGameGeek data as a source of game information. Application-owned recommendation rules will interpret this data to determine how well each game matches the user's answers.

---

## Functional Requirements

### FR-01 — Guided Recommendation Questionnaire

The system shall guide the user through a questionnaire containing the six MVP recommendation inputs:

1. Number of players
2. Available play time
3. Desired complexity
4. Desired experience or mood
5. Preferred game style
6. Age and content suitability

The questions shall use plain language so that users do not need existing board-game knowledge.

### FR-02 — Review Answers

The system shall allow the user to review their questionnaire answers before generating recommendations.

The user shall be able to return to an earlier question and change an answer.

### FR-03 — Generate Recommendations

The system shall use the user's questionnaire answers to identify suitable board games.

The normal result should contain approximately 3–5 recommendations when enough suitable games are available.

### FR-04 — Match Strength

Each recommendation shall include a simple match-strength label.

The MVP should use understandable labels such as:

- Excellent match
- Strong match
- Good match

The application shall not present false-precision percentage scores to the user.

### FR-05 — Explain Recommendations

Each recommendation shall explain why the game suits the user's answers.

The explanation shall be based on identifiable recommendation factors rather than presenting the result as an unexplained ranking.

### FR-06 — Display Game Information

Each recommendation shall display useful game information, including where available:

- game name
- image
- player count
- play time
- complexity
- age suitability
- short description
- main game style or experience

### FR-07 — Show Important Caveats

The system shall show a short "good to know" caveat when there is an important trade-off or limitation.

Examples may include:

- the selected player count is supported but not one of the game's strongest player counts
- the game may take longer than the user's preferred time
- community age guidance differs from the publisher's minimum age

### FR-08 — BoardGameGeek Link and Attribution

Each recommendation shall provide a link to the relevant BoardGameGeek game page.

The application shall include the required BoardGameGeek attribution for BGG-sourced data.

### FR-09 — No Suitable Match

If the system cannot find enough suitable recommendations, it shall clearly explain this to the user.

The system should suggest changing one or more questionnaire answers rather than returning clearly unsuitable games simply to fill the results list.

### FR-10 — Loading and Error States

The system shall provide clear feedback while recommendations or game information are loading.

If game data cannot be retrieved or another system error occurs, the application shall display a clear, user-friendly error message rather than failing silently.

---

## Non-Functional Requirements

### NFR-01 — Accessibility

The application shall be designed so that it can be used by people with different accessibility needs.

The MVP shall:

- support keyboard navigation
- use clear form labels
- provide visible focus states
- avoid relying on colour alone to communicate meaning
- use readable text and sufficient colour contrast
- provide useful alternative text for meaningful images
- display clear validation and error messages

Accessibility requirements should follow WCAG 2.2 principles where practical for the MVP.

### NFR-02 — Responsive Design

The application shall work on common desktop, tablet and mobile screen sizes.

The questionnaire and recommendation results shall remain readable and usable without requiring horizontal scrolling.

### NFR-03 — Performance

The application should respond quickly during normal use.

Where data is already available from the application's backend or cache, questionnaire navigation and result display should feel immediate.

External BoardGameGeek requests should not block the interface without visible loading feedback.

### NFR-04 — Security

The BoardGameGeek application token shall remain server-side.

The token shall not be:

- stored in frontend code
- committed to GitHub
- exposed in browser responses
- written into public documentation

Configuration secrets shall be stored using environment variables or another appropriate secret-management method.

### NFR-05 — Reliability

Temporary BoardGameGeek failures or throttling shall not cause the entire application to fail without explanation.

The backend should:

- cache suitable BGG data
- limit unnecessary external requests
- use controlled retry behaviour for temporary failures
- handle missing or incomplete BGG fields safely

The frontend shall display a clear message when required data is temporarily unavailable.

### NFR-06 — Maintainability

The application shall keep external BGG integration separate from recommendation logic and presentation logic.

The system should use clear separation between:

- frontend interface
- backend API
- BGG integration and XML parsing
- normalised game data
- recommendation rules

The frontend and recommendation engine shall not depend directly on raw BGG XML.

### NFR-07 — Testability

Recommendation behaviour and data normalisation shall be designed so that they can be tested using deterministic mock data.

Important recommendation rules should be testable independently of the live BoardGameGeek API.

Tests should later cover:

- normalisation of BGG data
- recommendation scoring
- hard eligibility rules
- edge cases
- error handling
- important user interactions

### NFR-08 — Plain Language

The application shall use language that is understandable to casual or inexperienced board-game players.

Technical BoardGameGeek terminology such as "weight" or specialist mechanic names should not be shown to users without explanation.

Recommendation explanations should be short, clear and specific.

### NFR-09 — Explainability

The recommendation system shall use transparent and traceable rules.

For each recommendation, the application should be able to identify the main factors that caused the game to rank highly.

The MVP shall not depend on an unexplained or opaque recommendation model.

---

## Core User Stories and Acceptance Criteria

### US-01 — Complete the Recommendation Questionnaire

**As a casual board-game player, I want to answer simple questions about my group and preferences so that I can receive recommendations that suit my situation.**

#### Acceptance Criteria

- The questionnaire includes all six MVP inputs.
- Questions are presented in plain language.
- The user does not need to understand specialist board-game terminology.
- The user can move through the questionnaire in a clear order.
- Required answers are validated before recommendations are generated.

---

### US-02 — Review and Change Answers

**As a user, I want to review my answers before generating recommendations so that I can correct anything I entered incorrectly.**

#### Acceptance Criteria

- The application displays a summary of the user's answers before generating recommendations.
- The user can return to an earlier question.
- The user can change an answer.
- Updated answers are used when recommendations are generated.

---

### US-03 — Receive Suitable Recommendations

**As a user, I want to receive a small number of suitable board-game recommendations so that I do not have to compare a large catalogue myself.**

#### Acceptance Criteria

- The system uses the user's questionnaire answers when selecting games.
- The system normally returns approximately 3–5 recommendations when enough suitable games exist.
- Games that fail hard eligibility requirements are not recommended.
- Recommendations are ordered using the application's recommendation rules.
- The system does not add clearly unsuitable games only to reach a target number of results.

---

### US-04 — Understand Why a Game Was Recommended

**As a user, I want to understand why each game matches my answers so that I can make a confident choice.**

#### Acceptance Criteria

- Each recommendation includes a match-strength label.
- Each recommendation includes a short explanation of the main matching factors.
- Explanations are based on identifiable recommendation rules.
- The application does not present unexplained percentage match scores.
- The user can view additional reasoning through a "Why this game?" interaction or equivalent.

---

### US-05 — Compare Important Game Information

**As a user, I want to see the most important information about each recommended game so that I can quickly decide whether it suits my group.**

#### Acceptance Criteria

Each recommendation displays, where available:

- game name
- game image
- player count
- play time
- complexity
- age suitability
- short description
- main game style or experience

The information is presented in a consistent format across recommendation cards.

---

### US-06 — See Important Trade-Offs

**As a user, I want to know about important limitations or trade-offs so that the recommendation does not hide information that could affect my decision.**

#### Acceptance Criteria

- A recommendation displays a short caveat when an important trade-off exists.
- Caveats use plain language.
- Caveats are based on identifiable data or recommendation rules.
- Minor differences that are unlikely to affect the user's decision do not create unnecessary warnings.

---

### US-07 — Learn More on BoardGameGeek

**As a user, I want to open the recommended game's BoardGameGeek page so that I can find more detailed information if I need it.**

#### Acceptance Criteria

- Each recommendation includes a working link to the correct BoardGameGeek game page.
- The application clearly identifies BoardGameGeek as the source of BGG-derived data.
- Required BoardGameGeek attribution is visible in the application.

---

### US-08 — Handle No Suitable Matches

**As a user, I want clear guidance when no suitable games can be found so that I know what I can change instead of receiving irrelevant recommendations.**

#### Acceptance Criteria

- The application clearly states when there are not enough suitable matches.
- The application does not fail silently.
- The user is encouraged to adjust one or more answers.
- The user can return to the questionnaire and try again.

---

### US-09 — Handle Temporary Errors

**As a user, I want understandable feedback when something goes wrong so that I know whether I should retry or change something.**

#### Acceptance Criteria

- Loading states are visible when the system is waiting for data.
- Temporary data or network failures display a clear message.
- Error messages avoid technical jargon.
- The application does not expose API tokens, stack traces or internal system details to the user.

---

## Out of Scope for the MVP

The following features are deliberately excluded from the first working version of the application.

They may be considered in later versions, but they are not required for the MVP.

### User Accounts and Personalisation

The MVP will not include:

- user registration
- login
- saved profiles
- recommendation history
- saved favourite games
- personal game collections

### Social Features

The MVP will not include:

- user reviews
- ratings submitted through the application
- friend lists
- sharing between users
- community discussion features

### Advanced BoardGameGeek Integration

The MVP will not include:

- importing a user's BoardGameGeek collection
- synchronising BGG accounts
- supporting expansions as normal recommendation candidates
- advanced catalogue browsing
- unrestricted BGG database searching by the user

### Shopping and Availability

The MVP will not include:

- product prices
- retailer comparison
- affiliate links
- local shop inventory
- "buy today" availability
- location-based shopping recommendations

These remain possible future features and would require a separate review of commercial use requirements and data sources.

### Artificial Intelligence

The MVP recommendation engine will not depend on AI or machine learning.

Recommendation results will initially use transparent, rule-based scoring.

Possible future AI features may include interpreting natural-language preferences or helping generate clearer explanations, but these would require separate technical and compliance review.

BoardGameGeek data will not be used to train an AI or Large Language Model.

### Advanced Recommendation Features

The MVP will not include:

- group profiles saved over time
- automatic learning from previous recommendations
- machine-learning recommendation models
- advanced expert filters
- highly detailed mechanic filtering
- recommendation based on a user's existing collection

### Native Mobile Application

The MVP will be a responsive web application.

A separate iOS or Android application is outside the current scope.

---

## Requirements Traceability Summary

The MVP requirements are based on the product decisions made during discovery, UX design and the BoardGameGeek technical spike.

| Area | Requirement / Story |
| --- | --- |
| Six-question recommendation flow | FR-01, US-01 |
| Review and edit answers | FR-02, US-02 |
| Generate 3–5 suitable recommendations | FR-03, US-03 |
| Match-strength labels | FR-04, US-04 |
| Explain why a game was recommended | FR-05, US-04 |
| Display key game information | FR-06, US-05 |
| Show trade-offs and caveats | FR-07, US-06 |
| BoardGameGeek links and attribution | FR-08, US-07 |
| No-match handling | FR-09, US-08 |
| Loading and error handling | FR-10, US-09 |
| Accessibility | NFR-01 |
| Responsive design | NFR-02 |
| Performance | NFR-03 |
| API-token security | NFR-04 |
| Reliability and BGG failure handling | NFR-05 |
| Separation of concerns | NFR-06 |
| Testability | NFR-07 |
| Plain-language content | NFR-08 |
| Explainable recommendation logic | NFR-09 |

## Requirement Status

These requirements define the current MVP baseline.

Changes to MVP scope should be recorded deliberately rather than introduced during implementation without updating this document.

Recommendation scoring details, complexity thresholds and mechanic-to-style mappings will be defined separately in Issue #9.