from fastapi import APIRouter, HTTPException, Request
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

# Root path handler removed - now defined directly in main.py to avoid router root path matching issues
# This router now only handles sub-paths like /{customer_id}, /{customer_id}/summary, etc.

@router.get("/{customer_id}")
async def get_customer(customer_id: str, request: Request):
    """Get single customer by ID"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        customer = await service.get_customer_by_id(customer_id, user_token=user_token)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}/summary")
async def get_customer_summary(customer_id: str, request: Request):
    """Get customer AI summary"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        summary = await service.get_customer_summary(customer_id, user_token=user_token)
        if not summary:
            raise HTTPException(status_code=404, detail="Summary not found")
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}/next-action")
async def get_next_best_action(customer_id: str, request: Request):
    """Get next best action for customer"""
    try:
        user_token = request.headers.get("x-forwarded-access-token")
        action = await service.get_next_best_action(customer_id, user_token=user_token)
        if not action:
            return {"message": "No pending actions"}
        return action
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

