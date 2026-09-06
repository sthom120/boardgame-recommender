# Board Game Recommender

A portfolio project that recommends board games using BoardGameGeek data and explainable recommendation logic.

## Project Status

The project is currently in active MVP development.

Planning, requirements, API contracts, recommendation rules, accessibility standards and BoardGameGeek technical validation are documented under `docs/`.

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

The current scaffold does not require BoardGameGeek credentials.

The backend defaults to port `3001` if no `PORT` value is provided.

Never commit real API credentials or secrets.

### Run the application

From the repository root:

```bash
npm run dev
```

This starts:

- the React/Vite frontend at `http://localhost:5173`
- the Express backend at `http://localhost:3001`

During local development, Vite proxies frontend requests beginning with `/api` to the Express backend.

### Health check

The backend exposes:

```text
GET /api/health
```

A successful response confirms that the API is running.

The current frontend scaffold also calls this endpoint and displays the backend connection status.

## Useful Commands

From the repository root:

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run lint
```

## Documentation

Important project documentation includes:

- `docs/project-brief.md`
- `docs/requirements.md`
- `docs/recommendation-engine.md`
- `docs/api-contract.md`
- `docs/accessibility.md`
- `docs/bgg-api-spike.md`
- `docs/adr/001-normalise-bgg-data.md`

## Current MVP Direction

The first working vertical slice will support:

```text
Landing page
→ Recommendation questionnaire
→ Review answers
→ Backend recommendation request
→ Recommendation results
```

Initial development uses deterministic mock data so frontend and recommendation work do not depend on live BoardGameGeek availability.

Live BGG integration and the full transparent recommendation engine are implemented in later development stages.