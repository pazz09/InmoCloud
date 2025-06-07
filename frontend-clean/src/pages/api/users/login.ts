import type { NextApiRequest, NextApiResponse } from "next";
import { login } from '@/backend/users';
import { login_schema, login_t, response_login_t } from "@/backend/types";
import { handleZodError, AppErrorResponse } from "@/backend/messages";
import { AppError, convertZodError, UnexpectedError } from "@/backend/errors";
import z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      try {
        // 🔍 Validate request body
        const body: login_t = login_schema.parse(req.body);

        // 🔐 Execute business logic
        const { user, token } = await login(body.rut, body.password);

        // ✅ Send success response
        return res.status(200).json({
          status: "success",
          data: { user, token },
        });

      } catch (e: unknown) {
        console.error("API Error: ", e);
        if (e instanceof z.ZodError) {
          const appErr = convertZodError(e);
          return res.status(appErr.statusCode).json({
            status: "error",
            message: appErr.message,
            code: appErr.code, // Optional: only include if your frontend uses it
          });
        } else if (e instanceof AppError) {
          return AppErrorResponse(res, e);

        }
        return res.status(500).json({
          status: "error",
          message: "Error interno del servidor",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

    default:
      return res.status(405).json({
        status: "error",
        message: "Método no permitido",
        code: "METHOD_NOT_ALLOWED",
      });
  }
}