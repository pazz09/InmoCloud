
import { convertZodError, MethodNotAllowedError, UnexpectedError } from "@/lib/backend/errors";
import { AppErrorResponse, SuccessTemplate } from "@/lib/backend/messages";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken, verifyToken, withAuth } from "@/lib/backend/auth";
import { payment_search_params, Roles, user_search_schema } from "@/types";
import { searchClients } from "@/lib/backend/users";
import z from "zod";
import { searchPayments } from "@/lib/backend/payments";

// POST /users/clients/search
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return AppErrorResponse(res, MethodNotAllowedError());

  return withAuth(async (req, res) => {
    try {
      const filters = payment_search_params.parse(req.body || {});
      const token = getToken(req);
      const user = verifyToken(token);
      const payments = await searchPayments(filters);
      return res.status(200).json(SuccessTemplate(payments, "Lista de pagos filtrada correctamente"));
    } catch (err) {
      console.error("Error in /clients/search", err);
      if (err instanceof z.ZodError) return AppErrorResponse(res, convertZodError(err));
      return AppErrorResponse(res, UnexpectedError());
    }
  }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
}
