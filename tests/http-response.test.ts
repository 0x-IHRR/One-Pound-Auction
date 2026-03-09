import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';

describe('http response helpers', () => {
    it('ok 返回统一 success envelope', async () => {
        const response = ok({ foo: 'bar' }, 201);

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({
            success: true,
            data: { foo: 'bar' },
        });
    });

    it('fail 会保留业务错误状态码与结构', async () => {
        const response = fail(new AppError('NOT_FOUND', '目标内容不存在。', 404));

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: '目标内容不存在。',
            },
        });
    });

    it('未知异常会映射为稳定的 500 结构', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const response = fail(new Error('boom'));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: '服务器内部错误。',
            },
        });
        errorSpy.mockRestore();
    });
});
