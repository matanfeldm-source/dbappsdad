from fastapi import APIRouter, HTTPException, Request
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/{customer_id}")
async def get_customer_journey(customer_id: str, request: Request):
    """Get customer journey timeline events"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        journey = await service.get_customer_journey(customer_id, user_token=user_token)
        return journey
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

