# Project Brief

## Working title
Board Game Recommender

## Project purpose
Build a portfolio-quality web application that recommends board games using BoardGameGeek data and explainable recommendation logic.

## Core idea
Users describe the kind of game experience they want, such as player count, available time, preferred complexity, mechanics or style. The application ranks suitable games and explains why each recommendation fits.

## Primary user
A casual or relatively inexperienced board-game player who wants to buy a new game but does not have enough game knowledge to confidently choose one.

## Core problem
The user faces too many board-game choices and does not know where to start. The application should reduce that choice overload by asking a small number of understandable questions and narrowing the available options to a manageable set of suitable recommendations.

## Key user needs
1. The user needs an easy starting point without requiring existing board-game knowledge.
2. Recommendations need to suit the user's actual situation, such as player count, available time and desired level of complexity.
3. The user needs to understand why a game is being recommended so they can feel confident that it is a suitable purchase.

## Initial MVP recommendation inputs
The first useful version should ask for six core inputs:
1. Number of players
2. Available play time
3. Desired complexity
4. Type of experience or mood
5. Preferred game style or mechanics
6. Age appropriateness

### UX principle for inputs
Because the primary user may not know board-game terminology, recommendation questions should use plain language. Technical terms such as specific mechanics should be translated into understandable descriptions or examples rather than assumed knowledge.

## Initial MVP recommendation output
The application should return a manageable set of approximately 3–5 recommended games. Each recommendation should include:
- game name and image
- match score or strength of match
- short plain-English description
- explanation of why the game suits the user's answers
- player count
- play time
- complexity
- age recommendation
- main style or experience
- one useful caveat or “good to know” point where appropriate
- link to the BoardGameGeek page

The recommendation should feel informative rather than artificially perfect. Where useful, the app should explain a potential mismatch or trade-off so the user can make a more confident purchase decision.

## MVP scope
The MVP will focus on one complete recommendation journey: a user answers the six core questions, the application evaluates suitable games using transparent recommendation logic, and the user receives a small set of explainable recommendations.

The MVP will not include:
- user accounts or login
- saved favourites or recommendation history
- personal game collection import
- social features or reviews
- AI-powered recommendation input
- shopping links, price comparison or local availability
- advanced filtering or search tools
- multiplayer group profiles
- a native mobile application
- a machine-learning recommendation model

These may be considered after the core recommendation experience is working and tested.

## Future direction: AI-assisted recommendations
AI is explicitly out of scope for the MVP, but may be explored in a later phase. Potential uses include:
- interpreting natural-language requests such as “something clever but not exhausting”
- translating vague preferences into recommendation criteria
- generating richer plain-English explanations from structured recommendation results
- identifying themes or similarities that are difficult to express through fixed filters alone
- combining several user preferences into a more conversational recommendation experience

The core recommendation logic should remain transparent and testable. AI should augment the recommendation system rather than make the central ranking process opaque.

### BGG data constraint for future AI work
BoardGameGeek's current XML API terms prohibit using BGG API or site data to train AI or LLM systems. Any future AI-assisted feature must therefore be designed so it does not train a model on BGG data, and any use of BGG-derived information with an AI system must be reviewed against the then-current BGG terms before implementation.

## Future direction: shopping and local availability
A later version could help users act on a recommendation by comparing ways to buy the game. This should consider more than lowest price.

Potential features include:
- online price comparison
- nearby game retailers
- local stock availability
- distance or proximity from the user
- same-day pickup or “available today” options

This reflects a real purchase trade-off: some customers will pay more for a game if they can obtain it locally today rather than wait for delivery. Any future retailer integration, affiliate links, advertising or other monetisation would require a fresh review of BGG's commercial-use terms before implementation.

## Portfolio goals
This project should demonstrate:
- requirements and product planning
- API integration
- frontend and backend development
- recommendation logic designed and tested by the developer
- clear architecture and technical decision-making
- testing and CI
- accessibility and error handling
- professional Git/GitHub workflow
- debugging and problem-solving documentation
- deployment and retrospective reflection

## Current assumptions
These are starting assumptions:
- React + Vite is a likely frontend choice.
- Node.js + Express is a likely backend choice.
- BoardGameGeek XML API2 will be the primary external game-data source.
- The first recommendation engine should be transparent and rule/score based rather than machine-learning based.
- Persistence will only be added if a clear feature requires it.

## Questions to resolve during discovery
- Which BGG fields are reliable enough for recommendation logic?
- What caching, retry and throttling strategy will be required?
- Will accounts or saved preferences add enough value to justify persistence in a later phase?

## Success criteria
A successful final project should be understandable from the repository alone, usable as a deployed application, and supported by visible evidence of planning, implementation, testing, debugging and reflection.
