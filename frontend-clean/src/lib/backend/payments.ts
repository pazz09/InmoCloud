import z from "zod";

import {payment_search_params, payment_search_params_t, 
  payment_view_schema, payment_view_t, zodKeys } from "@/types"
import  db from "@/backend/db";

//import { AppError } from "@/utils/errors"; // Assuming you use this

export async function searchPayments(
  searchParams: payment_search_params_t
): Promise<payment_view_t[]> {
  try {

    // ['id', 'fecha', 'giro', 'deposito']
    const fields = zodKeys(payment_search_params); 

    const whereClauses: string[] = [];
    const values: any[] = [];

    fields.forEach((key) => {
      const value = searchParams[key as keyof payment_search_params_t];
      if (value !== undefined && value !== null) {
          whereClauses.push(`${key} = ?`);
      }
        values.push(value);
    });

    const whereSQL = whereClauses.length > 0 ?
      `WHERE ${whereClauses.join(" AND ")}` : "";
    
    const sql = `

    SELECT p.id, p.fecha, p.monto, p.tipo, p.categoria, p.usuario_id, p.propiedad_id,
      p.detalle, u.nombre as cliente, pr.direccion as propiedad
      
    FROM pagos_t p

    JOIN users_t u ON u.id = p.usuario_id
    JOIN properties_t pr ON pr.id = p.propiedad_id
    ${whereSQL}`;


    const results = await db.query(sql, values);
    const transformed = results.map((row: payment_view_t) => ({
      ...row,
      fecha: row.fecha ? new Date(row.fecha) : undefined,
      monto: row.monto !== null ? Number(row.monto) : null,
      tipo: row.tipo !== null ? Boolean(row.tipo) : null,
    }));
    return z.array(payment_view_schema).parse(transformed);
  } catch (err) {
    throw err;
    //throw new AppError("Error searching for payments", 500, err.me);
  }
}

