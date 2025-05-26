// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Users, user_t } from "@/backend/users"



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<user_t[]>,
) {

  const userHandler = new Users();
  userHandler.getUsers().then((data)=> {
    res.status(200).json(data);
  });
}
