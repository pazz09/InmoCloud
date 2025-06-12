// backend/errors.ts

import z from "zod";

export class AppError extends Error {
    constructor(
        public code: string,
        public statusCode: number,
        message?: string
    ) {
        super(message ?? code);
    }
}

export function convertZodError(e: z.ZodError): AppError {
    const message = e.errors.map(err => err.message).join(". ") + ".";
    return new AppError("VALIDATION_ERROR", 400, message);
}


// Reusable factory functions

export const UserNotFoundError = () =>
  new AppError("USER_NOT_FOUND", 404, "Usuario no encontrado");

export const InvalidPasswordError = () =>
  new AppError("INVALID_PASSWORD", 401, "Contraseña incorrecta");

export const MissingCredentialsError = () =>
  new AppError("MISSING_CREDENTIALS", 400, "RUT y contraseña son obligatorios");

export const UserParsingError = () =>
  new AppError("INVALID_USER_DATA", 500, "Error al procesar datos del usuario");

export const UnauthorizedError = () =>
    new AppError("UNAUTHORIZED", 401, "No autorizado para realizar esta acción");

export const ForbiddenError = () =>
    new AppError("FORBIDDEN", 403, "Acción prohibida para el usuario actual");

export const UnexpectedError = () =>
     new AppError("UNEXPECTED", 500, "Error inesperado, por favor intente más tarde");

export const MethodNotAllowedError = () =>
    new AppError("METHOD_NOT_ALLOWED", 405, "Método no permitido para esta ruta");

export const SessionExpiredError = () =>
    new AppError("SESSION_EXPIRED", 401, "La sesión ha expirado, por favor inicie sesión nuevamente");

export const RutAlreadyExistsError = () =>
    new AppError("RUT_ALREADY_EXISTS", 409, "El RUT ya está en uso por otro usuario");

export const RolAlreadyExistsError = () =>
    new AppError("ROL_ALREADY_EXISTS", 409, "El ROL ya está en uso por otra propiedad");

export const MissingTokenError = () =>
    new AppError("MISSING_TOKEN", 401, "Token de autenticación faltante o inválido");

export const InvalidTokenError = () =>
    new AppError("INVALID_TOKEN", 401, "Token de autenticación inválido o expirado");

