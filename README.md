Splitwise Clone — Backend

Overview

This is the backend for a Splitwise-like application built with Node.js, Express and MongoDB (Mongoose). It provides APIs for users, groups, expenses, settlements, activity feed and a simple dashboard.

Features

- User authentication (signup / login) using JWT
- Create and list groups
- Create expenses (in an existing group or while creating a new group)
- Compute per-user net balances and per-group balances
- Settlements between users (in-group and across all groups)
- Friends list with per-friend balances
- Activity feed for recent events (expenses / settlements)

Quick start (development)

1. Install dependencies

Open a terminal in the `backend` folder and install node modules:

```powershell
npm install
```

2. Environment

Copy or create a `.env` file in the project root. Required env vars (example values):

```
PORT=4500
ENVIRONMENT=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/
JWT_SECRET=very_secret
```

3. Start the dev server

This project runs TypeScript directly via `nodemon` for development. Start it with:

```powershell
npm run dev
```

By default the server listens on the port defined in `PORT` (4500 in example). Visit http://localhost:4500 to test endpoints.

Production build

1. Build

```powershell
npm run build
```

2. Run

```powershell
npm start
```

API highlights

- POST /api/auth/signup — create a user
- POST /api/auth/login — login and receive a JWT
- GET /api/dashboard — dashboard balances for the authenticated user
- GET /api/groups — list groups for the authenticated user
- POST /api/groups — create group
- GET /api/groups/:groupId — get group detail (includes `youOwe`, `youAreOwed`, and `owesYou` alias)
- POST /api/expenses/new-group — create a group and an expense
- POST /api/expenses/group — create an expense in an existing group
- GET /api/activity — recent activity feed
- GET /api/friends — list friends and balances
- POST /api/settlements/... — create settlements between users

Notes & troubleshooting

- Ensure `MONGO_URI` points to a running MongoDB instance. If using atlas include the DB name or connect string correctly.
- The server logs some debug info for balances under `computeNetBalancesForUser` — useful when validating why balances appear as they do.
- The code exposes both `youAreOwed` and `owesYou` fields in group/dashboard responses for compatibility.
