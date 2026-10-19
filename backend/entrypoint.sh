#!/usr/bin/env bash
set -e

echo "=== ESTATEVO CRM Django Backend Starting ==="
echo "► Database configuration: ${DATABASE_URL:+PostgreSQL (connected)}${DATABASE_URL:-SQLite fallback mode}"

# Run database migrations
echo "► Applying database migrations..."
python manage.py migrate --noinput

# Seed initial demo data if AUTO_SEED is true (default: true)
if [ "${AUTO_SEED:-true}" = "true" ]; then
    echo "► Checking / Seeding demo data..."
    python manage.py seed_demo_data || echo "Demo data seed completed or already present."
    python manage.py seed_leadrat_report_data || echo "Leadrat report data seed completed or already present."
fi

# Determine port (Railway passes $PORT dynamically, defaults to 8000)
LISTEN_PORT="${PORT:-8000}"
echo "► Launching Gunicorn WSGI on port ${LISTEN_PORT}..."

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${LISTEN_PORT} \
    --workers 3 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
