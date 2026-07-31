# Online Exam Portal (UI)

React 18 + Material UI front-end for the [Online Exam API](../online-exam-api).

This is a clean rewrite of the original college-era project: a typed-feeling component layout, a centralised API client, an Auth context, and a refreshed Material design system.

---

## Highlights

- React 18 with `createRoot`, React Router v6
- Centralised `axios` client with auth interceptors
- `AuthContext` + `useAuth()` hook (login / register / logout / refresh)
- Protected routes with redirects
- Custom Material UI theme (typography, palette, shape, components)
- Pages: **Login / Register**, **Home (exam catalog)**, **Exam (timed)**, **Result**
- Beautiful, modern UI: card-based dashboard, animated countdown, question navigator
- Tab-switch detection with a soft warning
- Auto-submit when the timer ends
- Tests with React Testing Library (Login flow, App routes, Question component, utils)
- Production-ready build (`npm run build`)

---

## Project structure

```
online-exam-portal/
|-- public/
|-- src/
|   |-- api/                axios client + per-resource APIs
|   |   |-- client.js
|   |   |-- authApi.js
|   |   |-- examApi.js
|   |   `-- submissionApi.js
|   |-- components/
|   |   |-- common/         AppHeader, ProtectedRoute, ErrorBoundary, LoadingScreen
|   |   `-- exam/           Clock, Question, QuestionNavigator, Instructions
|   |-- context/
|   |   `-- AuthContext.js
|   |-- hooks/
|   |   `-- useCountdown.js
|   |-- pages/
|   |   |-- LoginPage.js
|   |   |-- HomePage.js
|   |   |-- ExamPage.js
|   |   `-- ResultPage.js
|   |-- routes/
|   |   `-- AppRoutes.js
|   |-- theme/
|   |   `-- theme.js
|   |-- utils/
|   |   |-- storage.js
|   |   `-- time.js
|   |-- __tests__/          App, LoginPage, Question, utils
|   |-- App.js
|   |-- index.js            createRoot entry
|   `-- index.css
|-- .env.example
|-- package.json
`-- README.md
```

---

## Getting started

```bash
npm install --legacy-peer-deps
cp .env.example .env       # set REACT_APP_API_BASE_URL
npm start                  # http://localhost:3000
```

> Make sure the API is running on `http://localhost:8081` (or update `REACT_APP_API_BASE_URL`).

Demo credentials seeded by the API:

| Role    | Email                  | Password        |
|---------|------------------------|-----------------|
| admin   | admin@example.com      | Admin@12345     |
| student | student@example.com    | Student@12345   |

---

## Scripts

| Command              | Description                            |
|----------------------|----------------------------------------|
| `npm start`          | Run dev server with hot reload         |
| `npm run build`      | Production build                       |
| `npm test`           | Run the Jest test suite                |
| `npm run test:watch` | Run tests in watch mode                |

---

## How it talks to the API

`src/api/client.js` builds a single `axios` instance:

- Base URL from `REACT_APP_API_BASE_URL`
- Adds `Authorization: Bearer <token>` from `localStorage`
- On 401 responses, clears the local session and redirects to `/login`
- Normalises errors into `{ message, status, details }`

Each resource has a thin module (`authApi`, `examApi`, `submissionApi`) that returns plain objects.

---

## Auth flow

1. `LoginPage` calls `authApi.login()`, stores the token + user via `storage.js`.
2. `AuthContext` rehydrates the user with `authApi.me()` whenever the token changes.
3. `ProtectedRoute` redirects unauthenticated users to `/login` (preserving the return path in `location.state.from`).

---

## Exam flow

1. `HomePage` lists exams via `examApi.list()`.
2. Clicking "Start exam" routes to `/exam/:examId`.
3. `ExamPage` loads exam + questions, shows a per-question card with a navigator and live countdown clock.
4. `useCountdown` triggers auto-submit when time runs out.
5. On submit, the result is sent to `/result` via router state for an instant view.

---

## Theming

`src/theme/theme.js` centralises colours, typography, shape, and per-component overrides. Tweak it once and every component in the portal follows.

---

## License

MIT
