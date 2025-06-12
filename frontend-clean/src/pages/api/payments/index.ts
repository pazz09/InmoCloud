import { AppErrorResponse, handleZodError, SuccessTemplate } from "@/lib/backend/messages";
import { addPayment } from "@/lib/backend/payments";
import { payment_form_data_schema, payment_view_schema, success_response_schema } from "@/types";
import { AppError } from "@/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        const transformed = { ...req.body, fecha: new Date(req.body.fecha) };
        const payment = payment_form_data_schema.parse(transformed);
        const response = await addPayment(payment);
        console.log("Prev:", response)
        return res.status(200).json(SuccessTemplate(response, "Los datos fueron ingresados correctamente"));
      } catch (err) {
        if (err instanceof z.ZodError)
          return handleZodError(err, res);
        else if (err instanceof AppError)
          return AppErrorResponse(res, err);
        else
          return res.status(500).json({ error: "Unexpected server error" });
      }
    default:
      return res.status(405).json({ error: "Method Not Allowed" }); // <- This avoids the unresolved API route issue
  }
}

