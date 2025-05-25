import { Router } from 'express';
import { pool } from '../db_connector.js'


export const userRoute = Router();

async function user(rut, password) {
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


userRoute.post('/', (req, res) => {
  const body = req.body;
  user().then(() => {

  });
  res.send("asd\n");


}) 


