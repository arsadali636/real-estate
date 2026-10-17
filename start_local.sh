#!/usr/bin/env bash
# ESTATEVO CRM — One-Click Local Launcher

echo "============================================="
echo "   Starting ESTATEVO CRM Local Services      "
echo "============================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Start Backend in Background
echo "► Launching Django REST API on port 8000..."
cd "$PROJECT_ROOT/backend" || exit 1
if [ ! -d "venv" ]; then
    echo "Creating Python virtualenv..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py seed_demo_data
else
    source venv/bin/activate
fi

python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
echo "✓ Backend running with PID $BACKEND_PID at http://localhost:8000/api/v1/"

# 2. Start Frontend
echo "► Launching Next.js Web App on port 3000..."
cd "$PROJECT_ROOT/frontend" || exit 1
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "✓ Frontend running at http://localhost:3000/"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID; exit" INT TERM EXIT
npm run dev
