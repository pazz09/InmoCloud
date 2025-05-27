// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { login } from '@/backend/users'
import { user_t } from "@/backend/types";


type LoginBody = {
  rut: string;
  password: string;
}

type LoginResponse = {
  token?: string,
  error?: string;
  user?: user_t;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  switch(req.method) {
    case 'POST': 

      const body: LoginBody = req.body;
      try {
        const {user, token} = await login(body.rut, body.password);
        res.status(200).json({user, token});
      } catch (e: unknown) {
        const err = e as Error;
        res.status(500) .json({error: err.message})
      }
      break;

    default:
      res.status(200).json({});
  }
}
