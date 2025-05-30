import * as mariadb from 'mariadb';
import { SQLParam } from './types';

const pool: mariadb.Pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_HOST_PORT ? 
    Number.parseInt(process.env.DB_HOST_PORT): 9000,

  database: process.env.DB_NAME,
  user: process.env.MARIADB_USER_SERVER,
  password: process.env.MARIADB_USER_SERVER_PASSWORD
})

const query = async (sql: string, params?: SQLParam[]) => {
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    // Log or rethrow the error
    throw err;
  } finally {
    if (conn) conn.release(); // Ensures the connection goes back to the pool
  }
};
 
export default {
  query
}
