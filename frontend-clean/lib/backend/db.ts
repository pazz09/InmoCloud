// db.ts
import * as mariadb from 'mariadb';
import { SQLParam } from './types';

let pool: mariadb.Pool | null = null;

if (!pool) {
  pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_HOST_PORT ? Number.parseInt(process.env.DB_HOST_PORT) : 9000,
    database: process.env.DB_NAME,
    user: process.env.MARIADB_USER_SERVER,
    password: process.env.MARIADB_USER_SERVER_PASSWORD,
    connectionLimit: 5,
    idleTimeout: 30,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
}

const query = async (sql: string, params?: SQLParam[]) => {
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    console.log('[DB] Connection acquired');
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err);
    throw err;
  } finally {
    if (conn) {
      conn.release();
      console.log('[DB] Connection released');
    }
  }
};


export default { query };
