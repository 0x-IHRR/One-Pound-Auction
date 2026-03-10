import { isAuthGuardError, requireAdmin } from '@/app/lib/auth/guards';
import { boxIdParamsSchema } from '@/features/marketplace/schemas/box.schema';
import { adminUnlistMarketplaceBox } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await requireAdmin();
        const { id } = boxIdParamsSchema.parse(await params);
        const box = await adminUnlistMarketplaceBox(id);
        return ok(box);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return error.code === 'UNAUTHENTICATED'
                ? fail(new AppError('UNAUTHENTICATED', '请先登录管理员账号。', 401))
                : fail(new AppError('FORBIDDEN', '仅管理员可执行下架操作。', 403));
        }

        return fail(error);
    }
}
