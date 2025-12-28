import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from databricks import sql
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
        self.connection = None
        if self.use_mock_data:
            print("Using mock data mode - configure DATABRICKS_SERVER_HOSTNAME to connect to Databricks")
        else:
            self._init_connection()
    
    def _init_connection(self):
        """Initialize Databricks SQL connection"""
        try:
            server_hostname = os.getenv("DATABRICKS_SERVER_HOSTNAME")
            http_path = os.getenv("DATABRICKS_HTTP_PATH")
            access_token = os.getenv("DATABRICKS_TOKEN")
            catalog = os.getenv("DATABRICKS_CATALOG", "default")
            schema = os.getenv("DATABRICKS_SCHEMA", "default")
            
            self.connection = sql.connect(
                server_hostname=server_hostname,
                http_path=http_path,
                access_token=access_token,
                catalog=catalog,
                schema=schema
            )
        except Exception as e:
            print(f"Warning: Failed to initialize Databricks connection: {e}")
            print("Falling back to mock data mode")
            self.use_mock_data = True
    
    def _get_connection(self):
        """Get or create Databricks connection"""
        if self.use_mock_data:
            return None
        if self.connection is None:
            self._init_connection()
        return self.connection
    
    def _execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Execute a SQL query and return results as list of dictionaries"""
        if self.use_mock_data:
            return []
        
        conn = self._get_connection()
        if conn is None:
            return []
        
        try:
            cursor = conn.cursor()
            # For Databricks SQL, replace ? placeholders with parameter values
            # Since these are simple string IDs from URL paths, using f-strings is acceptable
            # For production with user input, use proper parameterized queries
            if params and "?" in query:
                # Simple parameter substitution for single parameter queries
                # Escape single quotes in string parameters
                param_value = list(params.values())[0]
                if isinstance(param_value, str):
                    escaped_value = param_value.replace("'", "''")
                    final_query = query.replace("?", f"'{escaped_value}'", 1)
                else:
                    final_query = query.replace("?", str(param_value), 1)
                cursor.execute(final_query)
            else:
                cursor.execute(query)
            
            # Get column names
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            
            # Fetch all rows and convert to list of dictionaries
            rows = cursor.fetchall()
            results = []
            for row in rows:
                row_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert datetime objects to ISO format strings
                    if isinstance(value, datetime):
                        value = value.isoformat()
                    elif isinstance(value, (int, float)) and col in ['latitude', 'longitude']:
                        value = float(value) if value is not None else None
                    row_dict[col] = value
                results.append(row_dict)
            
            cursor.close()
            return results
        except Exception as e:
            print(f"Error executing query: {e}")
            raise
    
    async def get_all_customers(self) -> List[Dict[str, Any]]:
        """Get all customers with summaries"""
        if self.use_mock_data:
            return MOCK_CUSTOMERS
        
        query = """
        SELECT 
            c.customer_id,
            c.name,
            c.email,
            c.phone,
            c.status,
            c.main_category,
            c.updated_at,
            COALESCE(cs.summary_text, '') as ai_summary
        FROM customers c
        LEFT JOIN customer_summaries cs ON c.customer_id = cs.customer_id
        ORDER BY c.customer_id
        """
        
        results = self._execute_query(query)
        
        # Convert to match mock data format
        customers = []
        for row in results:
            customer = {
                "customer_id": row["customer_id"],
                "name": row["name"],
                "email": row.get("email"),
                "phone": row.get("phone"),
                "status": row["status"],
                "main_category": row.get("main_category"),
                "ai_summary": row.get("ai_summary", ""),
                "updated_at": row.get("updated_at", datetime.now().isoformat())
            }
            customers.append(customer)
        
        return customers
    
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
        
        query = """
        SELECT 
            c.customer_id,
            c.name,
            c.email,
            c.phone,
            c.status,
            c.main_category,
            c.updated_at,
            COALESCE(cs.summary_text, '') as ai_summary,
            cs.generated_at as summary_generated_at
        FROM customers c
        LEFT JOIN customer_summaries cs ON c.customer_id = cs.customer_id
        WHERE c.customer_id = ?
        """
        
        results = self._execute_query(query, {"customer_id": customer_id})
        
        if not results:
            return None
        
        row = results[0]
        return {
            "customer_id": row["customer_id"],
            "name": row["name"],
            "email": row.get("email"),
            "phone": row.get("phone"),
            "status": row["status"],
            "main_category": row.get("main_category"),
            "ai_summary": row.get("ai_summary", ""),
            "updated_at": row.get("updated_at", datetime.now().isoformat()),
            "summary_generated_at": row.get("summary_generated_at", datetime.now().isoformat())
        }
    
    async def get_customer_journey(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get customer journey timeline events"""
        if self.use_mock_data:
            return MOCK_JOURNEY.get(customer_id, [])
        
        events = []
        
        # Get calls
        calls_query = """
        SELECT 
            call_id as event_id,
            call_timestamp as event_time,
            issue_description as description,
            call_duration,
            call_type,
            resolution_status as status
        FROM customer_calls
        WHERE customer_id = ?
        ORDER BY call_timestamp DESC
        """
        calls = self._execute_query(calls_query, {"customer_id": customer_id})
        for call in calls:
            events.append({
                "event_type": "call",
                "event_id": call["event_id"],
                "event_title": "Call",
                "event_time": call["event_time"],
                "description": call.get("description", ""),
                "call_duration": call.get("call_duration"),
                "call_type": call.get("call_type"),
                "status": call.get("status", "open"),
                "color": "blue",
                "shape": "circle"
            })
        
        # Get installations
        installs_query = """
        SELECT 
            installation_id as event_id,
            installation_date as event_time,
            product_name,
            status
        FROM installations
        WHERE customer_id = ?
        ORDER BY installation_date DESC
        """
        installs = self._execute_query(installs_query, {"customer_id": customer_id})
        for inst in installs:
            events.append({
                "event_type": "installation",
                "event_id": inst["event_id"],
                "event_title": "Installation",
                "event_time": inst["event_time"],
                "description": f"Installation of {inst.get('product_name', 'Product')}",
                "status": inst.get("status", "completed"),
                "color": "green",
                "shape": "square"
            })
        
        # Get technician visits
        visits_query = """
        SELECT 
            visit_id as event_id,
            visit_date as event_time,
            technician_name,
            visit_status as status,
            visit_purpose
        FROM technician_visits
        WHERE customer_id = ?
        ORDER BY visit_date DESC
        """
        visits = self._execute_query(visits_query, {"customer_id": customer_id})
        for visit in visits:
            events.append({
                "event_type": "visit",
                "event_id": visit["event_id"],
                "event_title": f"Technician Visit - {visit.get('visit_purpose', 'service')}",
                "event_time": visit["event_time"],
                "description": f"{visit.get('visit_purpose', 'service')} by {visit.get('technician_name', 'Technician')}",
                "status": visit.get("status", "planned"),
                "color": "orange",
                "shape": "triangle"
            })
        
        # Get website visits
        web_query = """
        SELECT 
            visit_id as event_id,
            visit_timestamp as event_time,
            page_visited as description
        FROM website_visits
        WHERE customer_id = ?
        ORDER BY visit_timestamp DESC
        """
        web_visits = self._execute_query(web_query, {"customer_id": customer_id})
        for web in web_visits:
            events.append({
                "event_type": "website",
                "event_id": web["event_id"],
                "event_title": "Website Visit",
                "event_time": web["event_time"],
                "description": web.get("description", "Website visit"),
                "status": "neutral",
                "color": "purple",
                "shape": "diamond"
            })
        
        # Get digital interactions
        digital_query = """
        SELECT 
            interaction_id as event_id,
            interaction_timestamp as event_time,
            channel,
            message_content as description,
            sentiment as status
        FROM digital_interactions
        WHERE customer_id = ?
        ORDER BY interaction_timestamp DESC
        """
        digitals = self._execute_query(digital_query, {"customer_id": customer_id})
        for dig in digitals:
            events.append({
                "event_type": "digital",
                "event_id": dig["event_id"],
                "event_title": f"Digital Interaction - {dig.get('channel', 'Channel')}",
                "event_time": dig["event_time"],
                "description": dig.get("description", ""),
                "channel": dig.get("channel"),
                "status": dig.get("status", "neutral"),
                "color": "pink",
                "shape": "star"
            })
        
        # Sort all events by time (most recent first)
        events.sort(key=lambda x: x.get("event_time", ""), reverse=True)
        
        return events
    
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
        
        query = """
        SELECT 
            summary_text,
            generated_at,
            model_version
        FROM customer_summaries
        WHERE customer_id = ?
        """
        
        results = self._execute_query(query, {"customer_id": customer_id})
        
        if not results:
            return None
        
        row = results[0]
        return {
            "summary_text": row["summary_text"],
            "generated_at": row.get("generated_at", datetime.now().isoformat()),
            "model_version": row.get("model_version", "v1.0")
        }
    
    async def get_next_best_action(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Get next best action for customer"""
        if self.use_mock_data:
            return MOCK_NEXT_ACTIONS.get(customer_id)
        
        query = """
        SELECT 
            action_type,
            action_description,
            priority,
            recommended_date,
            status
        FROM next_best_actions
        WHERE customer_id = ?
          AND status IN ('pending', 'in_progress')
        ORDER BY 
            CASE priority
                WHEN 'high' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'low' THEN 3
            END,
            recommended_date
        LIMIT 1
        """
        
        results = self._execute_query(query, {"customer_id": customer_id})
        
        if not results:
            return None
        
        row = results[0]
        return {
            "action_type": row["action_type"],
            "action_description": row["action_description"],
            "priority": row.get("priority"),
            "recommended_date": row.get("recommended_date"),
            "status": row.get("status", "pending")
        }
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        if self.use_mock_data:
            return MOCK_STATS
        
        # Count open calls
        open_calls_query = """
        SELECT COUNT(*) as open_calls
        FROM customer_calls
        WHERE resolution_status = 'open'
        """
        open_calls_result = self._execute_query(open_calls_query)
        open_calls = open_calls_result[0]["open_calls"] if open_calls_result else 0
        
        # Count customers by status
        status_query = """
        SELECT 
            status,
            COUNT(*) as count
        FROM customers
        GROUP BY status
        """
        status_results = self._execute_query(status_query)
        
        status_counts = {"low": 0, "normal": 0, "urgent": 0}
        for row in status_results:
            status = row["status"].lower()
            if status in status_counts:
                status_counts[status] = row["count"]
        
        return {
            "open_calls": open_calls,
            "low_customers": status_counts["low"],
            "normal_customers": status_counts["normal"],
            "urgent_customers": status_counts["urgent"]
        }
    
    async def get_hourly_trends(self) -> List[Dict[str, Any]]:
        """Get hourly call trends (last 24 hours)"""
        if self.use_mock_data:
            return MOCK_HOURLY_TRENDS
        
        query = """
        SELECT 
            HOUR(call_timestamp) as hour,
            COUNT(*) as call_count
        FROM customer_calls
        WHERE call_timestamp >= CURRENT_TIMESTAMP() - INTERVAL 24 HOUR
        GROUP BY HOUR(call_timestamp)
        ORDER BY hour
        """
        
        results = self._execute_query(query)
        
        # Create a map of hour -> count
        hour_counts = {row["hour"]: row["call_count"] for row in results}
        
        # Fill in all 24 hours (0-23) with counts, defaulting to 0
        trends = []
        for hour in range(24):
            trends.append({
                "hour": hour,
                "call_count": hour_counts.get(hour, 0)
            })
        
        return trends
    
    async def get_daily_trends(self) -> List[Dict[str, Any]]:
        """Get daily call trends (last 30 days)"""
        if self.use_mock_data:
            return MOCK_DAILY_TRENDS
        
        query = """
        SELECT 
            DATE(call_timestamp) as date,
            COUNT(*) as call_count
        FROM customer_calls
        WHERE call_timestamp >= CURRENT_TIMESTAMP() - INTERVAL 30 DAY
        GROUP BY DATE(call_timestamp)
        ORDER BY date
        """
        
        results = self._execute_query(query)
        
        # Convert date objects to ISO format strings
        trends = []
        for row in results:
            date_value = row["date"]
            if isinstance(date_value, datetime):
                date_str = date_value.date().isoformat()
            elif hasattr(date_value, 'isoformat'):
                date_str = date_value.isoformat()
            else:
                date_str = str(date_value)
            
            trends.append({
                "date": date_str,
                "call_count": row["call_count"]
            })
        
        return trends
    
    async def get_technician_visits(self) -> List[Dict[str, Any]]:
        """Get technician visits with coordinates"""
        if self.use_mock_data:
            return MOCK_VISITS
        
        query = """
        SELECT 
            v.visit_id,
            v.customer_id,
            c.name as customer_name,
            c.address,
            v.technician_id,
            v.technician_name,
            v.visit_date,
            v.visit_status,
            v.visit_purpose,
            v.latitude,
            v.longitude,
            v.estimated_duration
        FROM technician_visits v
        JOIN customers c ON v.customer_id = c.customer_id
        WHERE v.visit_status IN ('planned', 'underway')
        ORDER BY v.visit_date
        """
        
        results = self._execute_query(query)
        
        visits = []
        for row in results:
            visit = {
                "visit_id": row["visit_id"],
                "customer_id": row["customer_id"],
                "customer_name": row.get("customer_name"),
                "address": row.get("address"),
                "technician_id": row.get("technician_id"),
                "technician_name": row.get("technician_name"),
                "visit_date": row.get("visit_date"),
                "visit_status": row.get("visit_status"),
                "visit_purpose": row.get("visit_purpose"),
                "latitude": float(row["latitude"]) if row.get("latitude") is not None else None,
                "longitude": float(row["longitude"]) if row.get("longitude") is not None else None,
                "estimated_duration": row.get("estimated_duration")
            }
            visits.append(visit)
        
        return visits

