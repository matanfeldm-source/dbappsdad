import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from .mock_data_service import (
    MOCK_CUSTOMERS,
    MOCK_JOURNEY,
    MOCK_STATS,
    MOCK_HOURLY_TRENDS,
    MOCK_DAILY_TRENDS,
    MOCK_VISITS,
    MOCK_NEXT_ACTIONS,
)

# Check if Databricks credentials are configured
USE_MOCK_DATA = (
    not os.getenv("DATABRICKS_SERVER_HOSTNAME")
    or os.getenv("DATABRICKS_SERVER_HOSTNAME") == "your-workspace.cloud.databricks.com"
)

class DatabricksService:
    """Service for querying Databricks tables or returning mock data"""
    
    def __init__(self):
        self.use_mock_data = USE_MOCK_DATA
        if self.use_mock_data:
            print("Using mock data mode - configure DATABRICKS_SERVER_HOSTNAME to connect to Databricks")
    
    async def get_all_customers(self) -> List[Dict[str, Any]]:
        """Get all customers with summaries"""
        if self.use_mock_data:
            return MOCK_CUSTOMERS
        
        # TODO: Implement actual Databricks query
        # For now, return mock data
        return MOCK_CUSTOMERS
    
    async def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get single customer details"""
        if self.use_mock_data:
            customer = next((c for c in MOCK_CUSTOMERS if c["customer_id"] == customer_id), None)
            if customer:
                return {
                    **customer,
                    "summary_generated_at": datetime.now().isoformat(),
                }
            return None
        
        # TODO: Implement actual Databricks query
        return None
    
    async def get_customer_journey(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get customer journey timeline events"""
        if self.use_mock_data:
            return MOCK_JOURNEY.get(customer_id, [])
        
        # TODO: Implement actual Databricks query
        return []
    
    async def get_customer_summary(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get customer AI summary"""
        if self.use_mock_data:
            customer = next((c for c in MOCK_CUSTOMERS if c["customer_id"] == customer_id), None)
            if customer:
                return {
                    "summary_text": customer.get("ai_summary", ""),
                    "generated_at": datetime.now().isoformat(),
                    "model_version": "v1.0",
                }
            return None
        
        # TODO: Implement actual Databricks query
        return None
    
    async def get_next_best_action(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get next best action for customer"""
        if self.use_mock_data:
            return MOCK_NEXT_ACTIONS.get(customer_id)
        
        # TODO: Implement actual Databricks query
        return None
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        if self.use_mock_data:
            return MOCK_STATS
        
        # TODO: Implement actual Databricks query
        return MOCK_STATS
    
    async def get_hourly_trends(self) -> List[Dict[str, Any]]:
        """Get hourly call trends (last 24 hours)"""
        if self.use_mock_data:
            return MOCK_HOURLY_TRENDS
        
        # TODO: Implement actual Databricks query
        return MOCK_HOURLY_TRENDS
    
    async def get_daily_trends(self) -> List[Dict[str, Any]]:
        """Get daily call trends (last 30 days)"""
        if self.use_mock_data:
            return MOCK_DAILY_TRENDS
        
        # TODO: Implement actual Databricks query
        return MOCK_DAILY_TRENDS
    
    async def get_technician_visits(self) -> List[Dict[str, Any]]:
        """Get technician visits with coordinates"""
        if self.use_mock_data:
            return MOCK_VISITS
        
        # TODO: Implement actual Databricks query
        return MOCK_VISITS

