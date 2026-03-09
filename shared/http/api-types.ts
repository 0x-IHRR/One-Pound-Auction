import type { AppErrorCode } from '@/shared/errors';

export type ApiSuccess<T> = {
    success: true;
    data: T;
};

export type ApiFailure = {
    success: false;
    error: {
        code: AppErrorCode;
        message: string;
        details?: unknown;
    };
};
