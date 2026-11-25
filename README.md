# AURVEX – Unknown Device & Rogue Network Detection (frontend)

React + Vite, Tailwind CSS, React Three Fiber, Drei, Framer Motion, Lucide, Recharts.

**All data is demonstration data.** No backend is included.

## Run

Needs Node.js 20.19+ or 22.12+.

    npm install
    npm run dev        # open the URL it prints, usually http://localhost:5173

Production build: `npm run build`, then `npm run preview`.

## Structure

    src/components   shared UI, layout, device table/drawer, 3D topology
    src/pages        one file per screen
    src/services     api.js (entry), mockAdapter.js, apiAdapter.js
    src/context      loads data and shares it with pages
    src/data         mock data
    src/styles       Tailwind theme

## Connect the Python backend

1. Implement the functions in `src/services/apiAdapter.js` with your real endpoints.
2. Return the same shapes as `src/data/mockData.js`.
3. Create `.env`:

       VITE_DATA_SOURCE=api
       VITE_API_BASE_URL=<your backend URL>

4. Restart `npm run dev`. The backend must allow the frontend origin (CORS).

Do not put secrets in `VITE_` variables; they are visible in the browser.

## Notes

- The landing robot is a Spline embed and needs internet. Change `ROBOT_URL` in `src/pages/Landing.jsx`.
- The 3D globe from the first plan is replaced by the robot.
- Isolation Forest scores are illustrative; the model belongs in the backend.
- PCAP processing is simulated in demo mode.
- There is no login or authentication.

## Authentication (added)

The landing page now links to `/login` and `/signup`. Dashboard and application routes are protected and require a valid API session. The frontend calls these FastAPI endpoints:

- `POST /api/auth/register` with `{ "name", "email", "password" }`
- `POST /api/auth/login` with `{ "email", "password" }`
- `GET /api/auth/me` with `Authorization: Bearer <access_token>`
- `POST /api/auth/logout` with the same bearer token

Login and registration must return `{ "access_token": "...", "user": { "id": "...", "name": "...", "email": "..." } }`. `/me` returns `{ "user": { ... } }`. The access token is held in `sessionStorage` and is cleared on sign-out or when `/me` rejects it.

Set `VITE_API_BASE_URL` to the backend's reachable URL in `.env`. **The uploaded backend API did not include authentication routes**, so the screens are implemented but real sign-in/sign-up will not work until the matching backend endpoints are added. Do not deploy this as production authentication until those endpoints use secure password hashing, token expiry/revocation, validation, rate limiting and HTTPS.
