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
- Which preferences should affect recommendations?
- What belongs in the MVP and what should wait?
- Which BGG fields are reliable enough for recommendation logic?
- What caching, retry and throttling strategy will be required?
- Will accounts or saved preferences add enough value to justify persistence?

## Success criteria
A successful final project should be understandable from the repository alone, usable as a deployed application, and supported by visible evidence of planning, implementation, testing, debugging and reflection.
