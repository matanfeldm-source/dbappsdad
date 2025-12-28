from fastapi import APIRouter, HTTPException, Request
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/visits")
async def get_technician_visits(request: Request):
    """Get all technician visits"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        visits = await service.get_technician_visits(user_token=user_token)
        return visits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

