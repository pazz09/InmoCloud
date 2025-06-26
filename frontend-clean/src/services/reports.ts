import { AppError } from "@/utils/errors";
import { response_schema, error_response_schema } from "@/types";
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
