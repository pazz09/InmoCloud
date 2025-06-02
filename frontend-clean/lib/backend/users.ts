import db from "./db";
import { empty_response_t, OkPacket, response_t, SQLParam, user_add_t, user_role_enum, user_response_t, user_safe_schema, user_safe_t, user_schema, user_search_schema, user_search_t, user_t, OkPacket_t } from "./types"
import { generateToken } from "./auth";

import { compare } from "bcryptjs";
import z from "zod";
import { InvalidPasswordError, MissingCredentialsError, UserNotFoundError, UserParsingError } from "./errors";


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

export async function getUsers(): Promise<user_t[]> {
  const rows = await db.query("SELECT * FROM users_t");

  // Inject `type: "full"` into each row
  const withType = rows.map((row: user_t) => ({ ...row, type: "full" }));

  // Now safely parse with Zod
  return z.array(user_schema).parse(withType);
}

export async function getUser(uid: number): Promise<user_t> {
  console.log("doing req");
  const res = await db.query("SELECT * FROM users_t WHERE id = ?", [uid]);
  console.log("Got", res)

  if (res.length === 0)
    throw new Error("user_not_found");
  return user_schema.parse({type: "full", ...res[0]});

}

export async function addUser(user: user_add_t): Promise<user_t> 
{

  const existingRut = await db.query(
    `SELECT id FROM users_t
        WHERE rut = ?`,
    [user.rut]
  );

  const existingName = await db.query(
    `SELECT id FROM users_t
        WHERE name = ?`,
    [user.name]
  );


  if (existingRut.length > 0) {
    throw new Error("user-rut-already-exists");
  }

  if (existingName.length > 0) {
    throw new Error("user-name-already-exists");
  }

  const res = await 
  db.query(`INSERT INTO users_t (name, rut, role, passwordHash)
           VALUES(?, ?, ?, ?)`,
           [user.name!, user.rut!, user.role!, user.passwordHash!]);
  console.log("addUser:res", res);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const user = await getUser(okpacket.insertId);
    return user
  }
  throw new Error("error-adding-user");
             //   return {status: "success"};

}

export async function updateUser(user: user_t): Promise<OkPacket_t>
{
  const res = await 
  db.query(`UPDATE users_t 
           SET name = ?, rut = ?, role = ?,
             passwordHash = ? WHERE id = ?`,
             [user.name!, user.rut!, user.role!, user.passwordHash!, user.id!]);
  const okpacket = OkPacket.parse(res);
  console.log(okpacket);
  return okpacket;
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
  user: user_safe_schema,
  token: z.string().jwt()
})

type login_response_t = z.infer<typeof login_response_schema>;


export async function login(rut: string, password: string): Promise<login_response_t> {
  if (!rut || !password) {
    throw MissingCredentialsError();
  }

  const rows = await db.query('SELECT * FROM users_t WHERE rut = ?', [rut]);

  if (rows.length === 0) {
    throw UserNotFoundError();
  }

  const dbUser = rows[0];

  let user: user_t;
  try {
    user = user_schema.parse({ ...dbUser, type: "full" });
  } catch (e) {
    console.error("User schema parse error", e);
    throw UserParsingError();
  }

  if (!user.passwordHash) {
    throw UserNotFoundError(); // treat as same error to avoid leaking info
  }

  const match = await compare(password, user.passwordHash);
  if (!match) {
    throw InvalidPasswordError();
  }

  // Strip sensitive data
  const { passwordHash, ...rest } = user;
  const safeUser: user_safe_t = user_safe_schema.parse({ ...rest, type: "safe" });

  const token = generateToken({
    id: user.id,
    role: user_role_enum.parse(user.role),
  });

  return { user: safeUser, token };
}


// Solo para admin y corredor, autenticación debe ocurrir a nivel superior
export async function searchUsers(params: user_search_t): Promise<user_t[]> {
  // Validar parámetros con Zod
  const search = user_search_schema.parse(params);

  // Armado dinámico de consulta
  const whereClauses: string[] = [];
  const values: SQLParam[] = [];

  if (search.name) {
    whereClauses.push("u.name LIKE ?");
    values.push(`%${search.name}%`);
  }

  if (search.property_name) {
    whereClauses.push(`
                      EXISTS (
                        SELECT 1
                        FROM properties_t p
                        WHERE (p.arrendatario_id = u.id OR p.propietario_id = u.id)
                        AND p.direccion LIKE ?
                      )
                        `);
                        values.push(`%${search.property_name}%`);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const rows = await db.query(
    `
    SELECT u.id, u.name, u.rut, u.role, u.passwordHash
    FROM users_t u
    ${where}
    `,
    values
  );

  const parsed = z.array(user_schema).parse(
    rows.map((row: user_t) => ({ ...row, type: "full" }))
  );
  return parsed;
}


/**
 * Returns all users (unsafe) with or without filters.
 * Delegates to either getUsers() or searchUsers().
 */
export async function getUsersFiltered(params?: user_search_t): Promise<user_t[]> {
  const safe_params = user_search_schema.safeParse(params);
  const hasFilters = safe_params.data;

  if (hasFilters) {
    return await searchUsers(params!);
  }

  const users = await getUsers();
  return users;

}
