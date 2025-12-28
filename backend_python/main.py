from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sys
from pathlib import Path

# Add the backend_python directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from routers import customers, journey, dashboard, technicians
from services.databricks_service import DatabricksService
import uvicorn
import os
from datetime import datetime

app = FastAPI(title="Customer Journey API", version="1.0.0")

# Configure CORS - allow all origins for Databricks Apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a shared service instance
databricks_service = DatabricksService()

# Include routers - these must be registered before the catch-all route
# Note: For the customers root endpoint, we define it directly on the app to avoid router root path issues
@app.get("/api/customers", tags=["customers"])
@app.get("/api/customers/", tags=["customers"])
async def get_all_customers_direct(request: Request):
    """Get all customers with summaries - defined directly to avoid router root path issues"""
    try:
        print(f"DEBUG: get_all_customers_direct called, URL: {request.url}")
        user_token = request.headers.get("x-forwarded-access-token")
        print(f"DEBUG: user_token present: {user_token is not None}")
        customers_list = await databricks_service.get_all_customers(user_token=user_token)
        print(f"DEBUG: get_all_customers_direct returning {len(customers_list)} customers")
        return customers_list
    except Exception as e:
        print(f"ERROR: Exception in get_all_customers_direct: {e}")
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

# Include routers for other endpoints
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(journey.router, prefix="/api/journey", tags=["journey"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(technicians.router, prefix="/api/technicians", tags=["technicians"])

# Add a middleware to log all incoming requests for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG: Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Serve static files from frontend/dist
frontend_dist = backend_dir.parent / "frontend" / "dist"
frontend_available = frontend_dist.exists()

if frontend_available:
    # Mount static assets (JS, CSS, etc.)
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Serve index.html for root path
    @app.get("/")
    async def serve_index():
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"error": "Frontend not found"}
    
    # Serve index.html for all other non-API routes (React Router)
    # This catch-all route will only match if no API route matches (since API routes are defined first)
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # Don't serve frontend for API routes (shouldn't hit here due to route ordering, but be safe)
        print(f"DEBUG: Catch-all route matched: {full_path}, URL: {request.url}")
        if full_path.startswith("api/"):
            from fastapi.responses import JSONResponse
            print(f"DEBUG: Catch-all route returning 404 for API path: {full_path}")
            return JSONResponse(status_code=404, content={"error": "API endpoint not found"})
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"error": "Frontend not found"}
else:
    # If frontend doesn't exist, provide a simple root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "Customer Journey API",
            "status": "running",
            "frontend": "not available - frontend/dist directory not found",
            "api_docs": "/docs",
            "health": "/api/health"
        }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

