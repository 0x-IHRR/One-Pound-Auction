import { ZodError } from 'zod';

import type { ApiFailure } from '@/shared/http';
import { logger } from '@/shared/logger/logger';

import { AppError } from './app-error';

type ErrorResponse = {
    status: number;
    body: ApiFailure;
};

function asAppError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof ZodError) {
        return new AppError(
            'VALIDATION_ERROR',
            '请求参数不合法。',
            400,
            error.flatten(),
        );
    }

    logger.error('Unhandled application error.', { error });

    return new AppError('INTERNAL_SERVER_ERROR', '服务器内部错误。', 500);
}

export function toErrorResponse(error: unknown): ErrorResponse {
    const appError = asAppError(error);

    return {
        status: appError.status,
        body: {
            success: false,
            error: {
                code: appError.code,
                message: appError.message,
                ...(appError.details === undefined ? {} : { details: appError.details }),
            },
        },
    };
}
