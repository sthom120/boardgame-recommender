# Board Game Recommender

A portfolio project that recommends board games using BoardGameGeek data and explainable recommendation logic.

## Project Status

Shuffled is in active MVP development.

The complete questionnaire, review flow, results UI, transparent recommendation engine and live BoardGameGeek integration are implemented. Current work is focused on finishing the local development workflow, scaling the candidate catalogue beyond the original technical-spike set, then tuning recommendation quality against a realistic catalogue.

See `docs/mvp-sprint-plan.md` for the current delivery plan from this checkpoint to the public MVP.

## Tech Stack

- React
- Vite
- Node.js
- Express
- BoardGameGeek XML API2
- GitHub Issues and Projects for project management

## Project Structure

```text
boardgame-recommender/
├── client/      React + Vite frontend
├── server/      Node + Express backend
├── docs/        Requirements, UX, architecture and project documentation
├── fixtures/    Deterministic development and test data
└── README.md
```

## Local Development

### Requirements

Install:

- Node.js
- npm
- Git

This project was initially developed using Node.js 24.

### Install dependencies

From the repository root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### Environment configuration

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

The live BGG-backed recommendation path requires a valid server-side `BGG_API_TOKEN`.

The backend defaults to port `3001` if no `PORT` value is provided.

Never commit real API credentials or secrets.

### Run the application

The intended combined development command is:

```bash
npm run dev
```

A Windows watch-process issue is currently tracked in GitHub Issue #38. Until that is fixed, run the two processes separately:

Terminal 1:

```bash
npm start --prefix server
```

Terminal 2:

```bash
npm run dev --prefix client
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the Express backend at `http://localhost:3001`.

### Health check

The backend exposes:

```text
GET /api/health
```

A successful response confirms that the API is running.

## Useful Commands

From the repository root:

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run lint
npm test --prefix server
```

## Documentation

Important project documentation includes:

- `docs/mvp-sprint-plan.md`
- `docs/project-brief.md`
- `docs/requirements.md`
- `docs/recommendation-engine.md`
- `docs/api-contract.md`
- `docs/accessibility.md`
- `docs/bgg-api-spike.md`
- `docs/adr/001-normalise-bgg-data.md`

## Current MVP Direction

The working vertical slice is now:

```text
Landing page
→ Recommendation questionnaire
→ Review answers
→ Backend recommendation request
→ Live normalized BGG data
→ Transparent recommendation engine
→ Recommendation results
```

The original controlled BGG catalogue is retained for technical validation and deterministic testing, but it is not the intended MVP catalogue.

The next delivery stages are:

```text
finish integration/dev workflow
→ scalable local catalogue (~100 development records)
→ recommendation-quality tuning
→ grow toward ~300–500 MVP games
→ result/accessibility quality
→ CI
→ deployment
→ portfolio polish
```

The catalogue targets are delivery stages rather than hard architectural limits.
