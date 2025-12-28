#!/bin/bash
set -e

# Get the directory where this script is located (app root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to backend_python directory where main.py is located
cd "${SCRIPT_DIR}/backend_python"

# Set default port if not provided
export PORT=${PORT:-3000}

# Start the application with gunicorn
# Use --chdir to ensure we're in the right directory for imports
exec gunicorn main:app \
  --chdir "${SCRIPT_DIR}/backend_python" \
  --bind 0.0.0.0:${PORT} \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 120 \
  --keep-alive 5 \
  --access-logfile - \
  --error-logfile - \
  --log-level info

