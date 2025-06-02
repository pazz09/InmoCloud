// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, getUser, getUsersFiltered, } from "@/backend/users"
import  { Roles, user_add_schema, user_edit_schema, user_safe_schema, user_safe_t, user_t, UserRoleEnum } from "@/backend/types"
import { getToken, verifyToken, withAuth } from "@/backend/auth";
import { ErrorTemplate, handleZodError } from "@/backend/messages";
import z from "zod";
import { TokenExpiredError } from "jsonwebtoken";


function sanitizeUser(user: user_t): user_safe_t {
  const { passwordHash, ...rest } = user;
  return user_safe_schema.parse({ ...rest, type: "safe" });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {



  switch (req.method) {
    case "POST": {  // Should be: Upload user
      withAuth(
        async (req: NextApiRequest, res: NextApiResponse) => {
          let udata = null;
          try {
            const token = getToken(req);
            udata = verifyToken(token);

          } catch (err) {
            if (err instanceof z.ZodError) {
              res.status(400).json(ErrorTemplate("unauthorized"));
            } else if (err instanceof TokenExpiredError) {
              res.status(400).json(ErrorTemplate("expired_token"));
            } else {
              console.log(err);
            }
          }
          // Only admins or the user themselves can update the user
          if (!udata)
            return res.status(400).json(ErrorTemplate("unauthorized"));
          const isAdmin = udata.role === Roles.ADMINISTRADOR;

          // if (!isAdmin && !isSelf) {
          //   return res.status(403).json(ErrorTemplate('No autorizado para actualizar este usuario.'));
          // }

          // Define the expected payload schema

          console.log("reqbody", req.body)

          const parsedBody = user_edit_schema.safeParse(req.body);

          if (!parsedBody.success) {
            console.log(parsedBody.error);
            handleZodError(parsedBody.error, res);
          }

          const { name, rut, role, passwordHash } = parsedBody.data!;


          try {

            // Only admins can change roles
            const newUser = {
              name,
              rut,
              role,
              passwordHash,
              type: "full"
            };

            // Persist the updated user to the DB
            let user = null;
            try {
              user = await addUser(user_add_schema.parse(newUser)); // You should implement this
            } catch (err) {
              res.status(400).json(ErrorTemplate((err as Error).message));
              if (err instanceof z.ZodError) {
                res.status(400).json(ErrorTemplate("invalid-data"));
              }
            }

            res.status(200).json({
              status: 'success',
              message: `Usuario creado correctamente.`,
              data: user,
            });
          } catch (err) {
            if ((err as Error).message === 'user_not_found') {
              res.status(404).json(ErrorTemplate('user_not_found'));
            }
            throw err;
          }

        }, [Roles.CORREDOR, Roles.ADMINISTRADOR])(req, res);
    }


    default:
      return res.status(405).json({ error: "method_not_allowed" });
  }

}
