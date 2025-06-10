import { getToken, verifyToken, withAuth } from "@/backend/auth";
import { convertZodError, MethodNotAllowedError, UnexpectedError } from "@/backend/errors";
import { AppErrorResponse, SuccessTemplate } from "@/backend/messages";
import { Roles, user_search_schema } from "@/types";
import { searchClients } from "@/backend/clients";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

// POST /users/clients/search
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return AppErrorResponse(res, MethodNotAllowedError());

  return withAuth(async (req, res) => {
    try {
      const filters = user_search_schema.parse(req.body || {});
      const token = getToken(req);
      const user = verifyToken(token);
      const clients = await searchClients(filters);
      return res.status(200).json(SuccessTemplate(clients, "Lista de clientes filtrada correctamente"));
    } catch (err) {
      console.error("Error in /clients/search", err);
      if (err instanceof z.ZodError) return AppErrorResponse(res, convertZodError(err));
      return AppErrorResponse(res, UnexpectedError());
    }
  }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
}
