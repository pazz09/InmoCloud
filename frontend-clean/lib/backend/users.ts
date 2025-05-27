import db from "./db";
import { OkPacket, response_schema, response_t, user_add_t, user_schema, user_t } from "./types"
import { generateToken } from "./auth";

import { compare } from "bcryptjs";
import z from "zod";


// Only to be used by admin, must check in higher level.
export async function getUsers(): Promise<z.infer<typeof user_schema>> {
  try {
    return db.query("SELECT * FROM users_t");
  } catch (err) {
    throw err;
  }
}

export async function addUser(user: user_add_t): Promise<response_t<z.ZodNull>> {
  const res = await db.query("INSERT INTO users_t (name, rut, role, passwordHash) VALUES(?, ?, ?, ?) ", [user.name!, user.rut!, user.role!, user.passwordHash!]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1)
    return {status: "success"};
  return {status: "error"};

}

export async function login(rut: string, password: string) {
  if (!rut || !password)
    throw new Error("No se ingresaron datos");
  const rows = await db.query('SELECT * FROM users_t WHERE rut = ?', [rut])
  const user: user_t = user_schema.parse(rows[0]);

  if (user.passwordHash == undefined) 
    throw new Error('Usuario no encontrado');

  const match = await compare(password, user?.passwordHash);
  if (!match)
    throw new Error('Contraseña inválida');

  delete user.passwordHash;

  const token = generateToken({ id: user.id, role: user.role});

  return { user, token };
}
