import z from "zod";

import {OkPacket, payment_form_data_schema, payment_form_data_t, payment_search_params, payment_search_params_t, 
  payment_t, 
  payment_view_schema, payment_view_t, SQLParam, zodKeys } from "@/types"
import  db from "@/backend/db";
import { convertZodError, InvalidFormDataError, NotModifiedError, UnexpectedError } from "./errors";

//import { AppError } from "@/utils/errors"; // Assuming you use this
//
const key_map: Record<string, string> = {
  id: "p.id",
}

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
        const final_key = key in key_map ? key_map[key] : key;
        whereClauses.push(`${final_key} = ?`);
        values.push(value); // ONLY PUSH when it's valid
      }
    });

    const whereSQL = whereClauses.length > 0 ?
      `WHERE ${whereClauses.join(" AND ")}` : "";
    
    const sql = `

    SELECT p.id, p.fecha, p.monto, p.tipo, p.categoria, p.usuario_id, p.propiedad_id,
      p.detalle, u.nombre as cliente, pr.direccion as propiedad, p.pagado
      
    FROM pagos_t p

    LEFT JOIN users_t u ON u.id = p.usuario_id
    LEFT JOIN properties_t pr ON pr.id = p.propiedad_id
    ${whereSQL}`;

    console.log(sql, values);


    const results = await db.query(sql, values);
    console.log("RESULTS", results);
    const transformed = results.map((row: payment_view_t) => ({
      ...row,
      fecha: row.fecha ? new Date(row.fecha) : undefined,
      monto: row.monto !== null ? Number(row.monto) : null,
      tipo: row.tipo !== null ? Boolean(row.tipo) : null,
      pagado: row.tipo !== null ? Boolean(row.pagado) : null,
    }));
    console.log("TRNAFORMED", transformed)
    return z.array(payment_view_schema).parse(transformed);
  } catch (err) {
    console.log(err)
    throw err;
    //throw new AppError("Error searching for payments", 500, err.me);
  }
}


export async function addPayment(
  payment: payment_form_data_t,
) : Promise<payment_view_t> {

  const keys = Object.keys(payment).filter(k => k !== 'type');
  const values = Object.values(payment);

  const q = `INSERT INTO pagos_t (${keys.join(', ')}) 
              VALUES (${keys.map(() => '?').join(', ')})`;

  const res = await db.query(q, values);


  console.log("addPayment:res", res);
  const okpacket = OkPacket.parse(res);
  if (okpacket.affectedRows === 1) {
    const payment = await searchPayments({id: okpacket.insertId});
    console.log(payment);
    return payment[0];
  }
  throw UnexpectedError();
}

export async function updatePayment(payment: payment_form_data_t) {
  if (payment.id === undefined) throw InvalidFormDataError();
  const keys = zodKeys(payment_form_data_schema);
  const values = keys.map((k: string) => payment[k as keyof payment_form_data_t]) as SQLParam[];

  const q = `UPDATE users_t SET ${keys.map((k: string) => `${k} = ?`).join(', ')}
              WHERE id = ?`;

  const res = await db.query(q, [...values, payment.id!]);
  const okpacket = OkPacket.parse(res);

  if (okpacket.affectedRows == 1) {
    const payment = await searchPayments({id: okpacket.insertId});
    return payment[0];
  }
}

export async function deletePayment(pId: number): Promise<void> {
  const q = `
    DELETE FROM pagos_t WHERE id = ?   
  `
  try {
    const res = await db.query(q, [pId]);
    const okpacket = OkPacket.parse(res);
    if (okpacket.affectedRows === 1) {
      return
    } else
      throw NotModifiedError();
  } catch(e) {
    if (e instanceof z.ZodError) {
      throw convertZodError(e);
    }
  }
}
