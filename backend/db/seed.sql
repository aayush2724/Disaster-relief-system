-- ============================================================
-- SEED DATA - Run after schema.sql
-- Populates all tables with realistic sample data for testing.
-- Default password for all users: Password123
-- ============================================================

USE disaster_relief;

INSERT INTO users (name, email, password_hash, role, phone, location) VALUES
('Admin User',    'admin@relief.org',    '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'admin',     '+91-9000000001', 'New Delhi'),
('Red Cross NGO', 'ngo@redcross.org',    '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'ngo',       '+91-9000000002', 'Mumbai'),
('NDRF Agency',   'agency@ndrf.gov.in',  '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'agency',    '+91-9000000003', 'Kolkata'),
('Arjun Mehta',   'arjun@volunteer.org', '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'volunteer', '+91-9000000004', 'Chennai'),
('Priya Singh',   'priya@volunteer.org', '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'volunteer', '+91-9000000005', 'Hyderabad'),
('Ravi Kumar',    'ravi@volunteer.org',  '$2b$10$KIX8QWlvtLCBp.GH5YjNLeQkrmjYH8bF1hHMkCK5JN6WLnqm/Gpim', 'volunteer', '+91-9000000006', 'Bengaluru');

INSERT INTO disasters (title, type, severity, description, location, lat, lng, status, created_by) VALUES
('Kerala Flood 2024',       'flood',      'critical', 'Heavy monsoon floods across multiple districts', 'Kerala, India',  10.8505, 76.2711, 'active',    1),
('Gujarat Earthquake',      'earthquake', 'high',     '6.2 magnitude earthquake near Bhuj region',      'Gujarat, India', 23.2156, 69.6669, 'active',    3),
('Odisha Cyclone Warning',  'cyclone',    'high',     'Cyclone approaching eastern coastline',          'Odisha, India',  20.9517, 85.0985, 'contained', 1);

INSERT INTO affected_zones (disaster_id, zone_name, population_affected, severity, access_status, notes) VALUES
(1, 'Wayanad District',     45000, 'critical', 'limited',    'Roads partially submerged'),
(1, 'Thrissur City',        28000, 'high',     'accessible', 'Relief camps operational'),
(1, 'Alappuzha Backwaters', 12000, 'medium',   'blocked',    'Boat access only'),
(2, 'Bhuj Town Center',     31000, 'high',     'accessible', 'Structural damage to buildings'),
(2, 'Anjar Village',         8500, 'critical', 'limited',    'Road to village damaged');

INSERT INTO volunteers (user_id, skills, availability, status, experience_years) VALUES
(4, '["medical","first_aid","search_rescue"]',  TRUE, 'idle', 3),
(5, '["logistics","communications","driving"]', TRUE, 'idle', 5),
(6, '["search_rescue","heavy_lifting"]',        TRUE, 'idle', 2);

INSERT INTO resources (name, category, unit) VALUES
('Rice (50kg bag)',        'food',             'bags'),
('Drinking Water (20L)',   'water',            'cans'),
('First Aid Kit',          'medicine',         'kits'),
('Emergency Medicine',     'medicine',         'units'),
('Tent (4-person)',         'shelter',          'units'),
('Blanket',                'shelter',          'units'),
('Rescue Boat',            'rescue_equipment', 'units'),
('Life Jacket',            'rescue_equipment', 'units');

INSERT INTO warehouses (name, location, lat, lng, managed_by, capacity) VALUES
('Mumbai Central Depot', 'Mumbai, Maharashtra',  19.0760, 72.8777, 2, 5000),
('Kolkata Relief Hub',   'Kolkata, West Bengal', 22.5726, 88.3639, 3, 3000),
('Chennai Supply Base',  'Chennai, Tamil Nadu',  13.0827, 80.2707, 1, 4000);

INSERT INTO inventory (resource_id, warehouse_id, quantity) VALUES
(1,1,500),(2,1,1200),(3,1,300),(4,1,800),(5,1,150),(6,1,600),(7,1,25),(8,1,200),
(1,2,300),(2,2,800),(3,2,200),(5,2,100),
(1,3,400),(2,3,900),(4,3,500),(6,3,400);

INSERT INTO supply_requests (zone_id, resource_id, quantity_requested, quantity_fulfilled, priority, status, requested_by) VALUES
(1,1,200,50, 'urgent','partial',  2),
(1,2,500,200,'urgent','partial',  2),
(1,7,10, 0,  'urgent','pending',  2),
(2,3,100,100,'high',  'fulfilled',2),
(3,8,50, 0,  'urgent','pending',  3),
(4,3,150,50, 'high',  'partial',  3),
(5,5,80, 0,  'urgent','pending',  3);

INSERT INTO announcements (disaster_id, posted_by, title, message, severity) VALUES
(1,1,'Evacuation Order - Wayanad',   'All residents in low-lying areas must evacuate immediately. Relief camps at Kalpetta Government School.','critical'),
(1,2,'Food Distribution Update',     'Red Cross distributing meals at Thrissur relief camp. Three meals per day assured.','info'),
(2,3,'Search & Rescue Ongoing',      'NDRF teams conducting search and rescue in Bhuj. Residents stay clear of damaged structures.','warning'),
(3,1,'Cyclone Status Update',        'Cyclone has weakened to Category 2. Coastal communities remain on alert.','warning');

INSERT INTO reports (zone_id, submitted_by, casualties, injuries, missing, infrastructure_damage, medical_needs) VALUES
(1,4,12,45,8, 'Major roads flooded, 3 bridges damaged, 200+ homes submerged','Insulin, BP medication, pediatric supplies urgently needed'),
(2,5,0, 23,0, 'Buildings cracked, electricity down in east sector',           'Basic first aid, antiseptics'),
(4,6,8, 67,15,'Entire block collapsed near main market, gas lines ruptured',  'Emergency surgery team needed, blood supply critical');
