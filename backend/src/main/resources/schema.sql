-- Accessible Healthcare Support - Database Schema
-- Database: healthcare_db

CREATE DATABASE IF NOT EXISTS healthcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthcare_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_number VARCHAR(20) NOT NULL,
    age INT NULL,
    gender VARCHAR(20) NULL,
    blood_group VARCHAR(10) NULL,
    allergies TEXT NULL,
    existing_conditions TEXT NULL,
    current_medications TEXT NULL,
    created_at VARCHAR(64) NOT NULL,
    updated_at VARCHAR(64) NULL,
    INDEX idx_user_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    hospital_id VARCHAR(128) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    department VARCHAR(120) NOT NULL,
    appointment_date VARCHAR(10) NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT NULL,
    status VARCHAR(20) NOT NULL,
    fee DOUBLE NOT NULL,
    created_at VARCHAR(64) NOT NULL,
    INDEX idx_appointment_user (user_id),
    INDEX idx_appointment_date (appointment_date),
    CONSTRAINT fk_appointment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS medical_documents (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    upload_date VARCHAR(64) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(255) NULL,
    hospital_name VARCHAR(255) NULL,
    patient_name VARCHAR(255) NULL,
    simple_summary TEXT NOT NULL,
    important_findings_json LONGTEXT NULL,
    medical_terms_json LONGTEXT NULL,
    medicines_detected_json LONGTEXT NULL,
    explicit_diagnosis TEXT NULL,
    attention_level VARCHAR(20) NOT NULL,
    page_count INT NULL,
    raw_extracted_text LONGTEXT NULL,
    INDEX idx_document_user (user_id),
    INDEX idx_document_upload_date (upload_date),
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    timestamp_value VARCHAR(64) NOT NULL,
    badge_text VARCHAR(100) NULL,
    INDEX idx_timeline_user (user_id),
    INDEX idx_timeline_timestamp (timestamp_value),
    CONSTRAINT fk_timeline_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
