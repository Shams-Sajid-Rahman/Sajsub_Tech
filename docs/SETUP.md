# Setup guide

## Environment files

Each app has its own `.env`, ignored by Git. `.env.example` is the committed template.

| File | Variables |
| --- | --- |
| `backend/.env` | `NODE_ENV`, `PORT`, `CLIENT_URL`, `DATABASE_URL` |
| `frontend/.env` | `VITE_API_URL` |

Anything prefixed `VITE_` is bundled into the browser, so secrets belong only in `backend/.env`.

## Installation commands

These are the commands used to create the project. On a fresh clone, `npm install` in each folder is enough.

```bash
# Frontend
npm i react@19 react-dom@19
npm i -D vite@6 @vitejs/plugin-react@4 tailwindcss@4 @tailwindcss/vite@4

# Backend
npm i express@5 cors@2 helmet@8 cookie-parser@1 morgan@1 dotenv@16 @prisma/client@6
npm i -D prisma@6 supertest@7
```

Vite 6 and Prisma 6 are deliberate: Vite 7 and Prisma 7 need Node.js 20.19 or newer. Upgrade Node before moving to them.

## Commands

| Folder | Command | Purpose |
| --- | --- | --- |
| backend | `npm run dev` | Start the API with auto-restart |
| backend | `npm start` | Start the API |
| backend | `npm test` | Run automated tests |
| backend | `npm run db:validate` | Validate the Prisma schema |
| backend | `npm run db:generate` | Generate the Prisma client |
| backend | `npm run db:migrate` | Create and apply migrations |
| backend | `npm run db:studio` | Open Prisma Studio |
| frontend | `npm run dev` | Start the dev server |
| frontend | `npm run build` | Build for production |
| frontend | `npm run preview` | Preview the production build |

## Health checks

| Endpoint | Healthy | Failure |
| --- | --- | --- |
| `GET /api/health` | `200` | - |
| `GET /api/health/db` | `200`, `database: connected` | `503`, `database: unavailable` |

A failed database check logs its reason in the backend terminal. The API response leaves it out on purpose.
