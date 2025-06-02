import db from "@/backend/db";
import { dashboard_metrics_t, response_t, Roles } from "@/backend/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getDashboardMetrics } from "@/backend/dashboard";
import { withAuth } from "@/backend/auth";
import { ErrorTemplate } from "@/backend/messages";
import z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<response_t<dashboard_metrics_t | z.infer<z.ZodTypeAny>>>
) { 
  switch (req.method) {
    case "GET":
        withAuth(async (_: NextApiRequest, res: NextApiResponse) => {
          const metrics = await getDashboardMetrics()
          return res.status(200).json({status: "success", data: metrics});
        }, [Roles.ADMINISTRADOR, Roles.CORREDOR])(req, res);
      break;
    default:
      return res.status(400).json(ErrorTemplate("method_not_allowed"))
      
  }

}

