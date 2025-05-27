import * as mariadb from 'mariadb';
import { SQLParam } from './types';

const pool: mariadb.Pool = mariadb.createPool({
  host: 'krr.duckdns.org',
  port: 9000,
  user: process.env.MARIADB_USER_SERVER,
  database: process.env.DB_NAME,
  password: process.env.MARIADB_USER_SERVER_PASSWORD
})

const query = (sql: string, params?: SQLParam[]) => {return pool.query(sql, params)};
 
export default {
  query
}
