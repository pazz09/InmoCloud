import * as mariadb from 'mariadb';
import { SQLParam } from './types';

declare global {
  var mariadbPool: mariadb.Pool | undefined;
}

const logDb = false;

const pool =
  globalThis.mariadbPool ??
  mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_HOST_PORT ? Number.parseInt(process.env.DB_HOST_PORT) : 9000,
    database: process.env.DB_NAME,
    user: process.env.MARIADB_USER_SERVER,
    password: process.env.MARIADB_USER_SERVER_PASSWORD,
    connectionLimit: 5,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

if (process.env.NODE_ENV !== 'production') globalThis.mariadbPool = pool;

const query = async (sql: string, params?: SQLParam[]) => {
  let conn: mariadb.PoolConnection | undefined;

  logDb && console.log(
    '[DB] Pool status - total:',
    pool.totalConnections(),
    'in use:',
    pool.activeConnections(),
    'idle:',
    pool.idleConnections()
  );

  try {

    logDb && console.log('[DB] Acquiring connection..');
    conn = await pool.getConnection();
    logDb && console.log('[DB] Connection acquired');

    const result = await conn.query(sql, params || []);
    return result;
  } catch (err) {
    logDb && console.error('[DB] Query error:', err);
    throw err;
  } finally {
    if (conn) {
      conn.release();
      logDb && console.log('[DB] Connection released');
      logDb && console.log(
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
