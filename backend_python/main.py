from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

