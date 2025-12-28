#!/bin/bash
set -e

# Get the directory where this script is located (app root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend_python"

# Set default port if not provided (Databricks Apps sets this automatically)
PORT=${PORT:-3000}

# Verify backend directory exists
if [ ! -d "${BACKEND_DIR}" ]; then
    echo "ERROR: Backend directory not found: ${BACKEND_DIR}"
    exit 1
fi

# Verify main.py exists
if [ ! -f "${BACKEND_DIR}/main.py" ]; then
    echo "ERROR: main.py not found in ${BACKEND_DIR}"
    exit 1
fi

# Start the application with gunicorn
# Use --chdir to ensure we're in the right directory for imports
exec gunicorn main:app \
  --chdir "${BACKEND_DIR}" \
  --bind 0.0.0.0:${PORT} \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 120 \
  --keep-alive 5 \
  --access-logfile - \
  --error-logfile - \
  --log-level info

