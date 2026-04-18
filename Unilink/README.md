# UniLink (MERN)

UniLink is a university student networking platform (profiles, posts, events, groups, connections).

## Run locally

### 1) Start MongoDB

Make sure MongoDB is running locally on:

- `mongodb://127.0.0.1:27017/unilink`

Or set a custom URI in `server/.env`.

### 2) Configure environment

Copy env examples:

- `server/.env.example` → `server/.env`
- `client/.env.example` → `client/.env` (optional)

### 3) Install dependencies

From the project root:

```bash
npm i
npm i --prefix server
npm i --prefix client
```

### 4) Start client + server

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api/health`

## What’s included

- **Auth**: register/login (JWT)
- **Profiles**: view/update, student search
- **Feed**: create posts, like
- **Events**: create, list, register; admin approval
- **Groups**: create, list, join/leave
- **Connections**: send/accept/reject requests

