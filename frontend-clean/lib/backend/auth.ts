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
  handler: (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>,
  allowedRoles: string[] = []
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      console.log("Checking auth", allowedRoles);

      let token;
      try {
        token = getToken(req);
        console.log("token:", token);
      } catch (err) {
        console.error("Error getting token:", err);
        return res.status(400).json({ error: "missing_token"});
      }

      const user = token ? verifyToken(token) : null;

      if (!user) {
        return res.status(401).json({ error: "unauthorized" });
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "forbidden" });
      }

      // // Optionally attach user info to request
      // (req as any).user = user;

      return await handler(req, res);

    } catch (err) {
      console.error("withAuth error:", err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "missing_token" });
      }

      if ((err as Error)?.name === "TokenExpiredError") {
        return res.status(401).json({ error: "expired_token" });
      }

      // Catch-all error return
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
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
