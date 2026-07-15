import { z } from 'zod';

function parseOptionalBoolean(value: string | undefined): boolean | null | 'INVALID' {
    const normalized = value?.trim().toLowerCase();

    if (!normalized) {
        return null;
    }

    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }

    return 'INVALID';
}

const envSchema = z.object({
    DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL 不能为空。'),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    APP_BASE_URL: z.string().url('APP_BASE_URL 必须是合法 URL。'),
    PAYMENT_SIMULATION_ENABLED: z.string().optional(),
}).transform((value, context) => {
    const configuredPaymentSimulation = parseOptionalBoolean(value.PAYMENT_SIMULATION_ENABLED);

    if (configuredPaymentSimulation === 'INVALID') {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'PAYMENT_SIMULATION_ENABLED 必须是 true/false。',
            path: ['PAYMENT_SIMULATION_ENABLED'],
        });

        return z.NEVER;
    }

    return {
        DATABASE_URL: value.DATABASE_URL,
        NODE_ENV: value.NODE_ENV,
        APP_BASE_URL: value.APP_BASE_URL,
        PAYMENT_SIMULATION_ENABLED: configuredPaymentSimulation ?? value.NODE_ENV !== 'production',
    };
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
    return envSchema.parse({
        DATABASE_URL: source.DATABASE_URL,
        NODE_ENV: source.NODE_ENV,
        APP_BASE_URL: source.APP_BASE_URL,
        PAYMENT_SIMULATION_ENABLED: source.PAYMENT_SIMULATION_ENABLED,
    });
}

export function isPaymentSimulationEnabled(source: NodeJS.ProcessEnv = process.env): boolean {
    const configuredPaymentSimulation = parseOptionalBoolean(source.PAYMENT_SIMULATION_ENABLED);

    if (configuredPaymentSimulation === 'INVALID') {
        throw new Error('PAYMENT_SIMULATION_ENABLED 必须是 true/false。');
    }

    return configuredPaymentSimulation ?? source.NODE_ENV !== 'production';
}

export const env = new Proxy({} as AppEnv, {
    get(_target, prop: string | symbol) {
        if (typeof prop === 'symbol') {
            return undefined;
        }

        return loadEnv()[prop as keyof AppEnv];
    },
});
