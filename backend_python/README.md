# Customer Journey Backend (FastAPI)

Python FastAPI backend for the Customer Journey Visualization App.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure environment (optional):**
```bash
cp .env.example .env
# Edit .env with your Databricks credentials
```

3. **Run the server:**
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 3000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## Endpoints

All endpoints are prefixed with `/api`:

- `GET /api/health` - Health check
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `GET /api/customers/{id}/summary` - Get customer AI summary
- `GET /api/customers/{id}/next-action` - Get next best action
- `GET /api/journey/{customer_id}` - Get customer journey timeline
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends/hourly` - Get hourly trends
- `GET /api/dashboard/trends/daily` - Get daily trends
- `GET /api/technicians/visits` - Get technician visits

## Mock Data Mode

The backend automatically uses mock data if Databricks credentials are not configured. This allows testing without a Databricks connection.

To connect to Databricks, set the following environment variables:
- `DATABRICKS_SERVER_HOSTNAME`
- `DATABRICKS_HTTP_PATH`
- `DATABRICKS_TOKEN`
- `DATABRICKS_CATALOG` (optional)
- `DATABRICKS_SCHEMA` (optional)

