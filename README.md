# Sajsub Tech

E-commerce platform with a public storefront, an admin dashboard and an AI shopping assistant.

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS (port 5173) |
| Backend | Node.js, Express, ES modules (port 5000) |
| Database | PostgreSQL, Prisma ORM (port 5432) |

Requires Node.js 20.9 or newer and PostgreSQL.

## Quick start

```bash
# 1. Create the database (once)
psql -U postgres -h localhost -p 5432 -f database/create_database.sql

# 2. Backend: copy .env.example to .env and set your password in DATABASE_URL first
cd backend
npm install
npm run db:deploy
npm run db:generate
npm run db:seed
npm run dev

# 3. Frontend, in a second terminal: copy .env.example to .env first
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 for the store and http://localhost:5173/admin/login for the admin dashboard.

See [docs/SETUP.md](docs/SETUP.md) for installation commands, environment variables and tests, [docs/API.md](docs/API.md) for the API, [docs/PAYMENTS.md](docs/PAYMENTS.md) for orders and payments, and [docs/AI_ASSISTANT.md](docs/AI_ASSISTANT.md) for the shopping assistant.
The latest testing and security results are in [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md).
