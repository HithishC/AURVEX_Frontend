# Add authentication routes to the FastAPI backend

1. Copy `auth_routes.py` into the backend project (for example, `shadowshield/auth_routes.py` or beside `api.py`).
2. In `api.py`, add the import and router registration:

```python
from auth_routes import router as auth_router
app.include_router(auth_router)
```

If the file is inside a package, use its package import path instead.

3. Install the email validation dependency:

```powershell
pip install email-validator
```

4. Set a persistent writable database path before starting the API (optional; defaults to `aurvex_auth.sqlite3` in the working directory):

```powershell
$env:AURVEX_AUTH_DB = "./data/aurvex_auth.sqlite3"
$env:AURVEX_TOKEN_TTL_HOURS = "12"
```

5. Ensure FastAPI CORS middleware allows the deployed frontend origin and the local development origin. Allow `Authorization` and `Content-Type` headers and `GET`/`POST` methods. Use HTTPS in production.
6. Restart the backend. Verify `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout` in Swagger.

This implementation stores salted PBKDF2-HMAC-SHA256 password hashes, opaque random session tokens (only token hashes are stored), expiration timestamps, and revocation state in SQLite. Back up and protect the database file. Add rate limiting and email verification before public production use. Use a persistent disk for the SQLite database on your hosting platform.
