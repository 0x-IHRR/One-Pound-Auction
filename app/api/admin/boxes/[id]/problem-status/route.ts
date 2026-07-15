import { isAuthGuardError, requireAdmin } from '@/app/lib/auth/guards';
import { boxIdParamsSchema, updateProblemStatusInputSchema } from '@/features/marketplace/schemas/box.schema';
import { adminUpdateProblemStatus } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await requireAdmin();
        const { id } = boxIdParamsSchema.parse(await params);
        const json = await readJsonBody(request);
        const { problemStatus } = updateProblemStatusInputSchema.parse(json);
        const box = await adminUpdateProblemStatus(id, problemStatus);
        return ok(box);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return error.code === 'UNAUTHENTICATED'
                ? fail(new AppError('UNAUTHENTICATED', '请先登录管理员账号。', 401))
                : fail(new AppError('FORBIDDEN', '仅管理员可更新问题状态。', 403));
        }

        return fail(error);
    }
}
