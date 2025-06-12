import { 
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

    const json = await res.json();
    const parsed_res = response_schema(z.array(payment_view_schema)).parse(json);
    return parsed_res.data!;
  } catch (e) {
    console.log(e);
    if (e instanceof z.ZodError)
      throw new AppError(
        "FAILED_PARSE", -1, "Respuesta inválida del servidor (FAILED_TO_PARSE)"
      );
    throw new AppError("UNKNOWN_ERROR", -1, "Error desconocido");
  }
}

