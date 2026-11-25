"""Drop-in FastAPI authentication router for AURVEX.

Uses SQLite, PBKDF2-HMAC-SHA256 password hashes, opaque random bearer tokens,
and server-side session expiry/revocation. Configure AURVEX_AUTH_DB and
AURVEX_TOKEN_TTL_HOURS in the backend environment.
"""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/api/auth", tags=["authentication"])
DB_PATH = Path(os.getenv("AURVEX_AUTH_DB", "aurvex_auth.sqlite3"))
TOKEN_TTL_HOURS = max(1, int(os.getenv("AURVEX_TOKEN_TTL_HOURS", "12")))
ITERATIONS = 310_000


def _db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_salt BLOB NOT NULL,
            password_hash BLOB NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at TEXT NOT NULL,
            revoked INTEGER NOT NULL DEFAULT 0
        );
    """)
    return conn


def _password_hash(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)


def _public_user(row: sqlite3.Row) -> dict[str, str]:
    return {"id": row["id"], "name": row["name"], "email": row["email"]}


def _issue_session(conn: sqlite3.Connection, user_id: str) -> str:
    token = secrets.token_urlsafe(48)
    digest = hashlib.sha256(token.encode()).hexdigest()
    expires = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)
    conn.execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
                 (digest, user_id, expires.isoformat()))
    return token


class RegisterBody(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


def current_user(authorization: str | None = Header(default=None)) -> dict[str, str]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    token = authorization[7:].strip()
    digest = hashlib.sha256(token.encode()).hexdigest()
    conn = _db()
    try:
        row = conn.execute("""SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
            WHERE s.token_hash=? AND s.revoked=0 AND s.expires_at>?""",
            (digest, datetime.now(timezone.utc).isoformat())).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Session is invalid or expired. Please sign in again.")
        return _public_user(row)
    finally:
        conn.close()


@router.post("/register", status_code=201)
def register(body: RegisterBody) -> dict[str, Any]:
    email = str(body.email).strip().lower()
    salt = secrets.token_bytes(16)
    digest = _password_hash(body.password, salt)
    user_id = secrets.token_hex(16)
    conn = _db()
    try:
        conn.execute("INSERT INTO users(id,name,email,password_salt,password_hash,created_at) VALUES(?,?,?,?,?,?)",
                     (user_id, body.name.strip(), email, salt, digest, datetime.now(timezone.utc).isoformat()))
        token = _issue_session(conn, user_id)
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        return {"access_token": token, "token_type": "bearer", "user": _public_user(row)}
    except sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    finally:
        conn.close()


@router.post("/login")
def login(body: LoginBody) -> dict[str, Any]:
    conn = _db()
    try:
        row = conn.execute("SELECT * FROM users WHERE email=?", (str(body.email).strip().lower(),)).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        candidate = _password_hash(body.password, row["password_salt"])
        if not hmac.compare_digest(candidate, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        token = _issue_session(conn, row["id"])
        conn.commit()
        return {"access_token": token, "token_type": "bearer", "user": _public_user(row)}
    finally:
        conn.close()


@router.get("/me")
def me(user: dict[str, str] = Depends(current_user)) -> dict[str, Any]:
    return {"user": user}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None), user: dict[str, str] = Depends(current_user)) -> dict[str, bool]:
    token = authorization[7:].strip()
    digest = hashlib.sha256(token.encode()).hexdigest()
    conn = _db()
    try:
        conn.execute("UPDATE sessions SET revoked=1 WHERE token_hash=?", (digest,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()
