import { error_response_schema, error_response_t, property_form_add_t, property_form_arrendatario_t, property_form_delete_t, property_form_edit_t, property_search_t, property_view_schema, property_view_t, response_schema } from "@/types";
import { AppError } from "@/utils/errors";
import z from "zod";

export async function fetchProperties(
  token: string, searchParams: property_search_t)
: Promise<property_view_t[]> {

  try {
    const res = await fetch("/api/properties/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(searchParams),
    });
    const json = await res.json();
    const schema = response_schema(z.array(property_view_schema));
    const parsedRes = schema.parse(json);
    if (!res.ok) {
      const error_data = error_response_schema(z.null()).parse(json);
      throw new AppError(error_data.code, res.status, error_data.message);
    }

    return parsedRes.data!;

  } catch (e) {
    console.log(e);
    if (e instanceof z.ZodError) {
      throw new AppError(
        "FAILED_PARSE", -1, "Respuesta inválida del servidor (FAILED_TO_PARSE)"
      )
    }
    throw new AppError("UNKNOWN_ERROR", -1, "Error desconocido");
  }
}

export async function createProperty(values: property_form_add_t, token: string) {
  const res = await fetch("/api/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();
  
  try {
    const response = response_schema(property_view_schema).parse(json);
    if (res.ok) return response.data;

    const error = response as error_response_t<z.ZodNull>;
    throw new AppError(error.code, res.status, error.message)
  } catch(e) {
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function editProperty(id: number, values: property_form_edit_t, token: string) {
  const res = await fetch(`/api/properties/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();
  
  try {
    const response = response_schema(property_view_schema).parse(json);
    if (res.ok) return response.data;

    const error = response as error_response_t<z.ZodNull>;
    throw new AppError(error.code, res.status, error.message)
  } catch(e) {
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function deleteProperty(id: number, token: string) {
  const res = await fetch(`/api/properties/${id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    }
  });

  const json = await res.json();
  
  try {
    if (res.ok) return;

    const error = json as error_response_t<z.ZodNull>;
    throw new AppError(error.code, res.status, error.message);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}

export async function viewProperty(id: number, token: string) {
  const searchParams = {id}
  const property = await fetchProperties(token, searchParams);
  return property[0];
}

export async function asignarArrendatario(id: number, values: property_form_arrendatario_t, token: string) {
  const res = await fetch(`/api/properties/${id}/arrendatario`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();
  
  try {
    const response = response_schema(property_view_schema).parse(json);
    if (res.ok) return response.data;

    const error = response as error_response_t<z.ZodNull>;
    throw new AppError(error.code, res.status, error.message);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("FRONTEND_ERROR", res.status, "Respuesta inválida del servidor");
  }
}