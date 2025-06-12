import { OkPacket, payment_search_params, property_form_data_t, property_search_t, property_view_schema, property_view_t, SQLParam, zodKeys } from "@/types";
import db from "./db";
import { SuccessTemplate } from "./messages";
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


export async function addProperty(property: property_form_data_t): Promise<property_form_data_t> 
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
    return SuccessTemplate(1);
  }
  throw UnexpectedError();
}

export async function checkIfRolExists(rol: string): Promise<boolean> {
  const rows = await db.query("SELECT id FROM users_t WHERE rol = ?", [rol]);
  return rows.length > 0;
}