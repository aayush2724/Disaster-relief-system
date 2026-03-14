-- ============================================================
-- DISASTER RELIEF COORDINATION SYSTEM - MySQL Schema
-- ============================================================
-- Run this file once to set up the entire database.
-- Tables are dropped in reverse dependency order to avoid FK errors.
-- ============================================================

CREATE DATABASE IF NOT EXISTS disaster_relief;
USE disaster_relief;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS supply_transfers;
DROP TABLE IF EXISTS supply_requests;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS dispatch_logs;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS affected_zones;
DROP TABLE IF EXISTS disasters;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- Stores all system users with role-based access control.
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','ngo','volunteer','agency') NOT NULL DEFAULT 'volunteer',
  phone         VARCHAR(20),
  location      VARCHAR(150),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DISASTERS
-- Each record represents an active or past disaster event.
-- ============================================================
CREATE TABLE disasters (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  type        ENUM('flood','earthquake','fire','cyclone','tsunami','landslide','epidemic') NOT NULL,
  severity    ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  description TEXT,
  location    VARCHAR(200),
  lat         DECIMAL(10,7),
  lng         DECIMAL(10,7),
  status      ENUM('active','contained','closed') DEFAULT 'active',
  created_by  INT,
  started_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_severity (severity)
);

-- ============================================================
-- AFFECTED ZONES
-- Sub-areas within a disaster that need targeted relief.
-- ============================================================
CREATE TABLE affected_zones (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id         INT NOT NULL,
  zone_name           VARCHAR(150) NOT NULL,
  population_affected INT DEFAULT 0,
  severity            ENUM('low','medium','high','critical') DEFAULT 'medium',
  lat                 DECIMAL(10,7),
  lng                 DECIMAL(10,7),
  access_status       ENUM('accessible','limited','blocked') DEFAULT 'accessible',
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  INDEX idx_disaster (disaster_id)
);

-- ============================================================
-- VOLUNTEERS
-- Extended profile for users with volunteer role.
-- ============================================================
CREATE TABLE volunteers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  skills           JSON,
  availability     BOOLEAN DEFAULT TRUE,
  assigned_zone_id INT,
  status           ENUM('idle','dispatched','on-site','returned') DEFAULT 'idle',
  experience_years INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_zone_id) REFERENCES affected_zones(id) ON DELETE SET NULL
);

-- ============================================================
-- DISPATCH LOGS
-- Tracks every volunteer dispatch and return event.
-- ============================================================
CREATE TABLE dispatch_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id  INT NOT NULL,
  zone_id       INT NOT NULL,
  dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  returned_at   TIMESTAMP NULL,
  dispatched_by INT,
  notes         TEXT,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES affected_zones(id) ON DELETE CASCADE,
  FOREIGN KEY (dispatched_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- WAREHOUSES
-- Physical relief depots that hold resources.
-- ============================================================
CREATE TABLE warehouses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  location   VARCHAR(200),
  lat        DECIMAL(10,7),
  lng        DECIMAL(10,7),
  managed_by INT,
  capacity   INT DEFAULT 1000,
  is_active  BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (managed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- RESOURCES
-- Master list of relief resource types.
-- ============================================================
CREATE TABLE resources (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  category ENUM('food','medicine','shelter','rescue_equipment','water','clothing','other') NOT NULL,
  unit     VARCHAR(30) NOT NULL
);

-- ============================================================
-- INVENTORY
-- Current stock of each resource at each warehouse.
-- ============================================================
CREATE TABLE inventory (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  resource_id  INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_resource_warehouse (resource_id, warehouse_id),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- ============================================================
-- SUPPLY REQUESTS
-- Zones request specific resources from the system.
-- ============================================================
CREATE TABLE supply_requests (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  zone_id            INT NOT NULL,
  resource_id        INT NOT NULL,
  quantity_requested INT NOT NULL,
  quantity_fulfilled INT DEFAULT 0,
  priority           ENUM('low','medium','high','urgent') DEFAULT 'medium',
  status             ENUM('pending','partial','fulfilled','cancelled') DEFAULT 'pending',
  requested_by       INT,
  requested_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES affected_zones(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status)
);

-- ============================================================
-- SUPPLY TRANSFERS
-- Records actual physical transfers from warehouse to zone.
-- ============================================================
CREATE TABLE supply_transfers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id   INT NOT NULL,
  zone_id        INT NOT NULL,
  resource_id    INT NOT NULL,
  request_id     INT,
  quantity       INT NOT NULL,
  transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  authorized_by  INT,
  notes          TEXT,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES affected_zones(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES supply_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (authorized_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- REPORTS
-- Field reports submitted by volunteers or NGOs from zones.
-- ============================================================
CREATE TABLE reports (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  zone_id               INT NOT NULL,
  submitted_by          INT,
  casualties            INT DEFAULT 0,
  injuries              INT DEFAULT 0,
  missing               INT DEFAULT 0,
  infrastructure_damage TEXT,
  medical_needs         TEXT,
  additional_notes      TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES affected_zones(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ANNOUNCEMENTS
-- Broadcast messages tied to a disaster.
-- ============================================================
CREATE TABLE announcements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  disaster_id INT NOT NULL,
  posted_by   INT,
  title       VARCHAR(200),
  message     TEXT NOT NULL,
  severity    ENUM('info','warning','critical') DEFAULT 'info',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_id) REFERENCES disasters(id) ON DELETE CASCADE,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- AUDIT LOGS
-- Every sensitive action is logged here automatically.
-- ============================================================
CREATE TABLE audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id  INT,
  details    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TRIGGER: Auto-update supply_request status after a transfer
-- ============================================================
DELIMITER $$

CREATE TRIGGER after_supply_transfer_insert
AFTER INSERT ON supply_transfers
FOR EACH ROW
BEGIN
  IF NEW.request_id IS NOT NULL THEN
    UPDATE supply_requests
    SET quantity_fulfilled = quantity_fulfilled + NEW.quantity,
        status = CASE
          WHEN (quantity_fulfilled + NEW.quantity) >= quantity_requested THEN 'fulfilled'
          WHEN (quantity_fulfilled + NEW.quantity) > 0 THEN 'partial'
          ELSE 'pending'
        END
    WHERE id = NEW.request_id;
  END IF;
END$$

-- ============================================================
-- TRIGGER: Deduct inventory after a supply transfer
-- ============================================================
CREATE TRIGGER after_supply_transfer_deduct_inventory
AFTER INSERT ON supply_transfers
FOR EACH ROW
BEGIN
  UPDATE inventory
  SET quantity = quantity - NEW.quantity
  WHERE resource_id = NEW.resource_id AND warehouse_id = NEW.warehouse_id;
END$$

-- ============================================================
-- STORED PROCEDURE: Dispatch a volunteer to a zone
-- ============================================================
CREATE PROCEDURE dispatch_volunteer(
  IN p_volunteer_id INT,
  IN p_zone_id INT,
  IN p_dispatched_by INT,
  IN p_notes TEXT
)
BEGIN
  UPDATE volunteers
  SET status = 'dispatched', assigned_zone_id = p_zone_id, availability = FALSE
  WHERE id = p_volunteer_id;

  INSERT INTO dispatch_logs (volunteer_id, zone_id, dispatched_by, notes)
  VALUES (p_volunteer_id, p_zone_id, p_dispatched_by, p_notes);
END$$

-- ============================================================
-- STORED PROCEDURE: Return a volunteer from a zone
-- ============================================================
CREATE PROCEDURE return_volunteer(IN p_volunteer_id INT)
BEGIN
  UPDATE volunteers
  SET status = 'returned', assigned_zone_id = NULL, availability = TRUE
  WHERE id = p_volunteer_id;

  UPDATE dispatch_logs
  SET returned_at = NOW()
  WHERE volunteer_id = p_volunteer_id AND returned_at IS NULL
  ORDER BY dispatched_at DESC
  LIMIT 1;
END$$

DELIMITER ;

-- ============================================================
-- VIEW: Active disaster summary (used by dashboard)
-- ============================================================
CREATE OR REPLACE VIEW active_disaster_summary AS
SELECT
  d.id,
  d.title,
  d.type,
  d.severity,
  d.status,
  d.location,
  d.started_at,
  COUNT(DISTINCT az.id)        AS total_zones,
  SUM(az.population_affected)  AS total_affected,
  COUNT(DISTINCT v.id)         AS volunteers_deployed
FROM disasters d
LEFT JOIN affected_zones az ON az.disaster_id = d.id
LEFT JOIN volunteers v ON v.assigned_zone_id = az.id AND v.status IN ('dispatched','on-site')
WHERE d.status = 'active'
GROUP BY d.id;

-- ============================================================
-- VIEW: Zone resource fulfillment status
-- ============================================================
CREATE OR REPLACE VIEW zone_resource_status AS
SELECT
  az.id          AS zone_id,
  az.zone_name,
  d.title        AS disaster_name,
  r.name         AS resource_name,
  sr.quantity_requested,
  sr.quantity_fulfilled,
  sr.status      AS fulfillment_status,
  sr.priority
FROM supply_requests sr
JOIN affected_zones az ON az.id = sr.zone_id
JOIN disasters d ON d.id = az.disaster_id
JOIN resources r ON r.id = sr.resource_id;
