// backend/src/config/mysql.js
// MySQL Database Connector Module using mysql2/promise
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;

/**
 * Lazy initialization of MySQL Connection Pool
 */
export function getMySQLPool() {
  if (pool) return pool;

  const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (connectionUrl) {
    pool = mysql.createPool({
      uri: connectionUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } else {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'usg_reporting',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

/**
 * Execute a SQL query using the MySQL connection pool
 * @param {string} sql - SQL query string
 * @param {Array} params - Array of query parameters
 */
export async function query(sql, params = []) {
  try {
    const p = getMySQLPool();
    const [rows, fields] = await p.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('[MySQL Error]:', error.message);
    throw error;
  }
}

/**
 * Test MySQL connection
 */
export async function testConnection() {
  try {
    const p = getMySQLPool();
    const connection = await p.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ MySQL Connection test failed (Check host/credentials):', error.message);
    return false;
  }
}

/**
 * Initialize core table schemas for persistent USG report storage
 */
export async function initMySQLTables() {
  const p = getMySQLPool();
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(64) UNIQUE NOT NULL,
        uhid VARCHAR(64) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        age INT,
        gender VARCHAR(20),
        phone VARCHAR(30),
        email VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS studies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        study_id VARCHAR(64) UNIQUE NOT NULL,
        study_code VARCHAR(64),
        patient_id VARCHAR(64),
        study_type VARCHAR(100),
        body_region VARCHAR(100),
        status VARCHAR(50),
        priority VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id VARCHAR(64) UNIQUE NOT NULL,
        study_id VARCHAR(64),
        patient_id VARCHAR(64),
        radiologist_id VARCHAR(64),
        status VARCHAR(50) DEFAULT 'DRAFT',
        clinical_indication TEXT,
        findings_text LONGTEXT,
        impression LONGTEXT,
        recommendations TEXT,
        verification_code VARCHAR(100),
        pdf_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role_name VARCHAR(50),
        phone VARCHAR(30),
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id VARCHAR(64) UNIQUE NOT NULL,
        patient_name VARCHAR(150),
        phone VARCHAR(30),
        doctor_name VARCHAR(150),
        usg_service VARCHAR(150),
        appointment_date VARCHAR(30),
        slot_time VARCHAR(30),
        status VARCHAR(30) DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    console.log('✅ MySQL tables (patients, studies, reports, users, appointments) initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize MySQL schema tables automatically:', err.message);
  }
}

/**
 * Sync helper to mirror Firestore records to MySQL
 */
export async function syncRecordToMySQL(table, record) {
  try {
    const p = getMySQLPool();
    if (table === 'patients') {
      await p.execute(
        `INSERT INTO patients (patient_id, uhid, first_name, last_name, age, gender, phone, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE first_name=?, last_name=?, age=?, gender=?, phone=?, email=?`,
        [
          String(record.id || record.patient_id),
          record.uhid || '',
          record.firstName || record.first_name || '',
          record.lastName || record.last_name || '',
          Number(record.age) || 0,
          record.gender || 'UNSPECIFIED',
          record.phone || '',
          record.email || '',
          // Update values
          record.firstName || record.first_name || '',
          record.lastName || record.last_name || '',
          Number(record.age) || 0,
          record.gender || 'UNSPECIFIED',
          record.phone || '',
          record.email || ''
        ]
      );
    } else if (table === 'studies') {
      await p.execute(
        `INSERT INTO studies (study_id, study_code, patient_id, study_type, body_region, status, priority) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=?, priority=?, study_type=?`,
        [
          String(record.id || record.study_id),
          record.studyCode || record.study_code || '',
          String(record.patientId || record.patient_id || ''),
          record.studyType || record.study_type || '',
          record.bodyRegion || record.body_region || '',
          record.status || 'SCHEDULED',
          record.priority || 'ROUTINE',
          // Update values
          record.status || 'SCHEDULED',
          record.priority || 'ROUTINE',
          record.studyType || record.study_type || ''
        ]
      );
    } else if (table === 'reports') {
      await p.execute(
        `INSERT INTO reports (report_id, study_id, radiologist_id, status, impression, findings_text, recommendations) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=?, impression=?, findings_text=?, recommendations=?`,
        [
          String(record.id || record.report_id),
          String(record.studyId || record.study_id || ''),
          String(record.radiologistId || record.radiologist_id || ''),
          record.status || 'DRAFT',
          record.impressionText || record.impression || '',
          record.detailedFindingsText || record.detailed_findings || '',
          record.recommendationsText || record.recommendations || '',
          // Update values
          record.status || 'DRAFT',
          record.impressionText || record.impression || '',
          record.detailedFindingsText || record.detailed_findings || '',
          record.recommendationsText || record.recommendations || ''
        ]
      );
    } else if (table === 'users') {
      await p.execute(
        `INSERT INTO users (user_id, email, first_name, last_name, role_name, phone, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE email=?, role_name=?, status=?`,
        [
          String(record.id || record.user_id),
          record.email || '',
          record.firstName || record.first_name || '',
          record.lastName || record.last_name || '',
          record.roleName || record.role_name || '',
          record.phone || '',
          record.status || 'ACTIVE',
          // Update values
          record.email || '',
          record.roleName || record.role_name || '',
          record.status || 'ACTIVE'
        ]
      );
    } else if (table === 'appointments') {
      await p.execute(
        `INSERT INTO appointments (appointment_id, patient_name, phone, doctor_name, usg_service, appointment_date, slot_time, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status=?`,
        [
          String(record.id || record.appointment_id),
          record.patient_name || '',
          record.phone || '',
          record.doctor_name || '',
          record.usg_service || '',
          record.appointment_date || '',
          record.slot_time || '',
          record.status || 'PENDING',
          // Update values
          record.status || 'PENDING'
        ]
      );
    }
  } catch (err) {
    console.warn(`[MySQL Dual-Sync Notice (${table})]:`, err.message);
  }
}

export default {
  getMySQLPool,
  query,
  testConnection,
  initMySQLTables,
  syncRecordToMySQL
};
