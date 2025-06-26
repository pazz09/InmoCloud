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
    id: (result as any).insertId,
    user_id,
  };
}

// Optionally: fetch report for download or preview
export async function getReport(reportId: number) {
  const [rows] = await db.query(
    "SELECT id, user_id, pdf_blob, created_at FROM reports_t WHERE id = ?",
    [reportId]
  );
  if (!Array.isArray(rows) || rows.length === 0)
    throw new Error("Report not found");
  return rows[0];
}
