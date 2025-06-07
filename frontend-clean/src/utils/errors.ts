// utils/errors.ts (frontend)

// Sólo puede ser utilizada en Frontend
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message?: string
  ) {
    super(message ?? code);
  }
}
