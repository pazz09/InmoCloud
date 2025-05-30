// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, getUsers, updateUser } from "@/backend/users"
import  { response_t, Roles, user_add_schema, empty_response_t, user_schema }  from "@/backend/types"
import { withAuth } from "@/backend/auth"
import z from "zod";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<response_t<z.AnyZodObject>>
) {
  
  switch (req.method) {
    case 'POST':
      withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
        const user = user_add_schema.parse(req.body);
        if (!user) return res.status

        addUser(user).then((data: empty_response_t)=> {
          res.status(200).json(data);

        });
      }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
      break;

    case 'PUT':
      withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
        const user = user_schema.parse(req.body);
        if (!user) return res.status

        updateUser(user).then((data: empty_response_t)=> {
          res.status(200).json(data);

        });
      }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
      break;
    case 'GET':
      withAuth(async (_: NextApiRequest, res: NextApiResponse) => {
        try {
          getUsers().then((data)=> {
            res.status(200).json(data);

          });
        } catch (err) {
          if (err instanceof Error) {
            res.status(500).json({error: err.message});
          }

        }
      }, [Roles.ADMINISTRADOR, Roles.CORREDOR, Roles.PROPIETARIO, Roles.ARRENDATARIO])
      (req, res);
      break;

    case '':



  }


}
