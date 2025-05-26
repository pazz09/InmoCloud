import mariadb from 'mariadb';

export const handler = mariadb.createPool({
  host: 'krr.duckdns.org',
  port: 9000,
  user: process.env.MARIADB_USER_SERVER,
  database: process.env.DB_NAME,
  password: process.env.MARIADB_USER_SERVER_PASSWORD
})
