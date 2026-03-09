import { NextResponse } from 'next/server';

import { toErrorResponse } from '@/shared/errors';

import type { ApiSuccess } from './api-types';

export function ok<T>(data: T, status = 200) {
    return NextResponse.json<ApiSuccess<T>>(
        {
            success: true,
            data,
        },
        { status },
    );
}

export function fail(error: unknown) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
}
