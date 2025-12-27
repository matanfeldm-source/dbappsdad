# Quick Start Guide

## Prerequisites

- Python 3.8 or higher
- pip package manager
- Node.js 18 or higher (for frontend)
- npm or yarn package manager (for frontend)

## Installation Steps

1. **Install all dependencies:**
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Running with Mock Data (No Databricks Connection Required)

The app can run with mock data for testing without connecting to Databricks:

1. **Install Python dependencies:**
```bash
cd backend_python
pip install -r requirements.txt
```

2. **Start the backend server:**
```bash
cd backend_python
python main.py
```

Or use uvicorn directly:
```bash
cd backend_python
uvicorn main:app --reload --port 3000
```

The backend will automatically use mock data if Databricks credentials are not configured.

2. **In another terminal, start the frontend:**
```bash
cd frontend
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:5173`

You should see the app running with sample customer data.

## Connecting to Databricks

To connect to your Databricks SQL Warehouse:

1. **Copy the environment file:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` with your Databricks credentials:**
```env
DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your-warehouse-id
DATABRICKS_TOKEN=your-personal-access-token
DATABRICKS_CATALOG=your-catalog
DATABRICKS_SCHEMA=your-schema
PORT=3000
```

3. **Create the database tables:**
   - Open your Databricks SQL Warehouse
   - Run the SQL statements from `sql/schemas.sql`
   - This will create all necessary tables with sample data

4. **Restart the backend server** - it will now connect to Databricks instead of using mock data.

## Testing the Application

### Overview Page
- Navigate to `/` to see the customer overview table
- View information cards showing open cases and customer status distribution
- Click on a customer ID to view their detailed journey

### Customer Journey Page
- Shows an interactive timeline of all customer events
- Click on timeline events to see details
- View AI-generated summary on the right side
- See customer status and next best action recommendations

### Dashboard Page
- Navigate to `/dashboard` to see call trends
- View hourly trends (last 24 hours)
- View daily trends (last 30 days)

### Technician Map Page
- Navigate to `/technicians` to see the map view
- Filter by visit status (all, underway, planned)
- Click markers to see visit details
- View technician visit summary below the map

## Troubleshooting

### Backend won't start
- Check that port 3000 is available
- Verify Python version (should be 3.8+)
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Check for error messages in the console

### Frontend won't start
- Check that port 5173 is available
- Verify all frontend dependencies are installed
- Check browser console for errors

### No data showing
- If using mock data, verify backend is running and accessible
- If using Databricks, check:
  - Environment variables are set correctly
  - Databricks token is valid
  - Tables exist in the specified schema
  - Network connectivity to Databricks

### Timeline not rendering
- Check browser console for JavaScript errors
- Verify vis-timeline CSS is loaded (check Network tab)
- Ensure timeline data is being returned from the API

## Next Steps

- Customize the AI summaries by updating the `customer_summaries` table
- Add more sample data to test different scenarios
- Customize the event types and colors in the timeline
- Deploy to Databricks Apps following the Databricks documentation

