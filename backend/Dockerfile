# Production Dockerfile for Django REST Framework (Railway / Docker)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies (curl for container healthcheck, libpq for PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Collect static files during Docker build so WhiteNoise has them ready
RUN DJANGO_SECRET_KEY=railway-build-dummy-key python manage.py collectstatic --noinput

# Set permissions for entrypoint script
RUN chmod +x /app/entrypoint.sh

# Expose port (dynamic on Railway)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/v1/health/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
