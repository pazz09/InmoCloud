import {payment_search_params, payment_search_params_t, payment_t, payment_view_schema, zodKeys } from "@/types"
import  db from "@/backend/db";

//import { AppError } from "@/utils/errors"; // Assuming you use this
import z from "zod";

export async function searchPayments(searchParams: payment_search_params_t): Promise<payment_view_t[]> {
  try {
    const fields = zodKeys(payment_search_params); // ['id', 'timestamp', 'giro', 'deposito']
    const whereClauses: string[] = [];
    const values: any[] = [];

    fields.forEach((key) => {
      const value = searchParams[key as keyof payment_search_params_t];
      if (value !== undefined && value !== null) {
        if (key === "timestamp") {
          whereClauses.push(`fecha = ?`);
        } else {
          whereClauses.push(`${key} = ?`);
        }
        values.push(value);
      }
    });

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sql = `

    SELECT p.id, p.fecha AS timestamp, p.giro, p.deposito, p.categoria, 
      p.detalle, u.nombre as cliente, pr.direccion as propiedad
      
    FROM pagos_t p

    JOIN users_t u ON u.id = p.usuario_id
    JOIN properties_t pr ON pr.id = p.propiedad_id
    ${whereSQL}`;

    const results = await db.query(sql, values);
    const transformed = results.map((row: { timestamp: string | number | Date; giro: null; deposito: null; }) => ({
      ...row,
      timestamp: new Date(row.timestamp),
      giro: row.giro !== null ? Number(row.giro) : null,
      deposito: row.deposito !== null ? Number(row.deposito) : null,
    }));
    return z.array(payment_view_schema).parse(transformed);
  } catch (err) {
    throw err;
    //throw new AppError("Error searching for payments", 500, err.me);
  }
}

