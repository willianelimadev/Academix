export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(resource = 'Recurso') {
  return new AppError(404, 'NOT_FOUND', `${resource} não encontrado.`);
}

export function badRequest(message, details) {
  return new AppError(400, 'VALIDATION_ERROR', message, details);
}

export function sendError(res, error) {
  const status = error instanceof AppError ? error.status : 500;
  const payload = {
    error: {
      code: error instanceof AppError ? error.code : 'INTERNAL_ERROR',
      message: status === 500 ? 'Não foi possível concluir a operação.' : error.message
    }
  };

  if (error instanceof AppError && error.details) payload.error.details = error.details;
  if (status === 500) console.error('[api:error]', error);
  return res.status(status).json(payload);
}
