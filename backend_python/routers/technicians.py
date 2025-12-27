from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/visits")
async def get_technician_visits():
    """Get all technician visits"""
    try:
        visits = await service.get_technician_visits()
        return visits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

