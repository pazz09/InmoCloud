// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { login } from '@/backend/users'
import { response_schema, response_t, token_schema, user_schema, user_t } from "@/backend/types";
import z from "zod";
import { userAgentFromString } from "next/server";
import { handleZodError } from "@/backend/messages";



const login_schema = z.object({
  rut: z.string({required_error: "El RUT es obligatorio"}),
  password: z.string({required_error: "La contraseña es obligatoria"})
});

type login_t = z.infer<typeof login_schema>;

const login_response_schema = z.object({
  user: user_schema,
  token: z.string({required_error: 
          "El token es necesario para acceder a la funcionalidad del sistema"}),
});

const response_login = response_schema(login_response_schema);
type response_login_t = z.infer<typeof response_login>;



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
