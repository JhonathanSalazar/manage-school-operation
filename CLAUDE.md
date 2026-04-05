# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack school management system. The repo will contain four services once built out:

- `frontend/` — React 18 + TypeScript + MUI v6 + Redux Toolkit + RTK Query + Vite
- `backend/` — Node.js + Express + PostgreSQL, JWT auth, Zod validation
- `Java-service/` — Java microservice for PDF report generation (skill test task)
- `seed_db/` — PostgreSQL schema and seed data

## Commands

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Database
```bash
createdb school_mgmt
psql -d school_mgmt -f seed_db/tables.sql
psql -d school_mgmt -f seed_db/seed-db.sql
```

Backend runs on `http://localhost:5007`.  
Demo credentials: `admin@school-admin.com` / `3OU4zn3q6Zh9`

## Architecture

### Frontend (`frontend/src/`)
Feature-based domain structure under `domains/` (auth, students, notices, etc.). Each domain contains its own components, hooks, and RTK Query API slices. Shared UI lives in `components/`, global store in `store/`, routing in `routes/`.

### Backend (`backend/src/`)
Feature modules under `modules/` mirror the frontend domains. Each module owns its routes, controllers, and business logic. Shared DB utilities are in `shared/`. Express middlewares (JWT, CSRF) applied globally from `middlewares/`.

### Java Service (`Java-service/`)
Standalone microservice. Must expose `GET /api/v1/students/:id/report` — it fetches student data from the Node.js backend (`/api/v1/students/:id`) and generates a PDF. **Must not connect to the database directly.**

## Testing

Unit tests must be written alongside every feature or change as part of the development process — not as an afterthought. Each module/domain should have tests covering its core logic before a PR is opened.

## Code Standards

- File naming: kebab-case
- Absolute imports throughout
- Prettier for formatting; Husky pre-commit hooks enforce quality
- Conventional commits; one branch per feature; PRs required for merges
