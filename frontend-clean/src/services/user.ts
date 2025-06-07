import {
  error_response_schema,
  OkPacket,
  response_schema,
  success_response_schema,
  update_response_schema,
  user_form_data_t,
  users_list_schema
} from "@/types";
import { AppError } from "@/utils/errors";
import { error } from "console";

// CREATE USER
export async function createUser(values: user_form_data_t, token: string) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();

  if (!res.ok) {
    const parsed = error_response_schema(OkPacket).parse(json);
    throw new AppError(parsed.code, res.status, parsed.message);
  }

  const parsed = update_response_schema.parse(json);

  if (parsed.status !== "success") {
    throw new AppError("UNKNOWN_RESPONSE", res.status, parsed.message || "Error desconocido");
  }

  if (parsed.data.affectedRows === 0) {
    throw new AppError("NO_USER_CREATED", 400, "No se creó ningún usuario. Verifica que los datos sean correctos.");
  }

  return parsed;
}


// EDIT USER
export async function editUser(id: number, values: user_form_data_t, token: string) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  const json = await res.json();

  if (!res.ok) {
    const parsed = error_response_schema(OkPacket).parse(json);
    throw new AppError(parsed.code, res.status, parsed.message);
  }

  const parsed = response_schema(OkPacket).parse(json);
  return parsed;
}


export async function deleteUser(id: number, token: string) {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  try {
    const json = await res.json()
    if (!res.ok) {
      const parsed_error = error_response_schema(OkPacket).parse(json);
      const appErr = new AppError(parsed_error.code, res.status, parsed_error.message);
      throw appErr;
    }

    const parsed = success_response_schema(OkPacket).parse(json);
    return parsed;
  } catch (e) {
    console.log("[Frontend] Ocurrió un error", e);
    throw e;
  }
}

export async function fetchUsers(
  token: string,
  searchParams: Record<string, string> = {}
) {

  const res = await fetch('/api/users/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(searchParams),
  });

  if (!res.ok) {
    const errorData = await res.json(); // You may want to log or throw this
    throw new Error('No autorizado');
  }

  const json = await res.json();
  const parsed = response_schema(users_list_schema).safeParse(json);

  if (!parsed.success) {
    throw new Error('Error al validar los datos de usuarios.');
  }

  return parsed.data.data!;
};
