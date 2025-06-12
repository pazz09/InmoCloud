// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, } from "@/backend/users"
import  { Roles, user_add_schema, user_safe_schema, user_safe_t, user_t } from "@/types"
import { getToken, verifyToken, withAuth } from "@/backend/auth";
import { AppErrorResponse, handleZodError } from "@/backend/messages";
import z from "zod";
import { TokenExpiredError } from "jsonwebtoken";
import { convertZodError, InvalidTokenError, MethodNotAllowedError, UnauthorizedError, UnexpectedError, UserNotFoundError, UserParsingError } from "@/backend/errors";


function sanitizeUser(user: user_t): user_safe_t {
  const { passwordHash, ...rest } = user;
  return user_safe_schema.parse({ ...rest, type: "safe" });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method) {
    case "POST": {  // Add User
      withAuth(
        async (req: NextApiRequest, res: NextApiResponse) => {

          // Primero, verificamos que el cuerpo es válido
          console.log("reqbody", req.body)

          const parsedBody = user_add_schema.safeParse(req.body);

          if (!parsedBody.success) {
            console.log(parsedBody.error);
            return AppErrorResponse(res, UserParsingError());
          } 

          try {
            const token = getToken(req);
            const udata = verifyToken(token);
          } catch (err) {
            if (err instanceof z.ZodError) {
              return AppErrorResponse(res, convertZodError(err));
            } else if (err instanceof TokenExpiredError) {
              return AppErrorResponse(res, InvalidTokenError());
            } else {
              console.log(err);
            }
          }

          // Only admins or the user themselves can update the user

          // if (!isAdmin && !isSelf) {
          //   return res.status(403).json(ErrorTemplate('No autorizado para actualizar este usuario.'));
          // }

          // Define the expected payload schema


          const { nombre, apellidos, mail, telefono, rut, role, passwordHash } = parsedBody.data!;

          try {

            // Only admins can change roles
            const newUser = {
              nombre,
              apellidos,
              mail,
              telefono,
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
              console.log(err)
              if (err instanceof z.ZodError) {
                return AppErrorResponse(res, convertZodError(err));
              }
              return AppErrorResponse(res, UnexpectedError());
            }

            return res.status(200).json({
              status: 'success',
              message: `Usuario creado correctamente.`,
              data: user,
            });
          } catch (err) {
            if ((err as Error).message === 'user_not_found') {
              return AppErrorResponse(res, UserNotFoundError());
            }
            throw err;
          }

        }, [Roles.CORREDOR, Roles.ADMINISTRADOR])(req, res);
    }
    break;


    default:
      return AppErrorResponse(res, MethodNotAllowedError());
  }

}
