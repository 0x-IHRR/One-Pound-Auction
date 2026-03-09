import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('loadEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            DATABASE_URL: 'file:./dev.db',
            NODE_ENV: 'test',
            APP_BASE_URL: 'http://localhost:3000',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.resetModules();
    });

    it('在环境变量缺失时直接失败', async () => {
        const { loadEnv } = await import('@/shared/config/env');

        expect(() => loadEnv({
            DATABASE_URL: '',
            NODE_ENV: 'development',
            APP_BASE_URL: 'http://localhost:3000',
        })).toThrow();
    });

    it('在配置合法时返回结构化环境变量', async () => {
        const { loadEnv } = await import('@/shared/config/env');

        expect(loadEnv({
            DATABASE_URL: 'file:./dev.db',
            NODE_ENV: 'test',
            APP_BASE_URL: 'http://localhost:3000',
        })).toEqual({
            DATABASE_URL: 'file:./dev.db',
            NODE_ENV: 'test',
            APP_BASE_URL: 'http://localhost:3000',
        });
    });
});
