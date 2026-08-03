// User helper functions using Firebase Firestore / MySQL
import { query } from './index.js';

export async function getOrCreateUser(uid, email, roleName = 'RADIOLOGIST', firstName = '', lastName = '') {
  try {
    // Attempt MySQL check first if available
    try {
      const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      if (rows && rows.length > 0) {
        return rows[0];
      }
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role_id, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [email, 'GOOGLE_AUTH_NOPASS', firstName || 'User', lastName || '', 2]
      );
      return { id: result.insertId, email, roleName, firstName, lastName };
    } catch (dbErr) {
      // Fallback for memory/firestore
      return { id: Date.now(), uid, email, roleName, firstName, lastName };
    }
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    return { id: Date.now(), uid, email, roleName, firstName, lastName };
  }
}
