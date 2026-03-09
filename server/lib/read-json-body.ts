import { AppError } from '@/shared/errors';

export async function readJsonBody(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        throw new AppError('VALIDATION_ERROR', '请求体不是合法 JSON。', 400);
    }
}
