# ESTATEVO CRM — Railway Deployment Guide (Step-by-Step)

This guide walks you through deploying **ESTATEVO CRM** to [Railway](https://railway.app) using the production Dockerfiles.

---

## 🏗️ Architecture on Railway

Your Railway Project will contain **3 connected services**:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Railway Project Dashboard                   │
├─────────────────┬─────────────────────────┬─────────────────┤
│ 1. PostgreSQL   │ 2. Backend (Django API) │ 3. Frontend UI  │
│ Managed Database│ Dockerfile in /backend  │ Dockerfile in   │
│                 │ Port $PORT              │ /frontend       │
└────────▲────────┴────────────▲────────────┴────────▲────────┘
         │                     │                     │
         └─ DATABASE_URL ──────┘                     │
                               └─ NEXT_PUBLIC_API_URL ┘
```

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub
Ensure all files (including `backend/Dockerfile`, `frontend/Dockerfile`, and `railway.json`) are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Add Docker and Railway configuration files"
git push origin main
```

---

### Step 2: Create a New Project & PostgreSQL on Railway

1. Open [railway.app](https://railway.app) and sign in with GitHub.
2. Click **"New Project"**.
3. Select **"Provision PostgreSQL"**.
4. Railway will spin up a managed PostgreSQL database in seconds.

---

### Step 3: Deploy the Backend Service (Django API)

1. In the same Railway project canvas, click **"+ New"** → **"GitHub Repo"**.
2. Select your `estateflow-crm` repository.
3. Once the service appears on the canvas, click on it and open **"Settings"**:
   - Under **General** → **Service Name**: rename to `backend` (or `estateflow-backend`).
   - Under **Root Directory**: enter `/backend`.
   - (Railway will automatically detect `backend/Dockerfile` and `backend/railway.json`).
4. Click the **"Variables"** tab and add the following environment variables:

| Variable Name | Value / Description |
| :--- | :--- |
| `DATABASE_URL` | Click **"Add Reference"** and select `Postgres.DATABASE_URL` (or paste `${{Postgres.DATABASE_URL}}`) |
| `DJANGO_SECRET_KEY` | Any long random string (e.g. `prod-sec-key-estateflow-railway-2026-xyz`) |
| `DJANGO_DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*` |
| `AUTO_SEED` | `true` *(Automatically runs migrations and seeds demo data on 1st boot)* |
| `CORS_ALLOW_ALL_ORIGINS` | `True` |

5. Under **"Settings"** → **"Networking"**:
   - Click **"Generate Domain"** (e.g. `estateflow-backend-production.up.railway.app`).
   - Copy this URL.

6. **Check Logs**:
   - Go to **"Deployments"** → Click on the active deployment to view build & runtime logs.
   - You should see:
     ```text
     ► Applying database migrations...
     ► Checking / Seeding demo data...
     ► Launching Gunicorn WSGI on port ...
     ```
   - Verify health by visiting `https://your-backend-url.up.railway.app/api/v1/health/` in your browser. It should return `{"status":"healthy"}`.

---

### Step 4: Deploy the Frontend Service (Next.js)

1. In the same Railway project canvas, click **"+ New"** → **"GitHub Repo"**.
2. Select the **same** repository again.
3. Click on the new service and open **"Settings"**:
   - Under **General** → **Service Name**: rename to `frontend` (or `estateflow-web`).
   - Under **Root Directory**: enter `/frontend`.
4. Click the **"Variables"** tab and add:

| Variable Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-url.up.railway.app/api/v1` *(Paste your actual Backend URL from Step 3 + `/api/v1`)* |

5. Under **"Settings"** → **"Networking"**:
   - Click **"Generate Domain"** (e.g. `estateflow-web-production.up.railway.app`).

6. **Check Logs**:
   - Railway builds the Next.js production bundle using `frontend/Dockerfile` and starts the app.
   - Once deployment shows **Active (Green)**, open the generated frontend domain!

---

## 🔑 Live Demo Credentials

Once deployed, you can log in immediately using the seeded accounts:

- **Password (Sabhi accounts ke liye)**: `EstateFlow@2026`
- **Owner / Admin**: `admin@estatevo.io` (or `admin`)
- **Sales Manager**: `manager@estatevo.io` (or `manager`)
- **Sr. Executive**: `sarah.agent@estatevo.io` (or `sarah.agent`)
- **Luxury Consultant**: `vikram.agent@estatevo.io` (or `vikram.agent`)

*(Or simply use the 1-Click Role Switcher in the top navigation bar!)*

---

## 💻 Local Testing with Docker Compose (Optional)

If you have Docker Desktop installed locally:

```bash
# Build and start all 3 services locally (PostgreSQL, Django, Next.js)
docker compose up --build

# Open Web App
http://localhost:3000

# Open API
http://localhost:8000/api/v1/health/

# Stop services
docker compose down
```
