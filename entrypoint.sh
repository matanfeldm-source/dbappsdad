#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the backend_python directory
cd "${SCRIPT_DIR}/backend_python" || cd ./backend_python || { echo "Error: Cannot find backend_python directory"; exit 1; }

# Set default port if not provided
export PORT=${PORT:-3000}

# Start the application with gunicorn
exec gunicorn main:app \
  --bind 0.0.0.0:${PORT} \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 120 \
  --keep-alive 5 \
  --access-logfile - \
  --error-logfile - \
  --log-level info

