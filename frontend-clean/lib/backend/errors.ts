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

export const UnexpectedError = () =>
     new AppError("UNEXPECTED", 500, "Error inesperado, por favor intente más tarde");