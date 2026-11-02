# Setup guide

## Environment files

Each app has its own `.env`, ignored by Git. `.env.example` is the committed template.

| File | Variables |
| --- | --- |
| `backend/.env` | `NODE_ENV`, `PORT`, `CLIENT_URL`, `DATABASE_URL`, `TRUST_PROXY`, `JWT_SECRET`, `CSRF_SECRET`, `COOKIE_SAMESITE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX`, `API_PUBLIC_URL`, `GEMINI_API_KEY`, `AI_MODEL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` |
| `frontend/.env` | `VITE_API_URL` |

Anything prefixed `VITE_` is bundled into the browser, so secrets belong only in `backend/.env`.

## Installation commands

These are the commands used to create the project. On a fresh clone, `npm install` in each folder is enough.

```bash
# Frontend
npm i react@19 react-dom@19 react-router-dom@7 recharts@3 lucide-react
npm i -D vite@6 @vitejs/plugin-react@4 tailwindcss@4 @tailwindcss/vite@4

# Backend
npm i express@5 cors@2 helmet@8 cookie-parser@1 morgan@1 dotenv@16 @prisma/client@6 bcryptjs@3 zod@4 express-rate-limit@8 jsonwebtoken@9 nodemailer@10 multer@2 cloudinary@2 @google/genai
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
| backend | `npm run db:migrate` | Create and apply migrations in development |
| backend | `npm run db:deploy` | Apply existing migrations |
| backend | `npm run db:seed` | Add sample data and the admin (development only, safe to re-run) |
| backend | `npm run admin:create` | Create the admin from `ADMIN_*` variables |
| backend | `npm run db:studio` | Open Prisma Studio |
| frontend | `npm run dev` | Start the dev server |
| frontend | `npm run build` | Build for production |
| frontend | `npm run preview` | Preview the production build |

## Database

The design, deletion policy and ER diagram are in [ER_DIAGRAM.md](ER_DIAGRAM.md). After creating the database:

```bash
cd backend
npm run db:deploy
npm run db:generate
npm run db:seed
```

`npm test` includes database tests. They use the database in `DATABASE_URL` and remove the rows they create.

## Admin accounts

Public registration can only create `CUSTOMER` accounts. Set `ADMIN_EMAIL` and a password of at least 12 characters in `backend/.env`, then run `npm run admin:create`. Only a bcrypt hash is stored. Re-running never changes an existing admin's password.

The seed refuses to run when `NODE_ENV=production`, and sample products use SKUs starting with `DEV-`.

## Health checks

| Endpoint | Healthy | Failure |
| --- | --- | --- |
| `GET /api/health` | `200` | - |
| `GET /api/health/db` | `200`, `database: connected` | `503`, `Database unavailable` |

A failed database check logs its reason in the backend terminal. The API response leaves it out on purpose.
