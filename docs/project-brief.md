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

## MVP out of scope
The following are intentionally excluded from the first release:
- user accounts or login
- saved favourites or recommendation history
- personal game collection import
- social features or reviews
- AI-powered recommendation input
- shopping links or price comparison
- proximity-based store discovery or local stock availability
- advanced filtering or search
- multiplayer group profiles
- native mobile app
- machine-learning recommendation model

These may be explored later if they support the product without making the core experience more complicated.

## Future direction: AI-assisted recommendations
AI is explicitly out of scope for the MVP, but may be explored in a later phase. Potential uses include:
- interpreting natural-language requests such as “something clever but not exhausting”
- translating vague preferences into recommendation criteria
- generating richer plain-English explanations from structured recommendation data
- identifying themes or similarities that are difficult to express through fixed filters alone
- combining several user preferences into a more conversational recommendation experience

The core recommendation logic should remain transparent and testable. AI should augment the recommendation system rather than make the central ranking process opaque.

## Future direction: shopping and local availability
A later version could help users act on a recommendation immediately by showing where a game can be purchased.

Potential features include:
- online shopping links
- price comparison
- nearby retailers that stock the game
- distance or proximity-based store sorting
- indication of whether the game is available for same-day purchase or pickup

This feature should recognise that the cheapest option is not always the most useful one. Some users may prefer a nearby store because they want the game immediately rather than waiting for delivery.

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
