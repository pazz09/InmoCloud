import { db_user_schema, OkPacket, OkPacket_t, payment_search_params, property_form_add_t, property_form_arrendatario_t, property_form_edit_t, property_search_t, property_t, property_view_schema, property_view_t, SQLParam, zodKeys } from "@/types";
import db from "./db";
import { RolAlreadyExistsError, UnexpectedError } from "./errors";


/// GET PROPERTIES
export async function searchProperties(searchParams: property_search_t)
: Promise<property_view_t[]> {
  searchParams;
  const fields = zodKeys(payment_search_params);
  const whereClauses: string[] = []
  const values: SQLParam[] = [];
  fields.forEach((key: string) => {
    const value = searchParams[key as keyof property_search_t];
    if (value !== undefined && value !== null) {
      //remapping? not needed
      whereClauses.push(`${key} = ?`)
      values.push(value);
    }
  });
  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const sql = `
  SELECT p.id, p.direccion, p.activa, p.valor, 

  propietario.nombre AS propietario_nombre,
  propietario.apellidos AS propietario_apellidos
  
  FROM properties_t p
  JOIN 
    users_t propietario ON p.propietario_id = propietario.id
  LEFT JOIN
    users_t arrendatario ON p.arrendatario_id = arrendatario.id

  ${whereSQL}
  `

  const results = await db.query(sql, values);
  const transformed = results.map((row: property_view_t)=> ({
    ...row,
    valor: row.valor ? Number(row.valor) : null,
  }));

  return property_view_schema.array().parse(transformed);
}


export async function addProperty(property: property_form_add_t): Promise<property_view_t> 
{
  if (await checkIfRolExists(property.rol!))
    throw RolAlreadyExistsError();

  const keys = Object.keys(property).filter(k => k !== 'type');
  const values = Object.values(property);

  const q = `INSERT INTO properties_t (${keys.join(', ')}) 
              VALUES (${keys.map(() => '?').join(', ')})`;

  const res = await db.query(q, values);


  console.log("addProperty:res", res);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const property = await searchProperties({id: okpacket.insertId});
    return property[0];
  }
  throw UnexpectedError();
}

export async function checkIfRolExists(rol: string): Promise<boolean> {
  const rows = await db.query("SELECT id FROM properties_t WHERE rol = ?", [rol]);
  return rows.length > 0;
}

export async function updateProperty(property: property_form_edit_t): Promise<property_view_t> 
{
  console.log("@/backend/properties/ updateProperty")

  const result = await searchProperties({rol: property.rol});
  if (result.length > 0)
    throw RolAlreadyExistsError();

  const keys = Object.keys(property);
  const values = Object.values(property) as SQLParam[];

  const q = `UPDATE properties_t SET ${keys.map(k => `${k} = ?`).join(', ')} 
              WHERE id = ?`;

  const res = await db.query(q, [...values, property.id]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const property = await searchProperties({id: okpacket.insertId});
    return property[0];
  }
  throw UnexpectedError();
}

export async function deleteProperty(targetId: number): Promise<void>
{
  const res = await db.query(`DELETE FROM properties_t WHERE id = ?`, [targetId]);
  const okpacket = OkPacket.parse(res);

  if (okpacket.affectedRows === 1) {
    return;
  }
  throw UnexpectedError();
}

export async function asignarArrendatario(prop_arrendatario: property_form_arrendatario_t): Promise<property_view_t>
{
  const keys = Object.keys(prop_arrendatario);
  const values = Object.values(prop_arrendatario) as SQLParam[];

  const q = `UPDATE properties_t SET ${keys.map(k => `${k} = ?`).join(', ')} 
              WHERE id = ?`;

  const res = await db.query(q, [...values, prop_arrendatario.id]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const property = await searchProperties({id: okpacket.insertId});
    return property[0];
  }
  throw UnexpectedError();
}