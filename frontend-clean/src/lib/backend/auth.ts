import { verify, sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { response_t, Roles, token_schema, token_t, user_role_enum_t, UserRoleEnum } from '@/types';
import z from 'zod';
import { AppError, convertZodError, ForbiddenError, MissingTokenError, UnauthorizedError } from './errors';
import { AppErrorResponse } from './messages';
import App from 'next/app';

export const getToken = (req: NextApiRequest): string => {
    const safe_token = z.string({required_error: "El Token es obligatorio"})
      .parse(req.headers.authorization);

    return safe_token.split(' ')[1];
}


export function isHigherRole(currentRole: user_role_enum_t, targetRole: user_role_enum_t): boolean {
  return currentRole > targetRole;
}


const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>,
  allowedRoles: string[] = []
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // console.log("Checking auth", allowedRoles);

      let token;
      let user;
      try {
        token = getToken(req);
        // console.log("token:", token);
        user = token ? verifyToken(token) : null;
      } catch (err) {
        console.log(err);
        console.error("Error getting token:", err);
        return AppErrorResponse(res, MissingTokenError());
      }


      if (!user) {
        return AppErrorResponse(res, UnauthorizedError());
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return AppErrorResponse(res, ForbiddenError());
      }

      // // Optionally attach user info to request
      // (req as any).user = user;

      return await handler(req, res);

    } catch (err) {
      console.error("withAuth error:", err);

      if (err instanceof z.ZodError) {
        const appError = convertZodError(err);
        return AppErrorResponse(res, appError);
      }

      if ((err as Error)?.name === "TokenExpiredError") {
        return AppErrorResponse(res, UnauthorizedError());
      }

      // Catch-all error return
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

// Returns safe/parsed token_t data
export function verifyToken(token: string) : token_t {
    const payload = verify(token, JWT_SECRET);
    return token_schema.parse(payload);
}

export function generateToken(payload: token_t): string {

  console.log('expiresIn:', Number.parseInt(JWT_EXPIRES_IN));
  return sign(payload, JWT_SECRET, { expiresIn: Number.parseInt(JWT_EXPIRES_IN)});
}
// import type { NextApiRequest, NextApiResponse, NextApi } from "next";
// import { verifyToken } from './auth'
// export function withAuth(
//   handler: Function,
//   allowedRoles: string[] = []
// ) {
//   return async (req: NextApiRequest) => {
//     const authHeader = req.headers.get("authorization");
//     const token = authHeader?.split(' ')[1];
//     const user  = token ? verifyToken(token) : null;
//   }
// }
