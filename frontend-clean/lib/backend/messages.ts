import z  from "zod";
import { response_t } from "./types";
import { NextApiResponse } from "next";

// export const NotAllowedMethodResponse: response_t<z.ZodNull> = {
//   status: "error",
//   message: "Método no permitido"
//   code: "METHOD_NOT_ALLOWED"
// }

export function handleZodError(e: unknown, res: NextApiResponse<response_t<z.ZodAny>>) {
  if (e instanceof z.ZodError) {
    const mensaje = e.errors.map(err => err.message).join('. ') + '.';
    return res.status(400).json({ status: "error", message: mensaje, code: "VALIDATION_ERROR" });
  }
}


export const ErrorTemplate = (message: string, code: string): response_t<z.ZodNull> => ({
  status: "error",
  message,
  code
});

export const SuccessTemplate = <T extends z.ZodTypeAny>(data: z.infer<T>, message?: string): response_t<T> => ({
  status: "success",
  data,
  message: message ?? undefined
});

export function AppErrorResponse(res: NextApiResponse<response_t<z.ZodAny>>, appErr: { code: string, message: string, statusCode: number }): void | Promise<void> {
  return res.status(appErr.statusCode).json({
    status: "error",
    message: appErr.message,
    code: appErr.code
  });
}