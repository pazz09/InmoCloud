import db from "./db";
import { zodKeys } from "@/types";

import {
  SQLParam,

  user_schema, user_search_schema, user_search_t,

  client_union_schema, client_union_t,

  propietario_t, arrendatario_t,

  property_schema,

  Roles, UserRoleEnum,

} from "./types"
import { extractFromRow } from "./utils";



export async function searchClients(params: user_search_t): Promise<client_union_t[]> {
  const search = user_search_schema.parse(params);
  console.log("searchClients: params", search);

  const clauses: string[] = [];
  const values: SQLParam[] = [];

  if (search.name) {
    clauses.push(`
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
    clauses.push(`p.direccion LIKE ?`);
    values.push(`%${search.property_name}%`);
  }

  if (search.role) {
    clauses.push(`u.role = ?`);
    values.push(search.role);
  }

  const where = clauses.length ? `AND ${clauses.join(" AND ")}` : "";

  const userFields = zodKeys(user_schema).filter(k => k !== 'type').map(k => `u.${k} as u_${k}`).join(", ");
  const propertyFields = zodKeys(property_schema).map(k => `p.${k} as p_${k}`).join(", ");

  const baseQuery = (role: UserRoleEnum) => `
    SELECT ${userFields}, ${propertyFields}
    FROM users_t u
    LEFT JOIN properties_t p ON u.id = ${
      role === Roles.PROPIETARIO ? "p.propietario_id" : "p.arrendatario_id"
    }
    WHERE u.role = ?
    ${where}
  `;

  const propietarios = await db.query(baseQuery(Roles.PROPIETARIO), [Roles.PROPIETARIO, ...values]);
  const arrendatarios = await db.query(baseQuery(Roles.ARRENDATARIO), [Roles.ARRENDATARIO, ...values]);

  const rows = [...propietarios, ...arrendatarios];
  const clientsMap: Record<number, propietario_t | arrendatario_t> = {};

  for (const row of rows) {
    const user = extractFromRow({...row, u_type: "full"}, "u", user_schema);
    const prop = extractFromRow(row, "p", property_schema, true);

    let property = null;
    const property_parse = property_schema.safeParse(prop);
    if (property_parse.success) property = property_parse.data;
    if (!user) continue;

    if (user.role === Roles.PROPIETARIO) {
      if (!clientsMap[user.id]) {
        clientsMap[user.id] = { ...user, propiedades: property ? [property] : [] } as propietario_t;
      } else if (property) {
        (clientsMap[user.id] as propietario_t).propiedades?.push(property);
      }
    } else if (user.role === Roles.ARRENDATARIO) {
      if (!clientsMap[user.id]) {
        clientsMap[user.id] = { ...user, propiedad: property ?? null } as arrendatario_t;
      }
    }
  }

  return client_union_schema.array().parse(Object.values(clientsMap));
}
