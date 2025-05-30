import { verify, sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { token_schema, token_t } from './types';
import z from 'zod';

export const getToken = (req: NextApiRequest): string => {
    const safe_token = z.string({required_error: "El Token es obligatorio"})
      .parse(req.headers.authorization);

    return safe_token.split(' ')[1];
}



const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => void,
  allowedRoles: string[] = []
)  {
  // console.log("withAuth start");
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = getToken(req);
    try {
      const user = token ? verifyToken(token) : null;

      if (!user)
        return res.status(401).json({'error': 'Unauthorized'})
      if (allowedRoles.length && !allowedRoles.includes(user.role)) 
        return res.status(403).json({'error': 'Forbidden'})
      
    } catch (err) {
      if (err instanceof Error) {
        if ((err as Error).name == "TokenExpiredError") {
          return res.status(401).json({"error": "Token expiró"});
        }
      }
    }




    return handler(req, res);

  }

}

export function verifyToken(token: string) : token_t {
    const payload = verify(token, JWT_SECRET);
    return token_schema.parse(payload);
}

export function generateToken(payload: token_t): string {
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
