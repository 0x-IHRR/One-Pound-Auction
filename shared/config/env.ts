import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL 不能为空。'),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    APP_BASE_URL: z.string().url('APP_BASE_URL 必须是合法 URL。'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
    return envSchema.parse({
        DATABASE_URL: source.DATABASE_URL,
        NODE_ENV: source.NODE_ENV,
        APP_BASE_URL: source.APP_BASE_URL,
    });
}

export const env = loadEnv();
