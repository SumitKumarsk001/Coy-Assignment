# Coy Discover (React + Express)

A swipe-based "Discover" tab plus a Matches view. **Frontend:** React (Vite), framer-motion. **Backend:** Node + Express with a JSON-file store.

## Run
```bash
npm install
npm run dev     # API on :4000, React app on http://localhost:5173 (use mobile view, ~390px)
npm test        # 12 tests (store logic + real HTTP calls)
npm run reset   # wipe swipes/matches
```
Production: `npm run build && npm start` serves the app and API together on http://localhost:4000.

State persists in `.data/db.json`, so swipes and matches survive reloads.

## Structure
```
server/  app.js (Express routes) · store.js (all logic) · seed.js (36 profiles)
src/     App.jsx (tab bar) · components/Discover.jsx · components/Matches.jsx
tests/   store.test.js · api.test.js
```

## API
| Endpoint | Description |
|---|---|
| `GET /api/feed` | Profiles not yet swiped on. Contains no "liked you" information. |
| `POST /api/swipe` `{targetId, direction: "like"\|"pass"}` | Returns `{match:false}` or `{match:true, profile}`. 400 on bad input, 404 on unknown profile. |
| `GET /api/matches` | Mutual matches only, newest first. |

## Design decisions
- **Privacy:** seed profiles carry a server-only `likedUser` flag, stripped by `publicProfile()` before anything leaves the backend. A test asserts `/api/feed` never contains it. "Who liked you" is only ever revealed as `{match:true}` at the moment of a mutual like.
- **Matches are computed on the server**, never the client.
- **Idempotent swipes:** the first swipe on a profile wins, so a pass can't be flipped to a like to probe who liked you.
- **A swiped profile never reappears:** the feed filters on stored swipes and the UI drops the card immediately.
- Writes are atomic (temp file + rename). Photos are placeholders from picsum.photos with a gradient fallback.
- A production deployment would use a DB with a unique `(user_id, target_id)` constraint.

## Part A
See `PartA.md`.
