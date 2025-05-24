import { Router } from 'express';
import { pool } from '../db_connector.js'


export const loginRoute = Router();

async function login(rut, password) {
// rut: String
// password: String

  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT passwordHash FROM users_t");
    console.log(rows);

  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
}


loginRoute.post('/', (req, res) => {
  const body = req.body;
  login().then(() => {

  });
  res.send("asd\n");


}) 


