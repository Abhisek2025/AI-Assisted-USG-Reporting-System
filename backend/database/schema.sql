-- ============================================================================
-- AI-Assisted USG Reporting System — Production MySQL Relational Database Schema
-- Database Engine: MySQL 8.0+ / InnoDB / utf8mb4
-- ============================================================================

CREATE DATABASE IF NOT EXISTS usg_reporting_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE usg_reporting_db;

-- Disable Foreign Key Checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. DIAGNOSTIC CENTERS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS diagnostic_centers;
CREATE TABLE diagnostic_centers (
  center_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(100),
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. ROLES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE, -- 'ADMIN', 'RADIOLOGIST', 'RECEPTIONIST', 'TECHNICIAN'
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  role_id INT NOT NULL,
  diagnostic_center_id INT,
  phone VARCHAR(30),
  qualification VARCHAR(150),
  registration_number VARCHAR(100), -- Medical registration no. for Radiologists
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
  CONSTRAINT fk_users_center FOREIGN KEY (diagnostic_center_id) REFERENCES diagnostic_centers(center_id) ON DELETE SET NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. REFRESH TOKENS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS refresh_tokens;
CREATE TABLE refresh_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ref_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_refresh_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. PATIENTS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS patients;
CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  uhid VARCHAR(50) NOT NULL UNIQUE, -- e.g. PAT-2026-000001
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
  date_of_birth DATE,
  age INT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(120),
  address TEXT,
  blood_group VARCHAR(10),
  referring_doctor VARCHAR(120),
  medical_history TEXT,
  allergies TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_patients_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_patients_uhid (uhid),
  INDEX idx_patients_phone (phone),
  INDEX idx_patients_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. STUDIES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS studies;
CREATE TABLE studies (
  study_id INT AUTO_INCREMENT PRIMARY KEY,
  study_code VARCHAR(60) NOT NULL UNIQUE, -- e.g. STU-2026-001021
  patient_id INT NOT NULL,
  study_type ENUM('Abdomen', 'Pelvis', 'Obstetric', 'Renal', 'Thyroid', 'Breast', 'Scrotal', 'Doppler', 'Other') NOT NULL,
  body_region VARCHAR(100) NOT NULL,
  referring_doctor VARCHAR(120),
  clinical_indication TEXT NOT NULL,
  technician_id INT,
  assigned_radiologist_id INT,
  study_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  priority ENUM('NORMAL', 'URGENT', 'EMERGENCY') DEFAULT 'NORMAL',
  status ENUM(
    'REGISTERED',
    'IMAGE_UPLOADED',
    'AI_PROCESSING',
    'AI_COMPLETED',
    'ASSIGNED',
    'UNDER_REVIEW',
    'REPORT_DRAFTED',
    'APPROVED',
    'COMPLETED'
  ) DEFAULT 'REGISTERED',
  diagnostic_center_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_studies_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  CONSTRAINT fk_studies_tech FOREIGN KEY (technician_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_studies_rad FOREIGN KEY (assigned_radiologist_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_studies_center FOREIGN KEY (diagnostic_center_id) REFERENCES diagnostic_centers(center_id) ON DELETE RESTRICT,
  INDEX idx_studies_patient (patient_id),
  INDEX idx_studies_radiologist (assigned_radiologist_id),
  INDEX idx_studies_status (status),
  INDEX idx_studies_priority (priority),
  INDEX idx_studies_date (study_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. STUDY IMAGES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS study_images;
CREATE TABLE study_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  study_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Local path or S3 URL
  file_size INT,
  file_type VARCHAR(50),
  ai_status ENUM('PENDING', 'PROCESSED', 'FAILED') DEFAULT 'PENDING',
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_study FOREIGN KEY (study_id) REFERENCES studies(study_id) ON DELETE CASCADE,
  CONSTRAINT fk_images_uploader FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_images_study (study_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. AI ANALYSIS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS ai_analysis;
CREATE TABLE ai_analysis (
  ai_analysis_id INT AUTO_INCREMENT PRIMARY KEY,
  study_id INT NOT NULL,
  status ENUM('PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PROCESSING',
  model_version VARCHAR(50) DEFAULT 'v1.4.2-FastAPI-OpenCV',
  draft_impression TEXT,
  raw_response_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_ai_analysis_study FOREIGN KEY (study_id) REFERENCES studies(study_id) ON DELETE CASCADE,
  INDEX idx_ai_analysis_study (study_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. AI FINDINGS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS ai_findings;
CREATE TABLE ai_findings (
  finding_id INT AUTO_INCREMENT PRIMARY KEY,
  ai_analysis_id INT NOT NULL,
  organ VARCHAR(80) NOT NULL,
  observation TEXT NOT NULL,
  confidence FLOAT DEFAULT 0.0,
  location VARCHAR(100),
  measurement VARCHAR(100),
  status ENUM('PENDING', 'ACCEPTED', 'MODIFIED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_findings_analysis FOREIGN KEY (ai_analysis_id) REFERENCES ai_analysis(ai_analysis_id) ON DELETE CASCADE,
  INDEX idx_ai_findings_analysis (ai_analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. REPORTS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  study_id INT NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  radiologist_id INT NOT NULL,
  status ENUM('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'AMENDED') DEFAULT 'DRAFT',
  clinical_indication TEXT,
  technique TEXT,
  findings_text LONGTEXT,
  measurements_json JSON,
  impression TEXT,
  recommendations TEXT,
  approved_at DATETIME NULL,
  verification_code VARCHAR(100) UNIQUE,
  qr_code_url VARCHAR(255),
  pdf_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_study FOREIGN KEY (study_id) REFERENCES studies(study_id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_rad FOREIGN KEY (radiologist_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_reports_radiologist (radiologist_id),
  INDEX idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. REPORT VERSIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS report_versions;
CREATE TABLE report_versions (
  version_id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  version_number INT NOT NULL,
  content_json JSON NOT NULL,
  changed_by INT NOT NULL,
  change_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_ver_report FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
  CONSTRAINT fk_report_ver_user FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_report_versions (report_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'SUCCESS', 'WARNING', 'ALERT', 'URGENT') DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(50), -- e.g. 'STUDY', 'REPORT'
  related_entity_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL, -- e.g. 'LOGIN', 'PATIENT_CREATED', 'REPORT_APPROVED'
  entity_type VARCHAR(80) NOT NULL,
  entity_id INT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  details_json JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_audit_action (action),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System Administrator with full access'),
(2, 'RADIOLOGIST', 'Medical specialist who reviews USG images, edits AI drafts & approves reports'),
(3, 'RECEPTIONIST', 'Front-desk staff who registers patients and schedules studies'),
(4, 'TECHNICIAN', 'USG Operator who captures & uploads ultrasound images');

-- Diagnostic Center
INSERT INTO diagnostic_centers (center_id, name, code, address, phone, email) VALUES
(1, 'Apex Advanced Diagnostic & Imaging Center', 'APEX-MAIN-01', '452 Healthcare Boulevard, Medical District', '+1-800-555-USG1', 'info@apexdiagnostics.com');

-- Users (Default passwords set to hashed '$2b$10$wT8K84XQx0eP.9wVpXn.e.m8p91vD5/...' for 'Password123!')
INSERT INTO users (user_id, email, password_hash, first_name, last_name, role_id, diagnostic_center_id, phone, qualification, registration_number, status) VALUES
(1, 'admin@apexdiagnostics.com', '$2b$10$2b0y.q1p1QvJ7H0HkL8y1e6lD3x4m5n6o7p8q9r0s1t2u3v4w5x6', 'Admin', 'Officer', 1, 1, '+1-555-0101', 'M.HA, System Lead', 'ADMIN-001', 'ACTIVE'),
(2, 'dr.sarah@apexdiagnostics.com', '$2b$10$2b0y.q1p1QvJ7H0HkL8y1e6lD3x4m5n6o7p8q9r0s1t2u3v4w5x6', 'Dr. Sarah', 'Jenkins', 2, 1, '+1-555-0102', 'MD Radiodiagnosis', 'RAD-2024-8890', 'ACTIVE'),
(3, 'dr.marcus@apexdiagnostics.com', '$2b$10$2b0y.q1p1QvJ7H0HkL8y1e6lD3x4m5n6o7p8q9r0s1t2u3v4w5x6', 'Dr. Marcus', 'Vance', 2, 1, '+1-555-0103', 'DNB Radiology', 'RAD-2022-4412', 'ACTIVE'),
(4, 'receptionist@apexdiagnostics.com', '$2b$10$2b0y.q1p1QvJ7H0HkL8y1e6lD3x4m5n6o7p8q9r0s1t2u3v4w5x6', 'Emily', 'Watson', 3, 1, '+1-555-0104', 'B.Sc Health Admin', 'REC-002', 'ACTIVE'),
(5, 'tech@apexdiagnostics.com', '$2b$10$2b0y.q1p1QvJ7H0HkL8y1e6lD3x4m5n6o7p8q9r0s1t2u3v4w5x6', 'John', 'Doyle', 4, 1, '+1-555-0105', 'Certified Sonographer', 'TECH-108', 'ACTIVE');

-- Sample Patients
INSERT INTO patients (patient_id, uhid, first_name, last_name, gender, date_of_birth, age, phone, email, address, blood_group, referring_doctor, medical_history, allergies, created_by) VALUES
(1, 'PAT-2026-000001', 'Eleanor', 'Vance', 'FEMALE', '1988-04-12', 38, '+1-555-9011', 'eleanor.vance@example.com', '742 Evergreen Terrace', 'O+', 'Dr. R. Harrison', 'Mild hypertension', 'Penicillin', 4),
(2, 'PAT-2026-000002', 'Robert', 'Chen', 'MALE', '1975-09-25', 50, '+1-555-9012', 'robert.chen@example.com', '120 Ocean View Ave', 'A+', 'Dr. S. Mehta', 'Type 2 Diabetes', 'None', 4);

-- Sample Studies
INSERT INTO studies (study_id, study_code, patient_id, study_type, body_region, referring_doctor, clinical_indication, technician_id, assigned_radiologist_id, priority, status, diagnostic_center_id) VALUES
(1, 'STU-2026-001001', 1, 'Abdomen', 'Upper Abdomen', 'Dr. R. Harrison', 'Right upper quadrant abdominal pain and nausea', 5, 2, 'URGENT', 'AI_COMPLETED', 1),
(2, 'STU-2026-001002', 2, 'Renal', 'Kidneys & Urinary Bladder', 'Dr. S. Mehta', 'Right flank pain, suspect nephrolithiasis', 5, 3, 'NORMAL', 'REGISTERED', 1);
