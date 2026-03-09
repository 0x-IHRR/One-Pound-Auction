import { requireUser, isAuthGuardError } from '@/app/lib/auth/guards';
import { boxIdParamsSchema } from '@/features/marketplace/schemas/box.schema';
import { publishMarketplaceBox } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await requireUser();
        const { id } = boxIdParamsSchema.parse(await params);
        const box = await publishMarketplaceBox(id, user);
        return ok(box);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再发布内容。', 401));
        }

        return fail(error);
    }
}
