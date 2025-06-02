import { getToken, verifyToken, withAuth } from "@/backend/auth";
import { ErrorTemplate } from "@/backend/messages";
import { empty_response_t, Roles, user_safe_schema, user_safe_t, user_t, UserRoleEnum } from "@/backend/types";
import { getUsersFiltered } from "@/backend/users";
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
              res.status(400).json(ErrorTemplate("unauthorized"));
            } else if (err instanceof TokenExpiredError) {
              res.status(400).json(ErrorTemplate("expired_token"));
            }
          }

          // const { role } = token_data;
          const filters = req.body || {};

          // Get users (with or without filters)
          const users = await getUsersFiltered(filters);

          // Use safe schema to sanitize sensitive users
          const sanitized = users.map((user: user_t) => {
            const isRestricted = 
              user.role === UserRoleEnum.ADMINISTRADOR ||
              (user.role === UserRoleEnum.CORREDOR && token_data && token_data.role === UserRoleEnum.CORREDOR);

            if (isRestricted)  {
              return sanitizeUser(user); // ✅ Strip passwordHash, enforce schema
            }

            // Return full user with passwordHash if allowed
            return user;
          });

          return res.status(200).json(sanitized);
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR]
      )(req, res);
    default:
    res.status(400).json(ErrorTemplate("method_not_allowed"));
  }
}

function sanitizeUser(user: user_t): user_safe_t {
  const { passwordHash, ...rest } = user;
  return user_safe_schema.parse({ ...rest, type: "safe" });
}
