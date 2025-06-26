import { OkPacket_t, SQLParam } from "@/types";
import db from "./db";

interface AddReportInput {
  user_id: number;
  pdfBuffer: Buffer;
  filename?: string; // Not used in DB currently, but handy to keep
  mimetype?: string; // Ideally, check against this.
}

// Adds a new report, returns minimal info (you can expand as needed)
export async function addReport(input: AddReportInput) {
  const { user_id, pdfBuffer } = input;

  // Insert into reports_t
  const result = await db.query(
    "INSERT INTO reports_t (user_id, pdf_blob) VALUES (?, ?)",
    [user_id, pdfBuffer]
  );

  // (You can return inserted id and whatever you choose)
  return {
    id: (result as OkPacket_t).insertId,
    user_id,
  };
}

// Optionally: fetch report for download or preview
export async function getReport(reportId: number) {
  const rows = await db.query(
    "SELECT id, user_id, pdf_blob, created_at FROM reports_t WHERE id = ?",
    [reportId]
  );
  if (!Array.isArray(rows) || rows.length === 0)
    throw new Error("Report not found");
  return rows[0];
}

// Fetch all reports, optionally filtered by user_id
export async function getReports(user_id?: number) {
  let query = `
    SELECT 
      r.id, 
      r.user_id, 
      CONCAT(u.nombre, ' ', u.apellidos) AS user_name,
      r.created_at
    FROM reports_t r
    JOIN users_t u ON r.user_id = u.id
  `;
  const params: SQLParam[] = [];

  if (user_id !== undefined) {
    query += " WHERE r.user_id = ?";
    params.push(user_id);
  }

  query += " ORDER BY r.created_at DESC";

  console.log(query)
  const rows = await db.query(query, params);

  return rows;
}

// Deletes a report by id
export async function deleteReport(reportId: number): Promise<{ deleted: boolean; id: number }> {
  const result = await db.query(
    "DELETE FROM reports_t WHERE id = ?",
    [reportId]
  );

  // result.affectedRows (usually - check your db lib) indicates rows removed
  const deleted = (result as OkPacket_t).affectedRows > 0;

  return { deleted, id: reportId };
}
