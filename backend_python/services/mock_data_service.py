from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# Mock Customers Data
MOCK_CUSTOMERS = [
    {
        "customer_id": "CUST001",
        "name": "John Smith",
        "email": "john.smith@email.com",
        "phone": "+1234567890",
        "status": "normal",
        "main_category": "refrigerator",
        "ai_summary": "Customer has active refrigerator cooling issue. Recent installation completed successfully. Multiple support interactions via phone and WhatsApp. Requires follow-up call to ensure satisfaction with repair service.",
        "updated_at": datetime.now().isoformat(),
    },
    {
        "customer_id": "CUST002",
        "name": "Sarah Johnson",
        "email": "sarah.j@email.com",
        "phone": "+1234567891",
        "status": "urgent",
        "main_category": "washing machine",
        "ai_summary": "Urgent case with washing machine leak. Multiple channels used: phone call, email complaint, and Facebook message. Technician visit currently underway. Customer appears frustrated but appreciative of response speed.",
        "updated_at": datetime.now().isoformat(),
    },
    {
        "customer_id": "CUST003",
        "name": "Michael Brown",
        "email": "m.brown@email.com",
        "phone": "+1234567892",
        "status": "low",
        "main_category": "washing machine",
        "ai_summary": "Low priority customer with product inquiries. Minimal support interactions. Recent website visit showing interest in washers. Good candidate for product recommendations.",
        "updated_at": datetime.now().isoformat(),
    },
    {
        "customer_id": "CUST004",
        "name": "Emily Davis",
        "email": "emily.davis@email.com",
        "phone": "+1234567893",
        "status": "normal",
        "main_category": "oven",
        "ai_summary": "Normal status customer with oven heating issue. Scheduled installation upcoming. Positive service review received. Active engagement across multiple channels.",
        "updated_at": datetime.now().isoformat(),
    },
    {
        "customer_id": "CUST005",
        "name": "David Wilson",
        "email": "d.wilson@email.com",
        "phone": "+1234567894",
        "status": "urgent",
        "main_category": "dishwasher",
        "ai_summary": "Urgent case with dishwasher noise complaint. Recent WhatsApp message expressing urgency. Technician visit planned for today. Requires immediate attention.",
        "updated_at": datetime.now().isoformat(),
    },
]

# Mock Journey Data
MOCK_JOURNEY = {
    "CUST001": [
        {
            "event_type": "call",
            "event_id": "CALL001",
            "event_title": "Call",
            "event_time": (datetime.now() - timedelta(hours=2)).isoformat(),
            "description": "Refrigerator not cooling",
            "call_duration": 450,
            "call_type": "inbound",
            "status": "open",
            "color": "blue",
            "shape": "circle",
        },
        {
            "event_type": "installation",
            "event_id": "INST001",
            "event_title": "Installation",
            "event_time": datetime(2024, 1, 15, 10, 0, 0).isoformat(),
            "description": "Installation of Smart Refrigerator",
            "status": "completed",
            "color": "green",
            "shape": "square",
        },
        {
            "event_type": "digital",
            "event_id": "DIG001",
            "event_title": "Digital Interaction - WhatsApp",
            "event_time": (datetime.now() - timedelta(days=3)).isoformat(),
            "description": "Hi, I need help with my refrigerator",
            "channel": "WhatsApp",
            "status": "neutral",
            "color": "pink",
            "shape": "star",
        },
    ],
    "CUST002": [
        {
            "event_type": "call",
            "event_id": "CALL002",
            "event_title": "Call",
            "event_time": (datetime.now() - timedelta(hours=5)).isoformat(),
            "description": "Washing machine leaking",
            "call_duration": 600,
            "call_type": "inbound",
            "status": "escalated",
            "color": "blue",
            "shape": "circle",
        },
        {
            "event_type": "visit",
            "event_id": "VISIT002",
            "event_title": "Technician Visit - repair",
            "event_time": datetime.now().isoformat(),
            "description": "repair by Lisa Martinez",
            "call_type": "underway",
            "status": "underway",
            "color": "orange",
            "shape": "triangle",
        },
    ],
    "CUST003": [],
    "CUST004": [],
    "CUST005": [],
}

# Mock Stats
MOCK_STATS = {
    "open_calls": 3,
    "low_customers": 1,
    "normal_customers": 2,
    "urgent_customers": 2,
}

# Mock Hourly Trends
MOCK_HOURLY_TRENDS = [
    {"hour": i, "call_count": (i % 5) + 2} for i in range(24)
]

# Mock Daily Trends
MOCK_DAILY_TRENDS = [
    {
        "date": (datetime.now() - timedelta(days=29-i)).date().isoformat(),
        "call_count": (i % 10) + 5,
    }
    for i in range(30)
]

# Mock Visits
MOCK_VISITS = [
    {
        "visit_id": "VISIT002",
        "customer_id": "CUST002",
        "customer_name": "Sarah Johnson",
        "address": "456 Oak Ave, Los Angeles",
        "technician_id": "TECH002",
        "technician_name": "Lisa Martinez",
        "visit_date": datetime.now().isoformat(),
        "visit_status": "underway",
        "visit_purpose": "repair",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "estimated_duration": 90,
    },
    {
        "visit_id": "VISIT004",
        "customer_id": "CUST005",
        "customer_name": "David Wilson",
        "address": "654 Maple Dr, Phoenix",
        "technician_id": "TECH001",
        "technician_name": "Mike Anderson",
        "visit_date": (datetime.now() + timedelta(hours=3)).isoformat(),
        "visit_status": "planned",
        "visit_purpose": "repair",
        "latitude": 33.4484,
        "longitude": -112.0740,
        "estimated_duration": 75,
    },
]

# Mock Next Best Actions
MOCK_NEXT_ACTIONS = {
    "CUST001": {
        "action_type": "follow_up",
        "action_description": "Schedule follow-up call to confirm refrigerator repair satisfaction",
        "priority": "medium",
        "recommended_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "status": "pending",
    },
    "CUST002": {
        "action_type": "visit",
        "action_description": "Monitor ongoing technician visit for washing machine repair",
        "priority": "high",
        "recommended_date": datetime.now().isoformat(),
        "status": "in_progress",
    },
    "CUST003": {
        "action_type": "offer",
        "action_description": "Send product recommendation email for washers based on website visit",
        "priority": "low",
        "recommended_date": (datetime.now() + timedelta(days=2)).isoformat(),
        "status": "pending",
    },
    "CUST004": {
        "action_type": "call",
        "action_description": "Confirm upcoming installation appointment details",
        "priority": "medium",
        "recommended_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "status": "pending",
    },
    "CUST005": {
        "action_type": "visit",
        "action_description": "Ensure technician arrives on time for urgent dishwasher repair",
        "priority": "high",
        "recommended_date": (datetime.now() + timedelta(hours=3)).isoformat(),
        "status": "pending",
    },
}

