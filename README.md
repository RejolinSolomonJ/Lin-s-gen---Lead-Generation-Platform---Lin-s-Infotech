# Lead Generation Dashboard — Lin's Infotechs

Internal lead generation dashboard for discovering, qualifying, and tracking outbound prospects organized by lead category.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL + Redis)
- Google Cloud API Key (Places API + PageSpeed Insights API)

### Setup

```bash
# 1. Clone and install
cd "Lead gen LI"

# 2. Start database services
docker-compose up -d

# 3. Setup server
cd server
cp .env.example .env   # Edit with your API keys
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 4. Setup client (new terminal)
cd client
npm install
npm run dev

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Job Queue**: node-cron
- **Auth**: JWT

## Project Structure
```
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── docker-compose.yml
└── README.md
```
