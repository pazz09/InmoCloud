// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { login } from '@/backend/users'
import { login_schema, login_t, response_login_t } from "@/backend/types";
// import z from "zod";
// import { userAgentFromString } from "next/server";
import { handleZodError } from "@/backend/messages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<response_login_t>
) {
  switch(req.method) {
    case 'POST': 
      try {
        const body: login_t = login_schema.parse(req.body);
        const {user, token} = await login(body.rut, body.password);
        res.status(200).json({status: "success", data: {user, token}});
      } catch (e: unknown) {
        handleZodError(e, res);
        const err = e as Error;
        res.status(500) .json({status: "error", message: err.message})
      }
      break;

    default:
      res.status(405).json({"status": "error", message: "Metódo no permitido"});
  }
}
