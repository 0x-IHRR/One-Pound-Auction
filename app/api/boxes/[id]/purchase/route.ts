import { isAuthGuardError, requireUser } from '@/app/lib/auth/guards';
import { purchaseBoxParamsSchema } from '@/features/marketplace/schemas/box.schema';
import { purchaseMarketplaceBox } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await requireUser();
        const input = purchaseBoxParamsSchema.parse(await params);
        const result = await purchaseMarketplaceBox(input, user);
        return ok(result);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '兼容购买入口也需要先登录。', 401));
        }

        return fail(error);
    }
}
