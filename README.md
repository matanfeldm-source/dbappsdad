# Customer Journey Visualization App

An interactive web application for visualizing customer journeys for home appliance device clients, designed to run in Databricks Apps. Built with Python FastAPI backend and React frontend.

## Features

- **Customer Journey Detail Page**: Interactive vertical timeline showing all customer events (calls, installations, technician visits, website visits, digital interactions) with distinct shapes and colors for each event type, most recent events first, clickable events with detailed popups, plus AI-generated summaries and next best actions
- **Overview Page**: Interactive table view of all customers with AI summaries and status icons, plus information cards showing open cases and customer status distribution
- **Dashboard Page**: Interactive charts showing hourly and daily trends of customer calls
- **Technician Map Page**: Interactive map showing technician visits (underway and planned) with different colored icons per technician

## Architecture

- **Backend**: FastAPI (Python) API server connecting to Databricks SQL Warehouse
- **Frontend**: React 18 with Vite
- **Visualization Libraries**:
  - vis-timeline for interactive timelines
  - Chart.js for trend graphs
  - Leaflet for interactive maps
  - TanStack Table for interactive tables

## Database Schema

The application uses the following Databricks tables:
- `customers` - Customer master data
- `customer_calls` - Call records
- `installations` - Installation events
- `technician_visits` - Visit records with coordinates
- `website_visits` - Website interaction logs
- `digital_interactions` - WhatsApp, Facebook, Email interactions
- `customer_summaries` - Pre-computed AI summaries
- `next_best_actions` - Recommended actions per customer

See `sql/schemas.sql` for complete schema definitions with sample data.

## Setup

### Prerequisites

- Python 3.8+ installed
- pip package manager
- Node.js 18+ (for frontend only)
- Databricks SQL Warehouse access (optional, mock data available)
- Databricks personal access token (optional)

### Installation

1. Install Python backend dependencies:
```bash
cd backend_python
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. (Optional) Configure Databricks connection in `backend_python/.env`:
```env
DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your-warehouse-id
DATABRICKS_TOKEN=your-personal-access-token
DATABRICKS_CATALOG=your-catalog
DATABRICKS_SCHEMA=your-schema
PORT=3000
```

4. (Optional) Create the database tables in Databricks:
   - Run the SQL statements from `sql/schemas.sql` in your Databricks SQL Warehouse

### Running Locally

1. Start the backend server:
```bash
cd backend_python
python main.py
# Or: uvicorn main:app --reload --port 3000
```

Or use npm script:
```bash
npm run dev:backend
```

2. In another terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Or use npm script from root:
```bash
npm run dev:frontend
```

3. Open your browser to `http://localhost:5173`

### Deploying to Databricks Apps

1. Ensure your backend is configured with production environment variables
2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy using Databricks Apps deployment tools
4. Configure the app using `databricks-app.json`

## API Endpoints

- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/summary` - Get AI summary
- `GET /api/customers/:id/next-action` - Get next best action
- `GET /api/journey/:customerId` - Get customer journey timeline events
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends/hourly` - Get hourly call trends
- `GET /api/dashboard/trends/daily` - Get daily call trends
- `GET /api/technicians/visits` - Get technician visits with coordinates

## Event Types in Timeline

- **Calls** (blue circle): Customer service calls
- **Installations** (green square): Product installations
- **Technician Visits** (orange triangle): Service visits
- **Website Visits** (purple diamond): Website interactions
- **Digital Interactions** (pink/blue/indigo star): WhatsApp, Facebook, Email interactions

## Customer Status

- **Low** (green): Low priority customers
- **Normal** (yellow): Normal priority customers
- **Urgent** (red): Urgent priority customers

## License

MIT

