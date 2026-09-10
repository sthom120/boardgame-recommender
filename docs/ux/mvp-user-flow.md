# MVP User Flow and Wireframes

## Purpose

This document defines the initial user experience for the Board Game Recommender MVP.

The primary user is a casual or relatively inexperienced board-game buyer who wants help narrowing down choices without needing to understand specialist board-game terminology.

The interface should feel more like guided advice from a knowledgeable shop assistant than a technical filtering tool.

---

## Core User Flow

```text
Landing / Start
      ↓
Q1 — Number of players
      ↓
Q2 — Available play time
      ↓
Q3 — Desired level of complexity
      ↓
Q4 — Desired experience / mood
      ↓
Q5 — Preferred play style
      ↓
Q6 — Youngest player age and content suitability
      ↓
Review answers
      ↓
Generate recommendations
      ↓
Results
      ↓
Expanded "Why this game?" explanation
      ↓
BoardGameGeek link
```

---

## UX Principles

### Guided rather than filter-heavy

The questionnaire uses a step-by-step flow rather than displaying all recommendation filters at once.

This approach is intended to:

- reduce cognitive load
- avoid overwhelming inexperienced users
- make unfamiliar concepts easier to explain
- create a more conversational recommendation experience

Each step should include:

- a clear question
- simple answer choices
- a progress indicator, such as `2 of 6`
- Back and Next controls
- the ability to retain previous answers when editing

### Plain language

Users should not need prior board-game knowledge to use the application.

BoardGameGeek terminology and technical mechanic names may be used internally, but the interface should translate these concepts into understandable language.

---

# Questionnaire

## Q1 — Number of Players

**Question:**  
How many people will be playing?

Use a simple number control, for example:

```text
[-]   4   [+]
```

Player count is required because it directly affects whether a game can be played by the group.

A "No preference" option is not appropriate for this question.

---

## Q2 — Available Play Time

**Question:**  
How long do you want to play for?

Choices:

- Up to 20 minutes
- About 30 minutes
- About 45–60 minutes
- About 1–2 hours
- More than 2 hours
- No preference

**Helper text:**

> Choose the amount of time you'd be happy spending on one game.

Broad ranges are preferable to requiring an exact number because casual users often only know roughly how much time they have available.

---

## Q3 — Desired Complexity

**Question:**  
How involved do you want the game to feel?

Choices:

- **Light and easy** — quick to learn, simple decisions
- **Some strategy** — easy enough to learn, but gives you things to think about
- **Moderately challenging** — more rules and planning, with meaningful decisions
- **Deep and challenging** — lots to think about, with more rules and strategy
- **Not sure / no preference**

**Helper text:**

> This is about how much you want to learn and think about during the game — not how experienced you are.

BoardGameGeek terminology such as **weight** should not be exposed directly to the user.

---

## Q4 — Desired Experience / Mood

**Question:**  
What kind of experience are you in the mood for?

Users may select one or two:

- **Relaxed & easy-going** — enjoyable without feeling intense
- **Social & lively** — lots of talking, laughing or interaction
- **Competitive** — you want to challenge each other and try to win
- **Cooperative** — you want to work together toward a shared goal
- **Strategic & thoughtful** — you want interesting decisions and planning
- **Immersive & thematic** — you want to get drawn into a setting, story or theme
- **Funny, silly & chaotic** — you mainly want to laugh and not take the game too seriously
- **No preference**

If **No preference** is selected, it must be the only selection. Selecting another mood removes **No preference**.

Allowing up to two choices gives users room to describe combinations such as social and competitive or strategic and immersive without making the recommendation signal too broad.

This question describes how the game should **feel to play**, rather than the specific actions or mechanics involved.

---

## Q5 — Preferred Play Style

**Question:**  
What sounds fun to you?

Users may select one or two:

- **Solving & figuring things out** — puzzles, deduction or working out the best answer
- **Collecting & building** — gather cards, resources or pieces to create something
- **Planning & managing** — build, optimise or carefully manage what you have
- **Talking, guessing & reading people** — communication, clues, deduction or working out other players
- **Working together** — cooperate toward a shared goal
- **Competing directly** — block, attack, race or interfere with other players
- **Theme & story** — explore a setting, characters or an unfolding story
- **Quick & simple** — easy decisions and fast turns
- **No preference**

If **No preference** is selected, it must be the only selection. Selecting another style removes **No preference**.

Allowing up to two choices lets a user express combinations such as collecting and building plus planning and managing while keeping the questionnaire focused.

These options deliberately translate technical board-game mechanics into plain language.

For example, terms such as **deck-building**, **worker placement** and **set collection** may be used internally but should not be assumed knowledge in the interface.

### Mood, mechanics and content are separate concepts

A game's:

- mechanics
- tone
- content maturity

should not be treated as the same thing.

For example, an adult comedy game may use familiar word or party-game mechanics while having a very different tone and content level from a family game using similar mechanics.

---

## Q6 — Age and Content Suitability

**Question:**  
Who will be playing?

The user enters the exact age of the youngest player.

**Age prompt:**  
How old is the youngest person playing?

The youngest age is required because Version 1 uses the publisher minimum age as an eligibility check. The MVP does not require the oldest player's age and does not offer an age-based **No preference** option.

### Content Preference

Within the same step, users select one content preference.

**What kind of content is okay for your group?**

- Family-friendly only
- Mature or adult humour is okay
- No preference

Content preference is separate from age suitability.

An adult group should not automatically receive adult-humour recommendations, and a game's minimum age alone should not determine whether its content is appropriate for the group.

---

# Review Answers Screen

Before generating recommendations, show a concise summary of the user's answers.

Example:

| Preference | Selection |
| --- | --- |
| Players | 4 people |
| Play time | About 45–60 minutes |
| Complexity | Some strategy |
| Experience | Social & lively; Funny, silly & chaotic |
| Play style | Talking, guessing & reading people; Quick & simple |
| Youngest player | 10 |
| Content | Family-friendly only |

Each answer should include a **Change** action.

Changing one answer should not erase later answers or require the user to restart the questionnaire.

**Primary action:**  
`Find my games`

**Secondary action:**  
`Start over`

---

# Results Screen

Return approximately **3–5 recommendations**, ordered from strongest match downward.

Each recommendation card should show:

- game image
- game title
- match strength
- short explanation of why it fits
- player count
- play time
- complexity
- age suitability
- useful caveat or trade-off
- BoardGameGeek link

## Match Presentation

Prefer understandable match labels such as:

- **Excellent match**
- **Strong match**
- **Good match**

rather than presenting a precise percentage such as `92%`.

A numerical score may still be used internally, but a percentage could imply more scientific precision than the recommendation model can justify.

---

## Recommendation Explanation

Each card should include a short **Why it fits you** section.

Example:

- Works well with 4 players
- Fits your 45–60 minute preference
- Matches your preference for social and funny games

Each recommendation should also include a **Good to know** point.

Example:

> Very social and easy to learn, but there is not much long-term strategy.

This helps prevent recommendations from being presented as artificially perfect.

---

## Expanded "Why This Game?" State

Users should be able to expand a recommendation to see how it matched individual criteria.

Example:

- **Players** — Excellent fit
- **Time** — Excellent fit
- **Complexity** — Good fit
- **Experience** — Strong fit
- **Play style** — Strong fit
- **Age / group** — Excellent fit

A short plain-English explanation should then explain why the game ranked highly.

For example:

> This game ranked highly because it works particularly well with four players, fits comfortably within your available time, and strongly matches the social and competitive experiences you selected.

The explanation should make the recommender transparent without unnecessarily exposing technical scoring details.

---

# Landing / Start Screen

The landing screen should make the purpose of the application immediately clear without presenting technical filters or board-game terminology.

## Suggested Content

**Heading:**  
Find a board game that fits your group

**Intro:**  
Answer a few quick questions about who's playing, how much time you have, and what kind of game you feel like playing.

**Primary action:**  
`Find my game`

**Reassurance text:**  
No board-game knowledge needed.

A small supporting line may also explain that recommendations consider player count, time, complexity, play style, mood and age suitability.

### Low-Fidelity Wireframe

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                 Board Game Recommender                  │
│                                                         │
│        Find a board game that fits your group           │
│                                                         │
│   Answer a few quick questions about who's playing,     │
│   how much time you have, and what kind of game you     │
│   feel like playing.                                    │
│                                                         │
│                  ┌─────────────────┐                    │
│                  │  Find my game   │                    │
│                  └─────────────────┘                    │
│                                                         │
│              No board-game knowledge needed.            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

The screen deliberately contains one obvious primary action and avoids rankings, search controls, advanced filters or specialist terminology.

## Design Principle

The landing page should stay intentionally simple.

Avoid adding:

- rankings
- search boxes
- advanced filters
- large amounts of game information

The main goal is to make the first action obvious and approachable.

---

# Supporting States

The MVP should also define behaviour for situations where the normal recommendation flow cannot continue.

## Loading

Explain that recommendations are being prepared rather than displaying a blank screen.

The loading state should reassure the user that their answers have been received and the system is working.

## No Good Matches

If no strong recommendations are available, explain this clearly rather than returning poor-quality matches as though they were suitable.

Possible actions:

- broaden preferences
- change answers
- start again

## External Data / BoardGameGeek Unavailable

If external game data cannot be retrieved, explain the problem clearly and avoid making it appear that the user's answers caused the error.

Where appropriate, offer:

- Retry
- Change answers
- Return later

---

# Wireframe

The current low-fidelity visual representation of the MVP flow is stored at:

`docs/ux/mvp-wireframes.png`

The wireframe illustrates:

- the six-step questionnaire
- review screen
- recommendation results
- expanded recommendation explanation
- loading state
- no-match state
- external-data error state

The wireframe remains a low-fidelity layout reference. Where it differs from the interaction rules documented here, this document and the current API contract define the intended MVP behaviour.

---

# Current Status

The following core MVP elements have now been defined:

- landing screen
- questionnaire structure
- six recommendation-input screens
- review screen
- results structure
- explainable recommendation state
- loading state
- no-match state
- external-data error state
