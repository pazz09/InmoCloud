import { getToken, verifyToken, withAuth } from "@/backend/auth";
import { AppError, convertZodError, InvalidTokenError, MethodNotAllowedError, UnexpectedError } from "@/backend/errors";
import { AppErrorResponse, ErrorTemplate, SuccessTemplate } from "@/backend/messages";
import { empty_response_t, Roles, user_safe_schema, user_safe_t, user_search_schema, user_t, UserRoleEnum } from "@/types";
import { getUsers, sanitizeUsers, searchUsers } from "@/backend/users";
import { TokenExpiredError } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

// POST /users/search:  Retorna la lista de usuarios si no hay parámetros, de
// haber, estos son utilizados para la búsqueda
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<empty_response_t>
) {
  switch (req.method) {
    case 'POST':
      return withAuth(
        async (req: NextApiRequest, res: NextApiResponse) => {
          let token_data = null;
          try {
            const token = getToken(req);
            token_data = verifyToken(token);
          } catch (err) {
            if (err instanceof z.ZodError) {
              const appError = convertZodError(err);
              return AppErrorResponse(res, appError);
            } else if (err instanceof TokenExpiredError) {
              return AppErrorResponse(res, InvalidTokenError());
            }
          }

          try {
            const filters = req.body || {};
            const parsedFilters = user_search_schema.parse(filters);
            const users = await searchUsers(parsedFilters);
            
            // Use safe schema to sanitize sensitive users
            const sanitized = sanitizeUsers(token_data!.role, users)
            return res.status(200).json(SuccessTemplate(sanitized, "Lista de usuarios obtenida correctamente"));
          } catch (err) {
            if (err instanceof z.ZodError) {
              console.log(err);
              const appError = convertZodError(err);
              return AppErrorResponse(res, appError);
              }
            console.error("Error inesperado al buscar usuarios:", err);
            return AppErrorResponse(res, UnexpectedError());
          }
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR]
      )(req, res);
    default:
    return AppErrorResponse(res, MethodNotAllowedError());
  }
}

