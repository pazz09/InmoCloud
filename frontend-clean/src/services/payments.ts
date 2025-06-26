import { 
    error_response_schema,
  error_response_t,
  payment_form_data_t,
  payment_search_params_t,
  payment_view_schema, 
  payment_view_t, 
  response_schema} from "@/types";

import { AppError } from "@/utils/errors";
import z from "zod";

export async function fetchPayments(
  token: string,
  searchParams: payment_search_params_t
): Promise<payment_view_t[]> { 

  try { 
    const res = await fetch("/api/payments/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(searchParams)
    });

    const json  = await res.json();



    if (!res.ok) {
      const error_data = error_response_schema(z.null()).parse(json);
      throw new AppError(error_data.code, res.status, error_data.message);
    }

    const transformed = {
      ...json,
      data: json.data.map((item: payment_view_t) => ({...item, fecha: new Date(item.fecha)}))
    };

    console.log(transformed);
    const parsed_res = response_schema(z.array(payment_view_schema)).parse(transformed);


    return parsed_res.data!;


  } catch (e) {
    console.log(e);
    if (e instanceof z.ZodError)
      throw new AppError(
        "FAILED_PARSE", -1, "Respuesta inválida del servidor (FAILED_TO_PARSE)"
      );

    else if (e instanceof AppError) {
      throw e;
    }

    throw new AppError("UNKNOWN_ERROR", -1, "Error desconocido");
  }
}

export async function createPayment(values: payment_form_data_t, token: string) {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();
  
  try {
    const json_corrected = {...json, data: {...json.data, fecha: new Date(json.data.fecha)}};
    const response = response_schema(payment_view_schema).parse(json_corrected);
    console.log(response.data)
    if (res.ok) return response.data;

    const error = response as error_response_t<z.ZodAny>;
    console.log(error)
    throw new AppError(error.code, res.status, error.message)
  } catch(e) {
    console.log("invalid:C", e)
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function editPayment(id: number, values: payment_form_data_t, token: string) {
  const res = await fetch(`/api/payments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();
  const withFecha = {...json, data: {...json.data, fecha: new Date(json.data.fecha)}};
  
  try {
    const response = response_schema(payment_view_schema).parse(withFecha);
    if (res.ok) return response.data;

    const error = response as error_response_t<z.ZodNull>;
    throw new AppError(error.code, res.status, error.message)
  } catch(e) {
    console.log(e)
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function deletePayment(id: number, token: string) {
  const res = await fetch(`/api/payments/${id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  
  try {
    if (res.ok) return;

    const error = json as error_response_t<z.ZodNull>;

    throw new AppError(error.code, res.status, error.message)
  } catch(e) {
    console.log(e)
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function viewPayment(id: number, token: string) {
  const searchParams = {id}
  const payment = await fetchPayments(token, searchParams);
  return payment[0];
}
