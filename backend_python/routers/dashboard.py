from fastapi import APIRouter, HTTPException, Request
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/stats")
async def get_dashboard_stats(request: Request):
    """Get dashboard statistics"""
    try:
        print(f"DEBUG: get_dashboard_stats called, URL: {request.url}")
        user_token = request.headers.get("x-forwarded-access-token")
        print(f"DEBUG: user_token present: {user_token is not None}")
        stats = await service.get_dashboard_stats(user_token=user_token)
        print(f"DEBUG: get_dashboard_stats returning stats: {stats}")
        return stats
    except Exception as e:
        print(f"ERROR: Exception in get_dashboard_stats: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends/hourly")
async def get_hourly_trends(request: Request):
    """Get hourly call trends"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        trends = await service.get_hourly_trends(user_token=user_token)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends/daily")
async def get_daily_trends(request: Request):
    """Get daily call trends"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        trends = await service.get_daily_trends(user_token=user_token)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

