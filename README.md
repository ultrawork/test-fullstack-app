# Notes App

Private, self-hosted notes application with cloud sync across Web, iOS, and Android. Built with a focus on privacy — no tracking, server-side encryption, with E2E encryption planned.

## Tech Stack

**Web (this package):**
- [Next.js 15](https://nextjs.org/) — React framework (App Router)
- [React 19](https://react.dev/) — UI library
- [TypeScript 5](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Zustand](https://zustand.docs.pmnd.rs/) — State management
- [ESLint](https://eslint.org/) — Linting

**Backend (separate service):**
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT authentication (access + refresh tokens)

**API:** `/api/v1/auth/*`, `/api/v1/notes/*`, `/api/v1/categories/*`

**Deployment:** Docker Compose (self-hosted)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production (Docker)

```bash
docker build -t notes-web .
docker run -p 3000:3000 notes-web
```

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts)
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles (Tailwind)
├── components/       # Reusable UI components
├── stores/           # Zustand state stores
├── lib/              # Utilities and helpers
└── types/            # TypeScript type definitions
```

## License

Open Source
