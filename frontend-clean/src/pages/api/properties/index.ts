import { withAuth } from '@/backend/auth';
import { AppError, convertZodError, MethodNotAllowedError, PropertyParsingError, UnexpectedError } from '@/backend/errors';
import { AppErrorResponse, SuccessTemplate } from '@/backend/messages';
import { property_form_add_schema, Roles } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import { addProperty, searchProperties } from '@/lib/backend/properties';
import z from 'zod';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return get(req, res);
        case 'ADD':
            return add(req, res);
        case 'PUT':
            // return put(req, res);
        case 'DELETE':
            // return del(req, res);
        default:
            return AppErrorResponse(res, MethodNotAllowedError());
    }
}

function get(req: NextApiRequest, res: NextApiResponse) {
    withAuth(
        async (req: NextApiRequest, Res: NextApiResponse) => {
            const users = await searchProperties({});
            return res.status(200).json(SuccessTemplate(users, "Lista de propiedades obtenida correctamente"));
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR]
    )(req, res);
}

function add(req: NextApiRequest, res: NextApiResponse) {
    withAuth(
        async (req: NextApiRequest, Res: NextApiResponse) => {
            const parsedBody = property_form_add_schema.safeParse(req.body);

            if (!parsedBody.success) {
                console.log(parsedBody.error);
                return AppErrorResponse(res, PropertyParsingError());
            } 

            let property = null;
            try {
                property = await addProperty(parsedBody.data);
            } catch (err) {
                if (err instanceof z.ZodError) {
                    return AppErrorResponse(res, convertZodError(err));
                } else if (err instanceof AppError) {
                    return AppErrorResponse(res, err);
                }
                return AppErrorResponse(res, UnexpectedError());
            }

            return res.status(200).json({
                status: 'success',
                message: 'Propiedad creada correctamente.',
                data: property,
            });
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR]
    )(req, res);
}