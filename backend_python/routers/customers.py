from fastapi import APIRouter, HTTPException, Request
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.databricks_service import DatabricksService

router = APIRouter()
service = DatabricksService()

@router.get("/")
async def get_all_customers(request: Request):
    """Get all customers with summaries"""
    try:
        print(f"DEBUG: get_all_customers called, URL: {request.url}")
        # Get token from x-forwarded-access-token header
        user_token = request.headers.get("x-forwarded-access-token")
        print(f"DEBUG: user_token present: {user_token is not None}")
        customers = await service.get_all_customers(user_token=user_token)
        print(f"DEBUG: get_all_customers returning {len(customers)} customers")
        return customers
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: Exception in get_all_customers: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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

