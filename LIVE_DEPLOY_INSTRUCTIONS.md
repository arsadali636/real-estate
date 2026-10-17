# ESTATEVO CRM — Live Deployment & Local Setup Guide

A complete, production-grade guide to run **ESTATEVO CRM** locally or deploy it live on the web in 5 minutes.

---

## 1. Local Run (Your Mac)

Open your Terminal and run:

```bash
cd /Users/apple/Desktop/estatevo-crm
./start_local.sh
```

This single command will:
1. Start the Django REST API on port `8000` (`http://localhost:8000/api/v1/`).
2. Start the Next.js React frontend on port `3000` (`http://localhost:3000/`).
3. Seed all demo data (8 accounts, 6 luxury projects, 29 inventory units, 110 leads across sources, and calendar tasks).

Demo login credentials:
- **Email**: `admin@estatevo.io`
- **Password**: `EstateFlow@2026`

---

## 2. Push to GitHub (In 1 Minute)

Your project folder `/Users/apple/Desktop/estatevo-crm` is already initialized with Git and committed. To put it on your GitHub account:

1. Create a new repository on GitHub (e.g. `estatevo-crm`).
2. Run in terminal:
```bash
cd /Users/apple/Desktop/estatevo-crm
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/estatevo-crm.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy Live for Free / Production

### Step A: Deploy Backend (Render / Railway / Neon)
1. Go to [Render](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository `estatevo-crm`.
3. Set **Root Directory** to `backend`.
4. Environment variables to add:
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<Generate a random 50-character string>`
   - `DATABASE_URL`: `<Your Managed PostgreSQL connection URL from Render or Neon>`
   - `ALLOWED_HOSTS`: `.onrender.com,localhost`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
5. Click **Deploy**. Your API will be live at `https://your-backend.onrender.com/api/v1/`.

### Step B: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository `estatevo-crm`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api/v1`
5. Click **Deploy**.
6. Your ESTATEVO CRM frontend will be live at `https://estatevo-crm.vercel.app` with instant global SSL and CDN!

---

## 4. Downloaded Files Location on your Mac
- **Desktop Folder**: `/Users/apple/Desktop/estatevo-crm/` (Full uncompressed project with Git)
- **Desktop Zip**: `/Users/apple/Desktop/estatevo-crm.zip` (Clean 255KB ZIP archive)
- **Downloads Zip**: `/Users/apple/Downloads/estatevo-crm.zip` (Directly in your Downloads folder)
