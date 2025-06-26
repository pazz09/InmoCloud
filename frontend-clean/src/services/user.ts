import {
  error_response_schema,
  OkPacket,
  response_schema,
  success_response_schema,
  update_response_schema,
  user_form_data_t,
  user_schema,
  user_search_t,
  users_list_schema
} from "@/types";
import { AppError } from "@/utils/errors";
import { error } from "console";
import z from "zod";

// CREATE USER
export async function createUser(values: user_form_data_t, token: string) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  })

  const json = await res.json();

  if (!res.ok) {
    const parsed = error_response_schema(user_schema).parse(json);
    throw new AppError(parsed.code, res.status, parsed.message);
  }

  const parsed = response_schema(user_schema).parse(json);

  if (parsed.status !== "success") {
    throw new AppError("UNKNOWN_RESPONSE", res.status, parsed.message || "Error desconocido");
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

export async function fetchUserList(
  token: string,
  searchParams: user_search_t = {}
) {
  const res = await fetch('/api/users/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(searchParams),
  });

  const json = await res.json();
  const schema = response_schema(users_list_schema)
  const parsedRes = schema.parse(json);
  if (!res.ok) {
    const error_data = error_response_schema(z.null()).parse(json);
    throw new AppError(error_data.code, res.status, error_data.message);
  }

  return parsedRes.data!;
};
