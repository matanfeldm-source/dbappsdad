from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/{customer_id}")
async def get_customer_journey(customer_id: str):
    """Get customer journey timeline events"""
    try:
        journey = await service.get_customer_journey(customer_id)
        return journey
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

