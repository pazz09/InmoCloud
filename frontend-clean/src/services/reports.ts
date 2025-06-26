import { AppError } from "@/utils/errors";
import { response_schema, error_response_schema, report_t, report_view_t } from "@/types";
import { OkPacket } from "@/types";
import z from "zod";


const uploadReponse = z.object({
  id: z.union([z.string(), z.number()]).transform((val) =>
    typeof val === 'string' ? Number(val) : val
  ),
  user_id: z.number(),
});

/**
 * Upload a PDF report for a given user.
 *
 * @param user_id - ID of the user the report belongs to.
 * @param file - The PDF file to upload (from an input element or drag-drop).
 * @param token - Authorization token (Bearer).
 * @returns Parsed response containing the upload result.
 */
export async function uploadReport(user_id: number, file: File, token: string) {
  const formData = new FormData();
  formData.append("user_id", String(user_id));
  formData.append("pdf", file);

  const res = await fetch("/api/reports", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // NOTE: Do not set Content-Type, browser handles it with correct boundary
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    console.log(json);
    const parsed = error_response_schema(uploadReponse).safeParse(json);
    if (parsed.success) {
      throw new AppError(parsed.data.code, res.status, parsed.data.message);
    } else {
      throw new AppError("UPLOAD_ERROR", res.status, json?.message || "Error al subir el reporte");
    }
  }

  console.log(json)
  const parsed = response_schema(uploadReponse).safeParse(json);
  if (!parsed.success) {
    throw new AppError("PARSE_ERROR", res.status, "Respuesta inesperada del servidor");
  }

  return parsed.data;
}

// Fetch all reports (GET /api/reports)
export async function getReports(token: string, user_id?: number): Promise<report_view_t[]> {
  let url = "/api/reports";
  if (user_id !== undefined) {
    url += `?user_id=${user_id}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    const parsed = error_response_schema(z.any()).safeParse(json);
    if (parsed.success) throw new AppError(parsed.data.code, res.status, parsed.data.message);
    throw new AppError("FETCH_ERROR", res.status, json?.message || "Error al obtener reportes");
  }
  // Your backend wraps in { data, message }
  return json.data as report_view_t[];
}

// Fetch/download a single report (GET /api/report/[id])
export async function getReport(id: number, token: string): Promise<Blob> {
  const res = await fetch(`/api/reports/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let json;
    try {
      json = await res.json();
    } catch {
      json = {};
    }
    const parsed = error_response_schema(z.any()).safeParse(json);
    if (parsed.success) throw new AppError(parsed.data.code, res.status, parsed.data.message);
    throw new AppError("FETCH_ERROR", res.status, json?.message || "No se pudo descargar el reporte");
  }
  // This returns a PDF Blob file
  return await res.blob();
}

// Delete a report (DELETE /api/report/[id])
export async function deleteReport(id: number, token: string): Promise<{ success: boolean; id: number }> {
  const res = await fetch(`/api/reports/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    const parsed = error_response_schema(z.any()).safeParse(json);
    if (parsed.success) throw new AppError(parsed.data.code, res.status, parsed.data.message);
    throw new AppError("DELETE_ERROR", res.status, json?.message || "No se pudo borrar el reporte");
  }
  return json;
}
