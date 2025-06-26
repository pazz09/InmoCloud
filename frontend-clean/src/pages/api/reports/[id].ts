import { getReport, deleteReport } from "@/lib/backend/reports";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reportId = Number(req.query.id);

  if (isNaN(reportId)) {
    return res.status(400).json({ error: "Invalid report id" });
  }

  // Handle GET (download/display PDF)
  if (req.method === 'GET') {
    const report = await getReport(reportId);
    if (!report) return res.status(404).json({ error: 'Not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    // If using Buffer, send as Buffer; otherwise, check your DB client handling
    res.send(report.pdf_blob);
    return;
  }

  // Handle DELETE
  if (req.method === 'DELETE') {
    try {
      const result = await deleteReport(reportId);
      if (!result.deleted) return res.status(404).json({ error: "Not found" });
      return res.json({ success: true, id: reportId });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed to delete" });
    }
  }

  // Handle unsupported methods
  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
