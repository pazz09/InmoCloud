import { withAuth } from '@/backend/auth';
import { AppError, convertZodError, MethodNotAllowedError, PropertyParsingError, UnexpectedError } from '@/backend/errors';
import { AppErrorResponse, SuccessTemplate } from '@/backend/messages';
import { property_form_add_schema, property_form_delete_schema, property_form_edit_schema, Roles } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import { addProperty, deleteProperty, searchProperties, updateProperty } from '@/lib/backend/properties';
import z from 'zod';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'DELETE':
            return del(req, res);
        default:
            return AppErrorResponse(res, MethodNotAllowedError());
    }
}

function del(req: NextApiRequest, res: NextApiResponse) {
    withAuth(
        async (req: NextApiRequest, Res: NextApiResponse) => {
            const id = parseInt(req.query.id as string);

            try {
                await deleteProperty(id);
            } catch (err) {
                console.log(err);
                if (err instanceof z.ZodError) {
                    return AppErrorResponse(res, convertZodError(err));
                } else if (err instanceof AppError) {
                    return AppErrorResponse(res, err);
                }
                return AppErrorResponse(res, UnexpectedError());
            }
            
            return res.status(200).json({
                status: 'success',
                message: 'Propiedad eliminada con éxito.',
            });
        },
        [Roles.ADMINISTRADOR, Roles.CORREDOR]
    )(req, res);
}