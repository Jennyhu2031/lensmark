from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import secrets
from datetime import datetime
import os
import base64
from fastapi.responses import Response

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite3")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            gender TEXT,
            avatar TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    # Ensure gender and avatar columns exist if table was created before
    try:
        conn.execute("ALTER TABLE users ADD COLUMN gender TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE users ADD COLUMN avatar TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

class Credentials(BaseModel):
    username: str
    password: str

class GenderUpdate(BaseModel):
    username: str
    gender: str

class AvatarUpdate(BaseModel):
    username: str
    avatar_url: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "ok": True,
        "service": "lensmark-api",
        "endpoints": [
            "/api/register",
            "/api/login",
            "/api/user/{username}",
            "/api/user/update_gender",
            "/api/user/update_avatar",
            "/favicon.ico"
        ],
    }

@app.get("/api/user/{username}")
def get_user(username: str):
    conn = get_db()
    cur = conn.execute("SELECT username, gender, avatar FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": row["username"], "gender": row["gender"], "avatar": row["avatar"]}

@app.post("/api/user/update_gender")
def update_gender(data: GenderUpdate):
    conn = get_db()
    cur = conn.execute("SELECT username FROM users WHERE username = ?", (data.username,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    conn.execute("UPDATE users SET gender = ? WHERE username = ?", (data.gender, data.username))
    conn.commit()
    conn.close()
    return {"ok": True, "gender": data.gender}

@app.post("/api/user/update_avatar")
def update_avatar(data: AvatarUpdate):
    conn = get_db()
    cur = conn.execute("SELECT username FROM users WHERE username = ?", (data.username,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    conn.execute("UPDATE users SET avatar = ? WHERE username = ?", (data.avatar_url, data.username))
    conn.commit()
    conn.close()
    return {"ok": True, "avatar": data.avatar_url}

@app.post("/api/register")
def register(creds: Credentials):
    username = creds.username.strip()
    password = creds.password
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required.")

    conn = get_db()
    cur = conn.execute("SELECT username FROM users WHERE username = ?", (username,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists.")

    salt = secrets.token_hex(16)
    pw_hash = hash_password(password, salt)
    conn.execute(
        "INSERT INTO users (username, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
        (username, pw_hash, salt, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return {"ok": True, "username": username, "gender": None, "avatar": None, "message": "Registered successfully."}

@app.post("/api/login")
def login(creds: Credentials):
    username = creds.username.strip()
    password = creds.password
    conn = get_db()
    cur = conn.execute("SELECT password_hash, salt, gender, avatar FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    expected = row["password_hash"]
    salt = row["salt"]
    gender = row["gender"]
    avatar = row["avatar"]
    if hash_password(password, salt) != expected:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = secrets.token_urlsafe(32)
    return {"ok": True, "token": token, "username": username, "gender": gender, "avatar": avatar}

@app.get("/favicon.ico")
def favicon():
    png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
    png_bytes = base64.b64decode(png_base64)
    return Response(content=png_bytes, media_type="image/png")
