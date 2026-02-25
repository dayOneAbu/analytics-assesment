# Post Analytics — News Platform API

A production-ready RESTful API for a news platform where authors publish content and readers consume it, with a built-in analytics engine for tracking engagement.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL via Prisma ORM
- **Queue**: BullMQ + Redis
- **Auth**: JWT + Argon2
- **Validation**: Zod

## Setup

1. Clone the repo and install dependencies
```bash
   cd backend && npm install
```

2. Copy env file and fill in your values
```bash
   cp .env.example .env
```

3. Run database migrations
```bash
   npx prisma migrate dev
```

4. Start the server
```bash
   npm run dev
```

## Environment Variables
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key for signing JWTs |
| JWT_EXPIRES_IN | Token expiry e.g. 24h |
| PORT | Server port, defaults to 3000 |
| REDIS_URL | Redis connection string for BullMQ |

 