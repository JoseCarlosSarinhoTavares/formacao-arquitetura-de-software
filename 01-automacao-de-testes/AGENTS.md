# AI - Test Automation Module

This directory contains automated test configurations and rules.

## Running the Applications

| Service  | Port | Command to run | Command to install |
|----------|------|----------------|--------------------|
| Backend  | 3000 | `node src/index.ts` | `npm install` |
| Frontend | 5173 | `npm run dev`  | `npm install`      |
| Database | 5432 | via Docker     | -                  |

> Backend is a study project served from `src/index.ts` (no `dev` script yet, run directly with node). Frontend runs from inside `frontend/react/`. Install dependencies per folder (`root/`, `frontend/react/`, `e2e/`).

## Database (Docker)

```bash
# Start the database (Postgres on port 5432)
npm run compose:up

# Stop and remove the database
npm run compose:down
```

## Tests & Coverage

```bash
# Run tests
npm test

# Run tests with coverage (>80%)
npm run test:coverage
```

## E2E Tests (Playwright)

```bash
# Run E2E tests (from inside the e2e/ folder)
cd e2e
npx playwright test

# Run E2E tests with HTML report
npx playwright test --reporter=html

# Open the last HTML report
npx playwright show-report
```

> E2E tests live in the `e2e/` folder and are configured in `e2e/playwright.config.js`. Install Playwright browsers with `npx playwright install` on first run.

## Relevant Files

- [.ai/skills/testing/SKILL.md](.ai/skills/testing/SKILL.md) - Rules and guidelines for writing automated tests, including:
  - Test frameworks (Vitest, Sinon, Playwright)
  - Test patterns (Given/When/Then, Arrange/Act/Assert)
  - Best practices (isolation, cleanup, mocking)
  - Coverage requirements (>80%, measured with `npm run test:coverage`)

## Environment

- Node.js + TypeScript backend (Express) on port 3000
- React frontend (Vite) on port 5173
- PostgreSQL (Docker) on port 5432
- Vitest for unit/integration tests
- Playwright for E2E tests (in `e2e/`)
