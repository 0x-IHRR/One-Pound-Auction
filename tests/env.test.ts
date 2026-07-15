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
            PAYMENT_SIMULATION_ENABLED: true,
        });
    });

    it('生产环境默认关闭模拟支付', async () => {
        const { loadEnv, isPaymentSimulationEnabled } = await import('@/shared/config/env');

        expect(loadEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
            NODE_ENV: 'production',
            APP_BASE_URL: 'https://example.com',
        })).toEqual({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
            NODE_ENV: 'production',
            APP_BASE_URL: 'https://example.com',
            PAYMENT_SIMULATION_ENABLED: false,
        });
        expect(isPaymentSimulationEnabled({
            NODE_ENV: 'production',
        } as NodeJS.ProcessEnv)).toBe(false);
    });

    it('允许显式打开或关闭模拟支付', async () => {
        const { loadEnv } = await import('@/shared/config/env');

        expect(loadEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
            NODE_ENV: 'production',
            APP_BASE_URL: 'https://example.com',
            PAYMENT_SIMULATION_ENABLED: 'true',
        }).PAYMENT_SIMULATION_ENABLED).toBe(true);

        expect(() => loadEnv({
            DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
            NODE_ENV: 'production',
            APP_BASE_URL: 'https://example.com',
            PAYMENT_SIMULATION_ENABLED: 'maybe',
        })).toThrow();
    });
});
