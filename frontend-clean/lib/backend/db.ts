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

const query = (sql: string, params?: SQLParam[]) => {
  return pool.query(sql, params)
};
 
export default {
  query
}
