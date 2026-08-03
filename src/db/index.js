// MySQL Database Connection Pool & Helper for Node.js / JavaScript
import mysql from 'mysql2/promise';

let pool = null;

export function getMySQLPool() {
  if (!pool) {
    const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    if (connectionString && (connectionString.startsWith('mysql://') || connectionString.startsWith('mysql2://'))) {
      pool = mysql.createPool(connectionString);
    } else {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || process.env.SQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT || process.env.SQL_PORT || 3306),
        user: process.env.MYSQL_USER || process.env.SQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || process.env.SQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || process.env.SQL_DB_NAME || 'usg_reporting_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
  }
  return pool;
}

export async function query(sql, params = []) {
  try {
    const p = getMySQLPool();
    const [rows] = await p.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('MySQL Query Error:', err.message);
    throw err;
  }
}

export const db = {
  query,
  getPool: getMySQLPool,
};

export default db;
