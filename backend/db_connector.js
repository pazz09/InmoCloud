import mariadb from 'mariadb';
export const pool = mariadb.createPool({
  host: 'krr.duckdns.org',
  port: 9000,
  user: 'server',
  database: 'inmocloud',
  password: 'contrasenaServer'
})
