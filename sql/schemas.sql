-- Customer Journey Visualization App - Database Schema
-- For Databricks SQL Warehouse

-- Customers Master Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id STRING PRIMARY KEY,
    name STRING NOT NULL,
    email STRING,
    phone STRING,
    address STRING,
    city STRING,
    status STRING NOT NULL, -- 'low', 'normal', 'urgent'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- Customer Calls Table
CREATE TABLE IF NOT EXISTS customer_calls (
    call_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    call_timestamp TIMESTAMP NOT NULL,
    call_duration INT, -- in seconds
    issue_description STRING,
    call_type STRING, -- 'inbound', 'outbound'
    resolution_status STRING, -- 'open', 'resolved', 'escalated'
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Installations Table
CREATE TABLE IF NOT EXISTS installations (
    installation_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    installation_date TIMESTAMP NOT NULL,
    product_id STRING,
    product_name STRING,
    technician_id STRING,
    status STRING, -- 'scheduled', 'in_progress', 'completed'
    notes STRING,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Technician Visits Table
CREATE TABLE IF NOT EXISTS technician_visits (
    visit_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    technician_id STRING NOT NULL,
    technician_name STRING,
    visit_date TIMESTAMP NOT NULL,
    visit_status STRING NOT NULL, -- 'planned', 'underway', 'completed'
    visit_purpose STRING, -- 'repair', 'maintenance', 'installation', 'inspection'
    latitude DOUBLE,
    longitude DOUBLE,
    estimated_duration INT, -- in minutes
    actual_duration INT, -- in minutes
    notes STRING,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Website Visits Table
CREATE TABLE IF NOT EXISTS website_visits (
    visit_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    visit_timestamp TIMESTAMP NOT NULL,
    page_visited STRING,
    duration INT, -- in seconds
    device_type STRING, -- 'desktop', 'mobile', 'tablet'
    referrer STRING,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Digital Channel Interactions Table
CREATE TABLE IF NOT EXISTS digital_interactions (
    interaction_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    interaction_timestamp TIMESTAMP NOT NULL,
    channel STRING NOT NULL, -- 'WhatsApp', 'Facebook', 'Email'
    message_content STRING,
    interaction_type STRING, -- 'message', 'complaint', 'inquiry', 'review'
    sentiment STRING, -- 'positive', 'neutral', 'negative'
    response_required BOOLEAN,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Customer AI Summaries Table
CREATE TABLE IF NOT EXISTS customer_summaries (
    customer_id STRING PRIMARY KEY,
    summary_text STRING NOT NULL,
    generated_at TIMESTAMP,
    model_version STRING,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Next Best Actions Table
CREATE TABLE IF NOT EXISTS next_best_actions (
    action_id STRING PRIMARY KEY,
    customer_id STRING NOT NULL,
    action_type STRING NOT NULL, -- 'call', 'visit', 'follow_up', 'offer'
    action_description STRING NOT NULL,
    priority STRING, -- 'low', 'medium', 'high'
    recommended_date TIMESTAMP,
    status STRING, -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) USING DELTA;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_customer ON customer_calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON customer_calls(call_timestamp);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON technician_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON technician_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON technician_visits(visit_status);
CREATE INDEX IF NOT EXISTS idx_website_customer ON website_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_digital_customer ON digital_interactions(customer_id);

-- Insert Sample Data

-- Sample Customers
INSERT INTO customers VALUES
('CUST001', 'John Smith', 'john.smith@email.com', '+1234567890', '123 Main St', 'New York', 'normal', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('CUST002', 'Sarah Johnson', 'sarah.j@email.com', '+1234567891', '456 Oak Ave', 'Los Angeles', 'urgent', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('CUST003', 'Michael Brown', 'm.brown@email.com', '+1234567892', '789 Pine Rd', 'Chicago', 'low', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('CUST004', 'Emily Davis', 'emily.davis@email.com', '+1234567893', '321 Elm St', 'Houston', 'normal', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
('CUST005', 'David Wilson', 'd.wilson@email.com', '+1234567894', '654 Maple Dr', 'Phoenix', 'urgent', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Sample Customer Calls
INSERT INTO customer_calls VALUES
('CALL001', 'CUST001', CURRENT_TIMESTAMP() - INTERVAL 2 HOUR, 450, 'Refrigerator not cooling', 'inbound', 'open'),
('CALL002', 'CUST002', CURRENT_TIMESTAMP() - INTERVAL 5 HOUR, 600, 'Washing machine leaking', 'inbound', 'escalated'),
('CALL003', 'CUST001', CURRENT_TIMESTAMP() - INTERVAL 1 DAY, 300, 'Follow up on repair', 'outbound', 'resolved'),
('CALL004', 'CUST003', CURRENT_TIMESTAMP() - INTERVAL 3 HOUR, 180, 'Product inquiry', 'inbound', 'resolved'),
('CALL005', 'CUST004', CURRENT_TIMESTAMP() - INTERVAL 12 HOUR, 720, 'Oven not heating properly', 'inbound', 'open'),
('CALL006', 'CUST005', CURRENT_TIMESTAMP() - INTERVAL 30 MINUTE, 240, 'Dishwasher making noise', 'inbound', 'open');

-- Sample Installations
INSERT INTO installations VALUES
('INST001', 'CUST001', TIMESTAMP '2024-01-15 10:00:00', 'PROD001', 'Smart Refrigerator', 'TECH001', 'completed', 'Installation successful'),
('INST002', 'CUST002', CURRENT_TIMESTAMP() - INTERVAL 3 DAY, 'PROD002', 'Front Load Washer', 'TECH002', 'completed', 'Installation completed with minor adjustments'),
('INST003', 'CUST004', CURRENT_TIMESTAMP() + INTERVAL 2 DAY, 'PROD003', 'Gas Range', 'TECH001', 'scheduled', 'Scheduled installation');

-- Sample Technician Visits
INSERT INTO technician_visits VALUES
('VISIT001', 'CUST001', 'TECH001', 'Mike Anderson', CURRENT_TIMESTAMP() - INTERVAL 2 DAY, 'completed', 'repair', 40.7128, -74.0060, 60, 55, 'Fixed cooling issue'),
('VISIT002', 'CUST002', 'TECH002', 'Lisa Martinez', CURRENT_TIMESTAMP(), 'underway', 'repair', 34.0522, -118.2437, 90, NULL, 'Repairing leak'),
('VISIT003', 'CUST004', 'TECH003', 'James Taylor', CURRENT_TIMESTAMP() + INTERVAL 1 DAY, 'planned', 'inspection', 29.7604, -95.3698, 45, NULL, 'Scheduled inspection'),
('VISIT004', 'CUST005', 'TECH001', 'Mike Anderson', CURRENT_TIMESTAMP() + INTERVAL 3 HOUR, 'planned', 'repair', 33.4484, -112.0740, 75, NULL, 'Noise diagnosis needed'),
('VISIT005', 'CUST003', 'TECH002', 'Lisa Martinez', CURRENT_TIMESTAMP() + INTERVAL 6 HOUR, 'planned', 'maintenance', 41.8781, -87.6298, 30, NULL, 'Routine maintenance');

-- Sample Website Visits
INSERT INTO website_visits VALUES
('WEB001', 'CUST001', CURRENT_TIMESTAMP() - INTERVAL 1 DAY, '/products/refrigerators', 120, 'desktop', 'google.com'),
('WEB002', 'CUST001', CURRENT_TIMESTAMP() - INTERVAL 8 HOUR, '/support/troubleshooting', 180, 'mobile', 'internal'),
('WEB003', 'CUST002', CURRENT_TIMESTAMP() - INTERVAL 4 HOUR, '/support/contact', 90, 'desktop', 'internal'),
('WEB004', 'CUST003', CURRENT_TIMESTAMP() - INTERVAL 2 DAY, '/products/washers', 240, 'tablet', 'facebook.com'),
('WEB005', 'CUST004', CURRENT_TIMESTAMP() - INTERVAL 6 HOUR, '/support/repairs', 150, 'mobile', 'google.com');

-- Sample Digital Interactions
INSERT INTO digital_interactions VALUES
('DIG001', 'CUST001', CURRENT_TIMESTAMP() - INTERVAL 3 DAY, 'WhatsApp', 'Hi, I need help with my refrigerator', 'inquiry', 'neutral', true),
('DIG002', 'CUST002', CURRENT_TIMESTAMP() - INTERVAL 1 DAY, 'Email', 'Complaint about washing machine leak', 'complaint', 'negative', true),
('DIG003', 'CUST002', CURRENT_TIMESTAMP() - INTERVAL 12 HOUR, 'Facebook', 'Thank you for quick response!', 'message', 'positive', false),
('DIG004', 'CUST003', CURRENT_TIMESTAMP() - INTERVAL 5 DAY, 'WhatsApp', 'Product information request', 'inquiry', 'neutral', true),
('DIG005', 'CUST004', '2024-01-15 10:30:00', 'Email', 'Review of service quality', 'review', 'positive', false),
('DIG006', 'CUST005', CURRENT_TIMESTAMP() - INTERVAL 2 HOUR, 'WhatsApp', 'Urgent: dishwasher issue', 'complaint', 'negative', true);

-- Sample Customer Summaries
INSERT INTO customer_summaries VALUES
('CUST001', 'Customer has active refrigerator cooling issue. Recent installation completed successfully. Multiple support interactions via phone and WhatsApp. Requires follow-up call to ensure satisfaction with repair service.', CURRENT_TIMESTAMP(), 'v1.0'),
('CUST002', 'Urgent case with washing machine leak. Multiple channels used: phone call, email complaint, and Facebook message. Technician visit currently underway. Customer appears frustrated but appreciative of response speed.', CURRENT_TIMESTAMP(), 'v1.0'),
('CUST003', 'Low priority customer with product inquiries. Minimal support interactions. Recent website visit showing interest in washers. Good candidate for product recommendations.', CURRENT_TIMESTAMP(), 'v1.0'),
('CUST004', 'Normal status customer with oven heating issue. Scheduled installation upcoming. Positive service review received. Active engagement across multiple channels.', CURRENT_TIMESTAMP(), 'v1.0'),
('CUST005', 'Urgent case with dishwasher noise complaint. Recent WhatsApp message expressing urgency. Technician visit planned for today. Requires immediate attention.', CURRENT_TIMESTAMP(), 'v1.0');

-- Sample Next Best Actions
INSERT INTO next_best_actions VALUES
('ACTION001', 'CUST001', 'follow_up', 'Schedule follow-up call to confirm refrigerator repair satisfaction', 'medium', CURRENT_TIMESTAMP() + INTERVAL 1 DAY, 'pending', CURRENT_TIMESTAMP()),
('ACTION002', 'CUST002', 'visit', 'Monitor ongoing technician visit for washing machine repair', 'high', CURRENT_TIMESTAMP(), 'in_progress', CURRENT_TIMESTAMP()),
('ACTION003', 'CUST003', 'offer', 'Send product recommendation email for washers based on website visit', 'low', CURRENT_TIMESTAMP() + INTERVAL 2 DAY, 'pending', CURRENT_TIMESTAMP()),
('ACTION004', 'CUST004', 'call', 'Confirm upcoming installation appointment details', 'medium', CURRENT_TIMESTAMP() + INTERVAL 1 DAY, 'pending', CURRENT_TIMESTAMP()),
('ACTION005', 'CUST005', 'visit', 'Ensure technician arrives on time for urgent dishwasher repair', 'high', CURRENT_TIMESTAMP() + INTERVAL 3 HOUR, 'pending', CURRENT_TIMESTAMP());

