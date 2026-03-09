import { requireUser, isAuthGuardError } from '@/app/lib/auth/guards';
import { getCurrentUser } from '@/app/lib/auth/session';
import { boxIdParamsSchema, updateBoxInputSchema } from '@/features/marketplace/schemas/box.schema';
import {
    deleteMarketplaceBox,
    getMarketplaceBoxDetail,
    updateMarketplaceBox,
} from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const currentUser = await getCurrentUser();
        const { id } = boxIdParamsSchema.parse(await params);
        const box = await getMarketplaceBoxDetail(id, currentUser);
        return ok(box);
    } catch (error) {
        return fail(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await requireUser();
        const { id } = boxIdParamsSchema.parse(await params);
        const json = await readJsonBody(request);
        const input = updateBoxInputSchema.parse(json);
        const box = await updateMarketplaceBox(id, input, user);
        return ok(box);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再编辑内容。', 401));
        }

        return fail(error);
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await requireUser();
        const { id } = boxIdParamsSchema.parse(await params);
        await deleteMarketplaceBox(id, user);
        return ok({ success: true });
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再删除内容。', 401));
        }

        return fail(error);
    }
}
