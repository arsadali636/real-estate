# ESTATEVO CRM — Comprehensive Production Deployment Guide

ESTATEVO CRM is a modern, high-density real estate customer relationship and property inventory management platform built with:
- **Frontend**: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons) deployed to **Vercel**.
- **Backend**: Python 3.12+ with Django 5 & Django REST Framework, WhiteNoise static handling, and Gunicorn WSGI server deployed to **Render** or compatible Python host.
- **Database**: Managed **PostgreSQL** database (Render PostgreSQL, Neon, Supabase, or AWS RDS).

---

## 1. Managed PostgreSQL Database Setup

### Option A: Render Managed PostgreSQL
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Configure the database:
   - **Name**: `estateflow-db`
   - **Database Name**: `estateflow_crm`
   - **User**: `estateflow`
   - **Region**: Select the region nearest your users (e.g., Singapore or Frankfurt).
   - **Plan**: Free or Starter.
4. Click **Create Database**.
5. Once provisioned, copy the **Internal Database URL** (for services inside Render) or **External Database URL** (for remote access):
   ```text
   postgresql://estateflow:<PASSWORD>@dpg-xxxx.render.com:5432/estateflow_crm
   ```

---

## 2. Django Backend Deployment (Render)

### Step 1: Connect Repository to Render
1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub/GitLab repository containing `estateflow-crm`.
3. Set the **Root Directory** to: `backend`.
4. Configure the build and runtime settings:
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
     ```

### Step 2: Configure Backend Environment Variables
In the Render Web Service settings, add the following Environment Variables:

| Variable | Recommended Value / Description | Example |
| :--- | :--- | :--- |
| `DJANGO_DEBUG` | `False` (Production mode) | `False` |
| `DJANGO_SECRET_KEY` | Generate a 50+ character random secret | `prod-secret-key-xxxxxxxxxxxx` |
| `DATABASE_URL` | Your Managed PostgreSQL connection string | `postgresql://estateflow:pass@dpg-xxx.render.com:5432/estateflow_crm` |
| `ALLOWED_HOSTS` | Render domain and local origins (comma-separated) | `.onrender.com,localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of permitted frontend origins | `https://estateflow-crm.vercel.app,http://localhost:3000` |
| `CSRF_TRUSTED_ORIGINS` | Permitted CSRF origins | `https://*.vercel.app,https://*.onrender.com` |
| `PYTHON_VERSION` | Python runtime version | `3.12.8` |

### Step 3: Seed Demo Accounts and Property Inventory
Once the service builds and deploys successfully:
1. Go to the **Shell** tab in the Render Dashboard.
2. Run the repeatable idempotent demo seeding command:
   ```bash
   python manage.py seed_demo_data
   ```
3. Verify the output:
   ```text
   Created organization: Apex Horizon Realty Partners
   Created user: admin (OWNER)
   Created user: manager (MANAGER)
   Created user: sarah.agent (EXECUTIVE)
   Created user: vikram.agent (EXECUTIVE)
   Created user: priya.agent (EXECUTIVE)
   Processed 4 projects with inventory units.
   Successfully processed 35 leads.
   Demo database seeding complete!
   ```

### Step 4: Verify API Health Endpoint
Test the public API health check:
```bash
curl -i https://your-backend-app.onrender.com/api/v1/health/
```
Expected response:
```json
{
  "status": "healthy",
  "product": "ESTATEVO CRM API",
  "version": "1.0.0",
  "database": "PostgreSQL"
}
```

---

## 3. Frontend Deployment (Vercel)

### Step 1: Import Project in Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your Git repository.
4. In the configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click Edit and select `frontend`.
   - **Build Command**: `npm run build` (Default)
   - **Output Directory**: `.next` (Default)

### Step 2: Configure Frontend Environment Variables
Add the public API base URL:

| Variable Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-app.onrender.com/api/v1` |

> **Important**: Do not add trailing slashes. Do not place Django secret keys or database connection strings in the frontend environment variables.

### Step 3: Deploy and Verify
1. Click **Deploy**.
2. Vercel will install dependencies, compile TypeScript, run Turbopack page generation, and deploy the production bundle.
3. Once finished, visit your live Vercel URL (e.g. `https://estateflow-crm.vercel.app`).

---

## 4. End-to-End Live Verification Checklist

Once both services are live, verify the core workflow:
1. **Initial Access**: Open the Vercel URL. The app automatically authenticates as Owner/Admin (`admin@estateflow.io`) for demonstration.
2. **Dashboard**: Verify that live metrics load (Total Leads, New Enquiries, Conversion Rate) and that Recharts graphs render.
3. **Leads Management**:
   - Navigate to `/leads`.
   - Filter by stage (e.g., `Site Visit Scheduled`).
   - Click a lead row to open `LeadDetailDrawer`. Test adding a note or changing status.
4. **Sales Pipeline**:
   - Navigate to `/pipeline`.
   - Drag a lead card across stages (e.g., `New` → `Contacted`). Verify instant optimistic UI update and network sync.
   - Drag to `Lost` and verify that the Lost Reason modal prompts for justification.
5. **Projects & Property Units**:
   - Navigate to `/projects`.
   - Open `Skyline Pinnacle Residences`. Inspect unit availability table (Available, Reserved, Sold).
   - Test the "Share Link" action and verify the public-safe view copy notice.
6. **Follow-ups & Site Visits**:
   - Navigate to `/follow-ups` and `/site-visits`.
   - Mark a follow-up complete with an outcome note.
   - Schedule a new site visit and verify that the lead status updates to `Site Visit Scheduled`.
7. **Team Management & Role Switcher**:
   - Click the "Demo Role" pill in the top navigation bar.
   - Switch to `Executive (Sarah Jenkins)`.
   - Verify that the leads table and dashboard metrics now only display leads assigned to Sarah, proving server-side enforcement.
8. **CSV Export**:
   - Click **Export CSV** on `/leads` or `/reports`. Verify that a real CSV file downloads containing authorized lead rows.

---

## 5. Troubleshooting Guide

### CORS Errors (`Cross-Origin Request Blocked`)
- **Symptom**: Browser console shows CORS header missing when calling Django API.
- **Fix**: Add your Vercel domain to `CORS_ALLOWED_ORIGINS` in your Render backend settings:
  ```text
  CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
  ```

### Database Connection Failure
- **Symptom**: 500 error on API calls with `psycopg2.OperationalError`.
- **Fix**: Check that `DATABASE_URL` is set correctly in backend environment variables and that the managed PostgreSQL instance is running.

### 401 Unauthorized Errors
- **Symptom**: Requests return 401.
- **Fix**: The frontend API client automatically injects the `Authorization: Token <token>` header. Verify that the user token is present in browser `localStorage.getItem('estateflow_token')`.
