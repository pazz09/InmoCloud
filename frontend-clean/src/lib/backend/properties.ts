import { OkPacket, payment_search_params, property_form_add_t, property_form_arrendatario_t, property_form_edit_t, property_search_schema, property_search_t, property_view_schema, property_view_t, SQLParam, zodKeys } from "@/types";
import db from "./db";
import { PropertyHasPayments, RolAlreadyExistsError, TenantAlreadyAssigned, UnexpectedError } from "./errors";
import { SqlError } from "mariadb";


/// GET PROPERTIES
export async function searchProperties(searchParams: property_search_t)
: Promise<property_view_t[]> {
  console.log(searchParams)

  let where = [];
  let params: any[] = [];

  // Filtro propietario
  if (searchParams['propietario'] != null) {
    params.push(`%${searchParams['propietario']}%`);
    where.push(`(propietario.nombre LIKE ? OR propietario.apellidos LIKE ?)`);
    params.push(`%${searchParams['propietario']}%`); // segundo ?
  }

  // Filtro arrendatario
  if (searchParams['arrendatario'] != null) {
    params.push(`%${searchParams['arrendatario']}%`);
    where.push(`(arrendatario.nombre LIKE ? OR arrendatario.apellidos LIKE ?)`);
    params.push(`%${searchParams['arrendatario']}%`);
  }

  // Filtro dirección
  if (searchParams['direccion']) {
    params.push(`%${searchParams['direccion']}%`);
    where.push(`p.direccion LIKE ?`);
  }

  const sql = `
  SELECT p.id, p.direccion, p.activa, p.valor, p.propietario_id, p.arrendatario_id, p.rol, p.fecha_arriendo,

  propietario.nombre AS propietario_nombre,
  propietario.apellidos AS propietario_apellidos,

  arrendatario.nombre AS arrendatario_nombre,
  arrendatario.apellidos AS arrendatario_apellidos
  
  FROM properties_t p
  JOIN 
    users_t propietario ON p.propietario_id = propietario.id
  LEFT JOIN
    users_t arrendatario ON p.arrendatario_id = arrendatario.id

  ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
  `

  const results = await db.query(sql, params);
  //console.log("Results:", results);
  const transformed = results.map((row: { valor: number; arrendatario_id: number,  propietario_nombre: string; propietario_apellidos: string; arrendatario_nombre: string; arrendatario_apellidos: string; })=> ({
    ...row,
    valor: row.valor ? Number(row.valor) : null,
    propietario: `${row.propietario_nombre} ${row.propietario_apellidos}`,
    arrendatario: row.arrendatario_id ? `${row.arrendatario_nombre} ${row.arrendatario_apellidos}` : ""
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

export async function updateProperty(id: number, property: property_form_edit_t): Promise<property_view_t> 
{
  console.log("@/backend/properties/ updateProperty")

  const result = await searchProperties({rol: property.rol});
  if (result.length > 0 && result[0].id != id) {
    console.log(property.rol)
    console.log(result[0].rol)
    throw RolAlreadyExistsError();
  }

  const keys = Object.keys(property);
  const values = Object.values(property) as SQLParam[];

  const q = `UPDATE properties_t SET ${keys.map(k => `${k} = ?`).join(', ')} 
              WHERE id = ?`;

  const res = await db.query(q, [...values, id]);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows == 1) {
    const prop = await searchProperties({id});
    return prop[0];
  }
  throw UnexpectedError();
}

export async function deleteProperty(targetId: number): Promise<void>
{
  try {
    const res = await db.query(`DELETE FROM properties_t WHERE id = ?`, [targetId]);
    const okpacket = OkPacket.parse(res);

    if (okpacket.affectedRows === 1) {
      return;
    }
    throw UnexpectedError();
  } catch (error) {
    // Verifica si es error de restricción FK
    if (
      error instanceof SqlError && (
      error.code === "ER_ROW_IS_REFERENCED" || // error code 1451
      (error.errno === 1451 && error.sqlState === "23000")
      )
    ) {
      throw PropertyHasPayments();
    }
    throw error;
  }
}

export async function asignarArrendatario(
  targetId: number,
  prop_arrendatario: property_form_arrendatario_t
): Promise<property_view_t> {
  const keys = Object.keys(prop_arrendatario);
  const values = Object.values(prop_arrendatario) as SQLParam[];

  const q = `UPDATE properties_t SET ${keys.map(k => `${k} = ?`).join(', ')} 
              WHERE id = ?`;

  try {
    const res = await db.query(q, [...values, targetId]);
    const okpacket = OkPacket.parse(res);

    if (okpacket.affectedRows === 1) {
      const prop = await searchProperties({ id: targetId });
      return prop[0];
    }

    throw UnexpectedError(); // no se modificó nada
  } catch (err) {
    if (err instanceof SqlError && err.code === 'ER_DUP_ENTRY') {
      throw TenantAlreadyAssigned();
    }

    // puedes loguear otros errores si quieres
    console.error('Error al asignar arrendatario:', err);
    throw UnexpectedError(); // un error genérico
  }
}
