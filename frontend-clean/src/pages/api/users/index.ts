// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { addUser, getUsers } from "@/backend/users"
import  { response_t, user_add_schema, user_schema, UserRoleEnum }  from "@/backend/types"
import { withAuth } from "@/backend/auth"
import z from "zod";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<response_t<z.AnyZodObject>>
) {
  
  switch (req.method) {
    case 'PUT':
      withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
        const user = user_add_schema.parse(req.body);
        if (!user) return res.status

        addUser(user).then((data: response_t<z.ZodNull>)=> {
          res.status(200).json(data);

        });
      }, [UserRoleEnum.Administrador, UserRoleEnum.Corredor])(req, res);
      break;

      
    case 'GET':
      console.log("got get");
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
      }, [UserRoleEnum.Administrador, UserRoleEnum.Corredor])(req, res);
      break;

    case '':



  }


}
