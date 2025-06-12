import { AppError, MethodNotAllowedError } from "@/lib/backend/errors";
import { AppErrorResponse, handleZodError, SuccessTemplate } from "@/lib/backend/messages";
import { updatePayment } from "@/lib/backend/payments";
import { payment_form_data_schema } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number.parseInt((req.query.id as string)!);
  if (req.method !== "PUT") return AppErrorResponse(res, MethodNotAllowedError());
  try {
    const transformed = { ...req.body, fecha: new Date(req.body.fecha) };
    const payment = payment_form_data_schema.parse(transformed);
    const response = await updatePayment(id, payment)
    console.log(response)
    return res.status(200).json(SuccessTemplate(response, "Información actualizada con éxito"));
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err)
      return handleZodError(err, res) ;
    } else if (err instanceof AppError) {
      console.log(err)
      return AppErrorResponse(res, err);
    } else {
      console.log(err)
    }
  }
}
