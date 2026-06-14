# CodeDuel 🏆

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-blue?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.8.0-2d3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-dc382d?style=for-the-badge&logo=redis)](https://redis.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6c47ff?style=for-the-badge&logo=clerk)](https://clerk.com/)

**CodeDuel** is a modern, real-time 1v1 competitive programming platform. Duel with other developers, solve complex algorithmic problems in real-time, climb the Elo rating ladder, or practice solo in a state-of-the-art interactive workspace.

---

## 🚀 Key Features

* **Real-time 1v1 Matchmaking**: Select a difficulty (Easy, Medium, Hard), join the matchmaking queue, and get matched against players near your Elo rating.
* **Interactive Coding Workspace**: Full Monaco Editor integration with multi-language template presets (Python 3, etc.).
* **Instant Sandbox Execution**: Run sample testcases and run code against custom inputs using the integrated console panel.
* **Live Opponent Tracking**: Real-time WebSocket synchronization displaying your opponent's state (Coding, Submitted, Accepted).
* **Automatic Validation Engine**: Built-in testcase verification using the Piston code execution engine, with custom simulator fallbacks for constructive/interactive problems.
* **Solo Practice Mode**: Practice offline on any problem with full execution support, bypassing the matchmaking queue and rating changes.
* **Modern Premium UI/UX**: Designed from scratch using a glassmorphic aesthetic, dark mode elements, sleek card components, and clear visual overlays.

---

## 🛠️ Tech Stack

* **Web (Frontend & API)**: Next.js (App Router), React, Tailwind CSS (Glassmorphism), Monaco Editor, KaTeX.
* **Real-Time Server**: Node.js, Express, Socket.io (WebSockets), Redis (Queue state & active rooms).
* **Database & ORM**: PostgreSQL, Prisma ORM.
* **Execution Engines**: Piston API.
* **User Authentication**: Clerk Auth.

---

## 📁 Repository Structure

```text
codeduel/
├── codeduel-web/          # Next.js web application (UI, dashboard, practice, submit APIs)
│   ├── app/               # Next.js App Router (arena, api routes, dashboard, practice)
│   ├── components/        # Shared React components (CFMathText, UI components)
│   ├── hooks/             # Custom react hooks (useSocket, etc.)
│   ├── lib/               # Prisma client and utility functions
│   └── prisma/            # PostgreSQL schema definition
│
├── codeduel-server/       # Express + Socket.io server
│   ├── src/               # Server source files (server, matchmaking, rooms, socket handlers)
│   └── prisma/            # Server-side prisma client / database seeds
│
├── piston/                # Code execution sandbox setup
├── assets/                # README screenshots and graphics
└── docker-compose.yml     # Docker services (PostgreSQL, Redis, Judge0)
```

---

## ⚙️ Installation & Local Setup

Follow these steps to run the complete CodeDuel environment locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker & Docker Compose](https://www.docker.com/)
* A [Clerk Account](https://clerk.com/) (for user authentication)

### 2. Setup Environment Variables

Create a `.env` file in the **`codeduel-web`** directory:
```env
# Database & Redis
DATABASE_URL="postgresql://postgres:password@localhost:5432/codeduel?schema=public"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Code Execution Server
PISTON_URL="http://localhost:2000"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Create a `.env` file in the **`codeduel-server`** directory:
```env
PORT=3001
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://postgres:password@localhost:5432/codeduel?schema=public"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 3. Spin Up Docker Services
Start the PostgreSQL and Redis containers:
```bash
docker compose up -d
```

### 4. Run Piston Execution Engine
Navigate to the `piston` directory and spin up the docker-compose development server:
```bash
cd piston
docker compose up -d
```
Ensure the Piston engine runs on port `2000` (refer to your web `.env` configuration). Make sure Python 3 execution package is installed on the piston container:
```bash
docker exec -it piston_api_1 piston install python
```

### 5. Seed the Database
Navigate to `codeduel-server`, initialize Prisma, and run the seeding script to populate PostgreSQL with 24 verified Codeforces problems and testcases:
```bash
cd ../codeduel-server
npm install
npx prisma db push
npm run seed
```

### 6. Run the Application Components

Open two separate terminal windows:

#### Terminal A: Start the Real-Time Server
```bash
cd codeduel-server
npm run dev
```

#### Terminal B: Start the Web App
```bash
cd codeduel-web
npm install
npm run dev
```

The web application will now be running at `http://localhost:3000`.

---

## 🔒 Security & Clerk Auth
Authentication is fully managed by Clerk. In the local environment, verify that Clerk callback URLs and redirect configurations match your `http://localhost:3000` local configuration.

---

## 📄 License
This project is licensed under the ISC License. See [LICENSE](file:///d:/Web%20dev/codeduel/codeduel-server/package.json) for details.
