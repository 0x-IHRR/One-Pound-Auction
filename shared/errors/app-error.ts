export type AppErrorCode =
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'CONFLICT'
    | 'UNAUTHENTICATED'
    | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
    readonly code: AppErrorCode;
    readonly status: number;
    readonly details?: unknown;

    constructor(code: AppErrorCode, message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
