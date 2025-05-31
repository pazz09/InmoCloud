// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getUsersFiltered, } from "@/backend/users"
import  { Roles, user_t, UserRoleEnum } from "@/backend/types"
import { getToken, verifyToken, withAuth } from "@/backend/auth";



export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return withAuth(
        async (req: NextApiRequest, res: NextApiResponse) => {

          const token = getToken(req);
          const token_data = verifyToken(token);


          const { role } = token_data;
          console.log("Requester role:", role)
          const filters = req.body || {};

          // Get users (with or without filters)
          const users = await getUsersFiltered(filters);

          // Remove passwordHash from ADMINISTRADOR users
          const sanitized = users.map((user: user_t) => {
            console.log("Iterating user", user.name)
            if (user.role === UserRoleEnum.ADMINISTRADOR || (role === user.role)) {
              console.log("Is common, is match");
              const { passwordHash, ...rest } = user;
              return rest;
            }
            return user;
          });

          return res.status(200).json(sanitized);
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR] // Auth required, any role allowed
      )(req, res);

    default:
      return res.status(405).json({ error: "method_not_allowed" });
  }
}
