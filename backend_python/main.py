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

# Include routers
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(journey.router, prefix="/api/journey", tags=["journey"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(technicians.router, prefix="/api/technicians", tags=["technicians"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Serve static files from frontend/dist
frontend_dist = backend_dir.parent / "frontend" / "dist"
if frontend_dist.exists():
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
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"error": "Frontend not found"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

