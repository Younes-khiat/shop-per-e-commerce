# Django Backend (MongoDB)

Django + DRF + MongoEngine backend for Shop-Per.

## Environment
Create `backend/.env` or set environment vars (auto-loaded by python-dotenv):

```
DJANGO_SECRET_KEY=dev-insecure-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*

DJANGO_MONGODB_URI=mongodb://localhost:27017/
DJANGO_MONGODB_DB=shopper

CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_ALL_ORIGINS=False

JWT_SECRET=dev-jwt-secret
```

You can also reuse front env vars `MONGODB_URI` and `MONGODB_DB`.

## Quick Start (Windows PowerShell)

```powershell
# From repository root or backend folder
cd backend

# (Optional) Create venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install deps
pip install -r requirements.txt

# Initialize Django system tables (SQLite)
python manage.py migrate

# Run server on port 4000
python manage.py runserver 0.0.0.0:4000
```

## API
- `GET /api/health` → `{ status: "ok" }`
- `GET/POST /api/projects`
- `GET/POST /api/stores`
- `GET/POST /api/orders`

## CORS
- Allowed origin: `http://localhost:3000` (Next.js dev)

## Notes
- App data uses MongoDB via MongoEngine. Django’s default DB (SQLite) is only for admin/system apps.
- Authentication is currently open (`AllowAny`). We can enforce Better Auth by checking session/cookies on requests.
