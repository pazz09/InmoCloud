import z  from "zod";
import { response_t } from "./types";
import { NextApiResponse } from "next";

export const NotAllowedMethodResponse: response_t<z.ZodNull> = {
  status: "error",
  message: "Método no permitido"
}

export function handleZodError(e: unknown, res: NextApiResponse<response_t<z.ZodAny>>) {
  if (e instanceof z.ZodError) {
    const mensaje = e.errors.map(err => err.message).join('. ') + '.';
    return res.status(400).json({ status: "error", message: mensaje });
  }
}


export const ErrorTemplate = (message: string): response_t<z.ZodNull> => ({
  status: "error",
  message,
});
