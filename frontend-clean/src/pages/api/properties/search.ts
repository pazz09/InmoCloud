
import { convertZodError, MethodNotAllowedError, UnexpectedError } from "@/lib/backend/errors";
import { AppErrorResponse, SuccessTemplate } from "@/lib/backend/messages";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken, verifyToken, withAuth } from "@/lib/backend/auth";
import { payment_search_params, property_search_schema, Roles, user_search_schema } from "@/types";
//import { searchClients } from "@/lib/backend/users";
import z from "zod";
import { searchProperties } from "@/lib/backend/properties";

// POST /users/clients/search
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return AppErrorResponse(res, MethodNotAllowedError());

  return withAuth(async (req, res) => {
    try {
      const filters = property_search_schema.parse(req.body || {});
      const token = getToken(req);
      const user = verifyToken(token);
      const properties = await searchProperties(filters);
      return res.status(200).json(SuccessTemplate(properties, "Lista de propiedades filtrada correctamente"));
    } catch (err) {
      console.error("Error in /clients/search", err);
      if (err instanceof z.ZodError) return AppErrorResponse(res, convertZodError(err));
      return AppErrorResponse(res, UnexpectedError());
    }
  }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
}
