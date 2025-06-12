import { generateToken } from "./auth";
import db from "./db";
import { zodKeys } from "@/types";

import {  OkPacket, SQLParam, user_role_enum, user_safe_schema,
   user_safe_t, user_schema, user_search_schema, user_search_t, user_t,
    OkPacket_t, Roles, RoleHierarchy, UserRoleEnum, user_union_t,
     db_user_schema,
     client_union_t,
     property_schema,
     propietario_t,
     arrendatario_t,
     client_union_schema,
     user_form_data_t, 
} from "@/types"

import { InvalidPasswordError, MissingCredentialsError, NotModifiedError, RutAlreadyExistsError,
  UnauthorizedError, UnexpectedError, UserNotFoundError, UserParsingError 
} from "./errors";

import { compare } from "bcryptjs";
import z from "zod";
import { extractFromRow } from "./utils";

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
  console.log("@/backend/users: getUser");
  const res = await db.query("SELECT * FROM users_t WHERE id = ?", [uid]);

  if (res.length === 0)
    throw UserNotFoundError();
  return user_schema.parse({type: "full", ...res[0]});

}

export async function addUser(user: user_form_data_t): Promise<user_t> 
{
  
  if (await checkIfRutExists(user.rut!))
    throw RutAlreadyExistsError();

  const keys = Object.keys(user).filter(k => k !== 'type');
  const values = Object.values(user);

  const q = `INSERT INTO users_t (${keys.join(', ')}) 
              VALUES (${keys.map(() => '?').join(', ')})`;

  const res = await db.query(q, values);


  console.log("addUser:res", res);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const user = await getUser(okpacket.insertId);
    return user
  }
  throw UnexpectedError();

}

export async function updateUser(user: user_t): Promise<OkPacket_t>
{
  console.log("@/backend/users/ updateUser")

  const ids = await getUserIdsByRut(user.rut);
  if (ids.length > 0 && !ids.includes(user.id)) {
    throw RutAlreadyExistsError();
  }
  const noType = db_user_schema.parse(user);
  const keys = Object.keys(noType);
  const values = Object.values(noType) as SQLParam[];

  const q = `UPDATE users_t SET ${keys.map(k => `${k} = ?`).join(', ')} 
              WHERE id = ?`;

  const res = await db.query(q, [...values, user.id]);
  const okpacket = OkPacket.parse(res);
  return okpacket;
}

export async function deleteUser({
  requestingUser,
  targetUserId,
}: {
  requestingUser: user_t;
  targetUserId: number;
}): Promise<OkPacket_t> {

  const isSelf = requestingUser.id === targetUserId;
  const allowedRoles = [Roles.ADMINISTRADOR, Roles.CORREDOR];
  const isAllowedRole = allowedRoles.includes(requestingUser.role);

  if (!isSelf && !isAllowedRole) {
    throw UnauthorizedError();
  }

  // TODO: Instead of getting the whole user,
  // we could only check  for permissions with a boolean
  const targetUser = await getAuthorizedUserView(
    {requestingUser, targetUserId});
  /* */

  const res = await db.query(`DELETE FROM users_t WHERE id = ?`, [targetUserId]);
  const okpacket = OkPacket.parse(res);

  if (okpacket.affectedRows === 1) {
    return okpacket;
  } else {
    throw NotModifiedError()
  }

  throw UserParsingError();
}

const login_response_schema = z.object({
  user: user_safe_schema,
  token: z.string().jwt()
})

type login_response_t = z.infer<typeof login_response_schema>;


export async function login(rut: string, password: string):
 Promise<login_response_t> {

  if (!rut || !password) {
    throw MissingCredentialsError();
  }

  const rows = await db.query('SELECT * FROM users_t WHERE rut = ?', [rut]);
  //console.log("rows", rows)
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

  const safeUser: user_safe_t = 
    user_safe_schema.parse({ ...rest, type: "safe" });

  const token = generateToken({
    id: user.id,
    role: user_role_enum.parse(user.role),
  });

  return { user: safeUser, token };
}



export async function searchUsers(params: user_search_t): Promise<user_t[]> {
  // Validar parámetros con Zod
  const search = user_search_schema.parse(params);

  // Construcción dinámica del WHERE
  const whereClauses: string[] = [];
  const values: SQLParam[] = [];

  if (search.name) {
    whereClauses.push(`
    (
      LOWER(u.nombre) LIKE LOWER(?) OR
      LOWER(u.apellidos) LIKE LOWER(?) OR
      LOWER(CONCAT(u.nombre, ' ', u.apellidos)) LIKE LOWER(?)
    )
  `);
    const pattern = `%${search.name}%`;
    values.push(pattern, pattern, pattern);
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

  // Obtener columnas válidas para SELECT (sin "type")
  const keys = zodKeys(user_schema).filter(k => k !== "type");
  // console.log("Valid keys for user schema:", keys);
  const columns = keys.map(k => `u.${k}`).join(", ");

  const q = `
    SELECT ${columns}
    FROM users_t u
    ${where}
  `;

  // console.log("Executing search query:", q, "with values:", values);

  const rows = await db.query(q, values);

  // Parsear con schema completo (agregar "type" manualmente)
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


export async function getAuthorizedUserView({
  requestingUser,
  targetUserId,
}: {
  requestingUser: user_t;
  targetUserId: number;
}) {
  const isSelf = requestingUser.id === targetUserId;
  const allowedRoles = [Roles.ADMINISTRADOR, Roles.CORREDOR];
  const isAllowedRole = allowedRoles.includes(requestingUser.role);

  if (!isSelf && !isAllowedRole) {
    throw UnauthorizedError();
  }

  const user = await getUser(targetUserId);
  const isGreater = RoleHierarchy.indexOf(requestingUser.role) >
    RoleHierarchy.indexOf(user.role);

  if (!isGreater) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  return user;
}

export async function checkIfRutExists(rut: string): Promise<boolean> {
  const rows = await db.query("SELECT id FROM users_t WHERE rut = ?", [rut]);
  return rows.length > 0;
}

export async function getUserIdsByRut(rut: string): Promise<number[]> {
  const rows = await db.query("SELECT id FROM users_t WHERE rut = ?", [rut]);
  return rows.map((row: { id: number }) => row.id);
}


// export async function getClients(): Promise<user_safe_t[]> {
//   //  append u. at begginning
//     const userFields = zodKeys(user_safe_schema).map(k => `u.${k}`).join(", ");
//     const propertyFields = zodKeys(user_schema).map(k => `p.${k}`).join(", ");
//     const arrendatarioFields = zodKeys(user_safe_schema).map(k => `a.${k}`).join(", ");

//     const q = `
//     SELECT ${userFields}, ${propertyFields}, ${arrendatarioFields}
//     FROM users_t u
//     LEFT JOIN properties_t p ON u.id = p.propietario_id
//     LEFT JOIN users_t a ON p.arrendatario_id = a.id
//     WHERE u.role IN (?, ?)
//   `;

//   const rows = await db.query(q, [Roles.ARRENDATARIO, Roles.PROPIETARIO]);

//   return z.array(user_safe_schema)
//     .parse(rows.map((row: user_safe_t) => ({ ...row, type: "safe" })));
// }

export async function getClients(): Promise<client_union_t[]> {
  const userFields = zodKeys(user_schema).filter(k => k !== 'type').map(k => `u.${k} as u_${k}`).join(", ");
  const propertyFields = zodKeys(property_schema).map(k => `p.${k} as p_${k}`).join(", ");

  const qp = `
    SELECT ${userFields}, ${propertyFields}
    FROM users_t u
    LEFT JOIN properties_t p ON u.id = p.propietario_id
    WHERE u.role = ?
  `;

  const qa = `
    SELECT ${userFields}, ${propertyFields}
    FROM users_t u
    LEFT JOIN properties_t p ON u.id = p.arrendatario_id
    WHERE u.role = ?
  `;

  const propietarios = await db.query(qp, [Roles.PROPIETARIO]);
  const arrendatarios = await db.query(qa, [Roles.ARRENDATARIO]);
  const rows = [...propietarios, ...arrendatarios];

  const clientsMap: Record<number, propietario_t | arrendatario_t> = {};

  for (const row of rows) {
    const user = extractFromRow({...row, u_type: "full"}, "u", user_schema);

    const prop = extractFromRow(row, "p", property_schema, true);
    let property = null;
    const property_parse = property_schema.safeParse(prop);
    if (property_parse.success) 
      property = property_parse.data;
    if (!user)
      continue; // Skip if user is null or invalid

    if (user.role === Roles.PROPIETARIO) {
      if (!clientsMap[user.id]) {
        clientsMap[user.id] = {
          ...user,
          propiedades: property ? [property] : [],
        } as propietario_t;
      } else if (property) {
        (clientsMap[user.id] as propietario_t).propiedades?.push(property);
      }
    }

    if (user.role === Roles.ARRENDATARIO) {
      if (!clientsMap[user.id]) {
        clientsMap[user.id] = {
          ...user,
          propiedad: property ?? null,
        } as arrendatario_t;
      }
    }
  }

  return client_union_schema.array().parse(Object.values(clientsMap));
}



function sanitizeUser(user: user_t, requesterRole: UserRoleEnum): user_union_t {
const isRestricted = RoleHierarchy.indexOf(requesterRole) <
  RoleHierarchy.indexOf(user.role);

  if (!isRestricted) return user

  const { passwordHash, ...rest } = user;
  return user_safe_schema.parse({ ...rest, type: "safe" });
}

export function sanitizeUsers(requesterRole: UserRoleEnum, users: user_t[]): user_union_t[] {
  return users.map(user => sanitizeUser(user, requesterRole));
}

