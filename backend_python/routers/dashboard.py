from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        stats = await service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends/hourly")
async def get_hourly_trends():
    """Get hourly call trends"""
    try:
        trends = await service.get_hourly_trends()
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends/daily")
async def get_daily_trends():
    """Get daily call trends"""
    try:
        trends = await service.get_daily_trends()
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

