import db from "./db";
import { empty_response_t, OkPacket, response_t, user_add_t, user_role_enum, user_role_enum_t, user_schema, user_t } from "./types"
import { generateToken } from "./auth";

import { compare } from "bcryptjs";
import z from "zod";


// TODO: Add Filters!
/*
 * {
 *    "name": "Nombre del usuario por el que filtrar",
 *    "date_start": "Fecha inicio del filtrado",
 *    "date_end": "Fecha de término del filtrado",
 *    "property": "Filtrar por propiedad"
 * }
 *
 */
// Only to be used by admin, must check in higher level.
export async function getUsers(): Promise<user_t[]> {
    const rows = await db.query("SELECT * FROM users_t");

    // Parse array of rows using Zod
    const parsed = z.array(user_schema).parse(rows);

    return parsed;
}

export async function getUser(uid: number): Promise<user_t> {
  console.log("doing req");
    const res = await db.query("SELECT * FROM users_t WHERE id = ?", [uid]);
    console.log("Got", res)

    if (res.length === 0)
      throw new Error("user_not_found");
    return user_schema.parse(res[0]);
  
}

export async function addUser(user: user_add_t): Promise<empty_response_t> 
{
  const res = await 
    db.query(`INSERT INTO users_t (name, rut, role, passwordHash)
                VALUES(?, ?, ?, ?)`,
      [user.name!, user.rut!, user.role!, user.passwordHash!]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1)
    return {status: "success"};
  return {status: "error"};

}

export async function updateUser(user: user_t): Promise<empty_response_t>
{
  const res = await 
    db.query(`UPDATE users_t 
                SET name = ?, rut = ?, role = ?,
                  passwordHash = ? WHERE id = ?`,
     [user.name!, user.rut!, user.role!, user.passwordHash!, user.id!]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1)
    return {status: "success"};
  return {status: "error", message: "Ningún dato ha sido modificado." };

}

export async function deleteUser(uid: number): Promise<empty_response_t>
{

  const res = await 
    db.query(`DELETE FROM users_t WHERE id = ?`, [uid]);

  const okpacket = OkPacket.parse(res);

  if (okpacket.affectedRows == 1)
    return {
      status: "success", 
      message: "El usuario ha sido eliminado correctamente."
    };

  return {status: "error", message: "Ningún dato ha sido modificado." };

}

const login_response_schema = z.object({
  user: user_schema,
  token: z.string().jwt()
})

type login_response_t = z.infer<typeof login_response_schema>;

export async function login(rut: string, password: string): Promise<login_response_t> {
  if (!rut || !password) {
    throw new Error("No se ingresaron datos");
  }

  const rows = await db.query('SELECT * FROM users_t WHERE rut = ?', [rut]);

  if (rows.length === 0) {
    throw new Error("user_not_found");
  }

  try {
    const user: user_t = user_schema.parse(rows[0]);

    if (!user.passwordHash) {
      throw new Error("user_not_found");
    }

    const match = await compare(password, user.passwordHash);
    if (!match) {
      throw new Error("Contraseña inválida");
    }

    // Copia segura sin passwordHash
    const { passwordHash, ...safeUser } = user;

    const token = generateToken({ id: user.id, role: user.role });

    return { user: safeUser, token };
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error("user_not_found");
    }
    throw err; // Re-lanza cualquier otro error no manejado
  }
}
