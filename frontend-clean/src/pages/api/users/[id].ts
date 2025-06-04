import { JsonWebTokenError } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next'
import z, { ZodNull } from 'zod'

import { getToken, isHigherRole, verifyToken } from '@/backend/auth';
import { AppErrorResponse, ErrorTemplate, handleZodError, SuccessTemplate } from '@/backend/messages';
import { OkPacket, response_t, RoleHierarchy, Roles, user_form_data, user_role_enum, user_role_enum_t } from '@/backend/types'
import { deleteUser, getAuthorizedUserView, getUser, updateUser } from '@/backend/users';
import { assert } from 'console';
import { parse } from 'path';
import { ok } from 'assert';
import { AppError, convertZodError, MethodNotAllowedError, SessionExpiredError, UnauthorizedError, UnexpectedError, UserParsingError } from '@/backend/errors';
import App from '@/pages/_app';

async function get(
  req: NextApiRequest,
  res: NextApiResponse<response_t<z.ZodTypeAny>>) 
{

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<response_t<z.ZodTypeAny>>) 
{
  try {
    const token = getToken(req);
    const udata = verifyToken(token);
    const idRaw = req.query.id;

    if (typeof idRaw !== 'string') {
      return res.status(400).json(ErrorTemplate('ID inválido', "INVALID_ID"));
    }

    /* Parses the idRaw string,
     * Validates it's an integer, 
     * Ensures it's non-negative (optional but often useful),
     * Uses Zod the way it's intended with z.preprocess.
     */

    const parsedId = z.preprocess(
      (val) => Number.parseInt(val as string),
        z.number().nonnegative()
    ).parse(idRaw);

    const isAdmin = udata.role === Roles.ADMINISTRADOR;
    const isCorredor = udata.role === user_role_enum.parse('Corredor');

    const isRegularUser = udata.role === Roles.PROPIETARIO || 
      udata.role === Roles.ARRENDATARIO;

    switch (req.method) {
      // Returns the user data (safe or full) for the given ID
      case 'GET': {
        try {
          const self = await getUser(udata.id);

          const target_user = await getAuthorizedUserView(
            {requestingUser: self, targetUserId: parsedId}
          );
        } catch (err) {
          if (err instanceof AppError) {
            return AppErrorResponse(res, err);
          }
          console.error('Error fetching user:', err);
          return AppErrorResponse(res, UnexpectedError())
        }
      }
      // Updates the user data for the given ID and body, returns OkPacket
      case 'PUT': {
        const body = req.body;
        let parsedBody = null;

        try {
          parsedBody = user_form_data.parse(body);
        } catch (err) {
          if (err instanceof z.ZodError) {
            const app_err = convertZodError(err);
            return AppErrorResponse(res, app_err);
          }
          throw err; // or return AppErrorResponse(res, err as AppError);
        }

        const id = parsedId; // ID from query
        const { nombre, apellidos, mail, telefono, rut, role, passwordHash } = parsedBody!;
        const requestingUser = await getUser(udata.id);

        try {
          const targetUser = await getAuthorizedUserView(
            {requestingUser, targetUserId: parsedId});


          const okpacket = await updateUser({
            id,
            nombre,
            apellidos,
            mail,
            telefono,
            rut,
            role,
            passwordHash,
            type: 'full',
          });

          if (okpacket.affectedRows > 0) {
            return res
              .status(200)
              .json(SuccessTemplate<typeof OkPacket>(okpacket, 'Usuario actualizado correctamente'));
          } 
        } catch (err) {
          return AppErrorResponse(res, err as AppError);
        }
      }

      case 'DELETE': {
        try {
          const requestingUser = udata;
          const self = await getUser(requestingUser.id);
          const okpacket = await deleteUser(
            {requestingUser: self, targetUserId: parsedId});

          if (okpacket.affectedRows > 0) {
            return res
              .status(200)
              .json(SuccessTemplate<typeof OkPacket>(okpacket, `Usuario con ID ${parsedId} eliminado correctamente.`));
          } else {
            return AppErrorResponse(res, UnexpectedError());
          }
        } catch (err) {
          if (err instanceof AppError) {
            return AppErrorResponse(res, err);
          }
          console.error("Error deleting user:", err);
          return AppErrorResponse(res, UnexpectedError());
        }
      }

      default:
        return AppErrorResponse(res, MethodNotAllowedError());
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      handleZodError(err, res);
    }
    else if (err instanceof JsonWebTokenError) {
      return AppErrorResponse(res, SessionExpiredError());

    }
    console.error('Unhandled error:', err);
    return AppErrorResponse(res, UnexpectedError());
  }
}


