import { JsonWebTokenError } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next'
import z, { ZodNull } from 'zod'

import { getToken, verifyToken } from '@/backend/auth';
import { ErrorTemplate, handleZodError } from '@/backend/messages';
import { response_t, Roles, user_role_enum, user_role_enum_t } from '@/backend/types'
import { getUser } from '@/backend/users';
import { assert } from 'console';

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
      return res.status(400).json(ErrorTemplate('ID inválido'));
    }

    /* Parses the idRaw string,
     * Validates it's an integer, 
     * Ensures it's non-negative (optional but often useful),
     * Uses Zod the way it's intended with z.preprocess.
     */

    const parsedId = z.preprocess(
      (val) => Number.parseInt(val as string),
        z.number().int().nonnegative()
    ).parse(idRaw);

    const isAdmin = udata.role === Roles.ADMINISTRADOR;
    const isCorredor = udata.role === user_role_enum.parse('Corredor');

    const isRegularUser = udata.role === Roles.PROPIETARIO || 
      udata.role === Roles.ARRENDATARIO;

    switch (req.method) {
      case 'GET': {
        const allowedRoles: user_role_enum_t[] = [
          Roles.ADMINISTRADOR,
          Roles.CORREDOR,
        ];

        const isSelf = udata.id === parsedId; // Es su perfil?
        const isAllowedRole = allowedRoles.includes(udata.role); // Tiene permiso

        // Si no se es ni admin. ni corredor, y se quiere visualizar la 
        // cuenta de otro usuario, error.
        if (!isSelf && !isAllowedRole)
          return res.status(403).json(ErrorTemplate('Acceso denegado'));


        try {
          const user = await getUser(parsedId);

          const targetIsAdmin = user.role === Roles.ADMINISTRADOR;
          const targetIsCorredor = user.role === Roles.CORREDOR;


          // Si se quiere ver un admin y no se es admin (ni corredor), error.
          if (targetIsAdmin && isRegularUser && !isSelf) {
            return res.status(403).json(ErrorTemplate('No Autorizado'));
          }

          // Corredores pueden ver admins o corredores, pero sin ver el passwordHash
          if ((targetIsAdmin || targetIsCorredor) && isCorredor && !isSelf) {
            const { passwordHash, ...safeUser } = user;
            return res.status(200).json({ status: 'success', data: safeUser });
          }

          assert(isAdmin || isCorredor);
          return res.status(200).json({ status: 'success', data: user });
        } catch (err) {
          if ((err as Error).message === 'user_not_found') {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
          }
          throw err; // fallback to outer catch
        }
      }

      case 'PUT': {
        // Update logic goes here
        return res.status(200).json({ status: 'success', message: `Usuario ${parsedId} actualizado.` });
      }

      case 'DELETE': {
        // Delete logic goes here
        return res.status(200).json({ status: 'success', message: `Eliminado usuario con ID: ${parsedId}.` });
      }

      default:
        return res.status(405).json(ErrorTemplate(`Método ${req.method} no permitido`));
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return handleZodError(err, res);
    }
    else if (err instanceof JsonWebTokenError) {
      return res.status(405).json(ErrorTemplate("Tóken inválido"));
    }
    console.error('Unhandled error:', err);
    return res.status(500).json(ErrorTemplate('Error interno del servidor'));
  }
}


