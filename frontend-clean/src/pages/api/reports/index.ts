import type { NextApiRequest, NextApiResponse } from "next";
import { AppErrorResponse, handleZodError, SuccessTemplate } from "@/lib/backend/messages";
import { AppError } from "@/utils/errors";
import { addReport, getReports } from "@/lib/backend/reports"; // <-- Implement this!
import { report_upload_schema } from "@/types"; // See previous answer's schema!
import z from "zod";
import formidable, { File as FormidableFile } from "formidable";
import { fileURLToPath } from "url";
import path from "path";
import fs from 'node:fs';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};


//Finding the present working directory. We need this at while saving the file in server. 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname + '/uploads');


// Helper to parse form with formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize:16 * 1024 * 1024,
      uploadDir: uploadDir,
      keepExtensions: true,
      allowEmptyFiles: false,
    }); // 16MB
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      // Get all reports, optionally filter by user_id
      try {
        const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;
        const reports = await getReports(user_id);
        return res.status(200).json(SuccessTemplate(reports, "Report list"));
      } catch (err) {
        if (err instanceof AppError)
          return AppErrorResponse(res, err);
        else
          return res.status(500).json({ error: "Unexpected server error", detail: String(err) });
      }
    }

    case "POST": {
      const contentType = req.headers["content-type"] || "";

      if (!contentType.includes("multipart/form-data")) {
        return res.status(400).json({ error: "Invalid content type. Expected multipart/form-data." });
      }
      try {
        const { fields, files } = await parseForm(req);

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, '0777');

        const user_id = Array.isArray(fields.user_id) ? fields.user_id[0] : fields.user_id;
        const pdfFile = files.pdf;
        const file = Array.isArray(pdfFile) ? pdfFile[0] : pdfFile;

        if (file === undefined) {
          return AppErrorResponse(res, new AppError("INVALID_FORM", 500, "Formulario inválido"));
        }

        const buffer = fs.readFileSync(file.filepath);
        fs.rm(file.filepath, ()=>{});

        const result = await addReport({
          user_id: Number(user_id),
          pdfBuffer: buffer,
          filename: file.originalFilename || file.newFilename,
          mimetype: file.mimetype!,
        });

        return res.status(200).json(SuccessTemplate(result, "El reporte fue subido correctamente"));
      } catch (err) {
        if (err instanceof z.ZodError)
          return handleZodError(err, res);
        else if (err instanceof AppError)
          return AppErrorResponse(res, err);
        else
          return res.status(500).json({ error: "Unexpected server error", detail: String(err) });
      }
    }

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }}
