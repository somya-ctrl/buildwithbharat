# Codexa Demo

A real-time collaborative coding workspace for hackathon teams — shared workspaces, a Monaco-based code editor with live multi-user sync, team chat, AI code analysis, and video meetings.

Built for the Build with Bharat hackathon.

## Features

- **Workspaces** — create a workspace or join one via invite link/code, shared by your team.
- **Collaborative editor** — Monaco editor with real-time sync across everyone viewing the same file (via Socket.IO), plus Run (JS/TS) and AI-powered code Analyze.
- **Team chat** — real-time messaging scoped to a workspace, backed by Postgres history.
- **Presence** — see who's online in a workspace and who else is editing a file with you.
- **AI assistant** — chat/explain/debug/generate endpoints backed by an ML model.
- **Video meetings** — WebRTC signaling for peer-to-peer calls and screen sharing, relayed over Socket.IO.
- **Notifications** — in-app alerts for workspace invites and activity.

## Stack

| Layer     | Tech                                                              |
| --------- | ------------------------------------------------------------------ |
| Frontend  | React + Vite, Tailwind, `@monaco-editor/react`, `socket.io-client` |
| Backend   | Node.js, Express, TypeScript, Socket.IO                            |
| Database  | PostgreSQL via Prisma ORM                                          |
| Real-time | Socket.IO (optional Redis adapter for multi-instance scaling)      |

## Project Structure

```
backend/     Express + Socket.IO API server, Prisma schema & migrations
frontend/    React + Vite client
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev          # http://localhost:5001
```

Create `backend/.env`:

```env
PORT=5001
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db>"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"


See [`backend/INTEGRATION_GUIDE.md`](backend/INTEGRATION_GUIDE.md) for the full REST API and Socket.IO event reference.

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Optional `frontend/.env`:

```env
VITE_API_URL="http://localhost:5001/api"
VITE_SOCKET_URL="http://localhost:5001"
```

## Development Notes

- Auth is real (JWT + httpOnly cookie) — sign up for an account, there's no demo/guest bypass.
- To collaborate, create a workspace and invite a teammate via the invite link/code shown in the workspace's Invite modal, or have them join manually with the code.

