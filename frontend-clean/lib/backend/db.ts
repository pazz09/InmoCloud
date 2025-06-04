import * as mariadb from 'mariadb';
import { SQLParam } from './types';

declare global {
  var mariadbPool: mariadb.Pool | undefined;
}

const pool =
  globalThis.mariadbPool ??
  mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_HOST_PORT ? Number.parseInt(process.env.DB_HOST_PORT) : 9000,
    database: process.env.DB_NAME,
    user: process.env.MARIADB_USER_SERVER,
    password: process.env.MARIADB_USER_SERVER_PASSWORD,
    connectionLimit: 20,
    acquireTimeout: 10000,
    idleTimeout: 1000,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

if (process.env.NODE_ENV !== 'production') globalThis.mariadbPool = pool;

const query = async (sql: string, params?: SQLParam[]) => {
  let conn: mariadb.PoolConnection | undefined;

  console.log(
    '[DB] Pool status - total:',
    pool.totalConnections(),
    'in use:',
    pool.activeConnections(),
    'idle:',
    pool.idleConnections()
  );

  try {
    conn = await pool.getConnection();
    console.log('[DB] Connection acquired');

    const result = await conn.query(sql, params || []);
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err);
    throw err;
  } finally {
    if (conn) {
      conn.release();
      console.log('[DB] Connection released');
      console.log(
        '[DB] Pool status after release - total:',
        pool.totalConnections(),
        'in use:',
        pool.activeConnections(),
        'idle:',
        pool.idleConnections()
      );
    }
  }
};

export default { query };
