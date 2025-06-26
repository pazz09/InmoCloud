import { withAuth } from '@/backend/auth';
import { AppError, MethodNotAllowedError } from '@/backend/errors';
import { AppErrorResponse, SuccessTemplate } from '@/backend/messages';
import { Roles } from '@/types';
import { getClients } from '@/backend/users';
import { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return get(req, res);
        default:
            return AppErrorResponse(res, MethodNotAllowedError());
    }
}

function get(req: NextApiRequest, res: NextApiResponse) {
    withAuth(
        async (req: NextApiRequest, Res: NextApiResponse) => {
            const users = await getClients();
            return res.status(200).json(SuccessTemplate(users, "Lista de clientes obtenida correctamente"));

        },
     [Roles.ADMINISTRADOR, Roles.CORREDOR]
    )(req, res);

}
