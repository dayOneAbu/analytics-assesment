# Post Analytics — News Platform API

RESTful API where authors publish news, readers consume it, and analytics are aggregated daily from read logs.

## Tech Choices
- Runtime: Node.js + TypeScript
- HTTP framework: Express
- Database: PostgreSQL + Prisma
- Auth: JWT + Argon2
- Validation: Zod
- Queue & background processing: BullMQ + Redis (with in-process fallback when Redis is unavailable)

## Project Structure
- `backend/src/module/auth`: signup + login
- `backend/src/module/articles`: article lifecycle + read tracking
- `backend/src/module/analytics`: author dashboard
- `backend/src/queue`: queue producer, scheduler, workers

### Folder Structure
```text
.
├── backend
│   ├── app.ts
│   ├── index.ts
│   ├── prisma
│   │   ├── migrations
│   │   └── schema.prisma
│   ├── src
│   │   ├── config
│   │   │   └── env.ts
│   │   ├── lib
│   │   │   ├── errors.ts
│   │   │   └── prisma.ts
│   │   ├── middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rbac.middleware.ts
│   │   ├── module
│   │   │   ├── auth
│   │   │   ├── articles
│   │   │   └── analytics
│   │   ├── queue
│   │   │   ├── index.ts
│   │   │   ├── scheduler.ts
│   │   │   └── worker.ts
│   │   └── types
│   │       └── index.ts
│   └── tests
│       ├── auth
│       ├── articles
│       └── analytics
├── post-analytics.postman_collection.json
├── package.json
└── README.md
```

## Setup
1. Install dependencies from repository root:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

The server starts HTTP app + queue workers + scheduler on boot.

## Environment Variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiry window (e.g. `24h`) |
| `PORT` | App port (default `3000`) |
| `REDIS_URL` | Redis connection string for BullMQ |

## API Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /articles`
- `GET /articles/:id`
- `POST /articles` (author only)
- `GET /articles/me` (author only)
- `PUT /articles/:id` (author only)
- `DELETE /articles/:id` (author only, soft delete)
- `GET /author/dashboard` (author only)

## Scripts
- `npm run dev` - run API in dev mode
- `npm run build` - type-check + compile
- `npm test` - run all unit tests
- `npm run test:auth` - auth module tests
- `npm run test:article` - article module tests
- `npm run test:analytics` - analytics module tests

## Postman Guide
A ready-to-import Postman collection is available at the root:

- `post-analytics.postman_collection.json`

Import steps:
1. Open Postman.
2. Click `Import`.
3. Select `post-analytics.postman_collection.json`.
4. Confirm collection import.

Collection variables:
- `baseUrl` (default: `http://localhost:3000`)
- `jwtToken` (auto-set from `POST /auth/login (author)` test script)
- `articleId` (auto-set from `POST /articles` test script)

Recommended run order:
1. `GET /health`
2. `POST /auth/register (author)` (run once)
3. `POST /auth/login (author)` (stores `jwtToken`)
4. `POST /articles` (stores `articleId`)
5. `GET /articles/me`
6. `GET /articles/:id`
7. `GET /author/dashboard`
8. `PUT /articles/:id`
9. `DELETE /articles/:id`
