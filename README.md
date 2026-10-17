# ESTATEVO CRM — High-Velocity Real Estate Sales Platform

A client-demo-ready, production-grade Real Estate CRM designed for real estate developers, property consultants, brokers, and sales agencies. Features a compact, information-dense executive dashboard, multi-channel lead acquisition tracking, automated follow-up scheduling, and role-enforced access.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Next.js 16 (App Router Frontend)               │
│       React 19 • TypeScript • Tailwind CSS • Recharts       │
│               Hosted on Vercel (Port 3000)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Calls (Token Auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Django 5 + Django REST Framework Backend           │
│  Role Scoping • Multi-Tenancy • Migrations • WhiteNoise     │
│             Hosted on Render / WSGI Gunicorn                │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Connection
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Managed PostgreSQL Database                   │
│   Organizations, Leads, Units, Follow-ups, Activities       │
└─────────────────────────────────────────────────────────────┘
```

---

## Seeded Demo Accounts (Non-Production Testing)

All accounts share the default non-production demo password: `EstateFlow@2026`

| Role | Name | Email / Username | Scoped Access |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | Rajesh Sharma | `admin@estatevo.io` / `admin` | Organization-wide access, team management, full pipeline & reports |
| **Sales Manager** | Ananya Verma | `manager@estatevo.io` / `manager` | Team lead assignment, team review, all tasks & inspections |
| **Sr. Executive** | Sarah Jenkins | `sarah.agent@estatevo.io` / `sarah.agent` | Scoped to assigned leads, tasks, and visits |
| **Luxury Consultant**| Vikram Malhotra| `vikram.agent@estatevo.io` / `vikram.agent` | Scoped to assigned luxury portfolio |
| **Commercial Advisor**| Priya Patel | `priya.agent@estatevo.io` / `priya.agent` | Scoped to commercial suites & offices |
| **Senior Specialist**| Varun Kapoor | `varun.agent@estatevo.io` / `varun.agent` | Scoped to high-priority luxury inventory |
| **HNI Advisor** | Sneha Nowlak | `sneha.agent@estatevo.io` / `sneha.agent` | Scoped to high-net-worth investor leads |
| **Field Lead** | Amitav Sen | `amitav.agent@estatevo.io` / `amitav.agent` | Scoped to site visits & project walk-throughs |

---

## Quickstart — Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL running locally (or SQLite fallback)

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations against local PostgreSQL
python manage.py migrate

# Seed realistic demo organization, projects, inventory, leads & activities
python manage.py seed_demo_data

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```
API Health Check: `http://localhost:8000/api/v1/health/`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Next.js development server
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Implemented Modules (P0)

1. **Module 01 — Dashboard**:
   - Live KPI cards (Total Leads, Enquiries, Overdue Follow-ups, Site Visits, Bookings, Conversion Rate, Booked Sales Volume).
   - Dynamic charts powered by Recharts (Acquisition over time, Source distribution, Pipeline funnel, Agent benchmarks).
   - Time filters (Today, 7 Days, 30 Days) with project and agent dropdowns.
   - Interactive timeline of recent activities and urgent follow-ups.

2. **Module 02 — Lead Management**:
   - Comprehensive leads table with search (name, phone, email) and multi-dimensional filters.
   - Phone duplicate detection warning with existing lead record cross-referencing.
   - Quick action drawer with simulated Call and WhatsApp actions, stage updater, notes history, and follow-up logger.
   - Real CSV export streaming directly from database.

3. **Module 03 — Sales Pipeline**:
   - Kanban board spanning 8 stages (`New`, `Contacted`, `Interested`, `Site Visit Scheduled`, `Site Visit Done`, `Negotiation`, `Booked`, `Lost`).
   - Drag-and-drop support with optimistic UI updates and network rollback.
   - Mandatory lost justification reason modal when moving leads to `Lost`.

4. **Module 04 — Projects & Properties**:
   - Project inventory catalog with high-resolution imagery and pricing tiers.
   - Property unit management table (Tower, Floor, Area, Price, Availability: Available, Reserved, Sold).
   - Public-safe project sharing action with CRM privacy boundary.

5. **Module 05 — Follow-ups & Site Visits**:
   - Filterable tracker by due status (`Due Today`, `Overdue`, `Upcoming`, `Completed`).
   - Task completion dialog prompting for client outcome feedback.
   - Site visit scheduler that automatically advances lead status to `Site Visit Scheduled` and `Site Visit Done`.

6. **Module 06 — Team Management & Reports**:
   - Team directory with conversion metrics, completed task counts, and booking tallies.
   - Server-side role permission enforcement (`IsOwnerOrAdmin`, `IsManagerOrAbove`, `IsExecutive`).
   - Interactive role switcher pill for live client demonstrations.
   - Conversion funnel reports and agent performance rankings.

---

## Simulated vs. Live Features Notice

- **Telephony & WhatsApp**: Outbound phone dialer and WhatsApp messages are executed in simulated demo mode with full activity logging. Telephony gateways (e.g. Twilio, Exotel, Meta Cloud API) can be hooked up via standard webhook endpoints in `backend/config/settings.py`.
- **Brochure Downloads**: Realistic brochure URLs are supplied with copyable public-safe view links.
