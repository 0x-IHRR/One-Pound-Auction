import { requireUser, isAuthGuardError } from '@/app/lib/auth/guards';
import { orderIdParamsSchema } from '@/features/order-payment/schemas/order.schema';
import { payOrder } from '@/features/order-payment/server/services/order.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await requireUser();
        const { id } = orderIdParamsSchema.parse(await params);
        const result = await payOrder(id, user);
        return ok(result);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再支付订单。', 401));
        }

        return fail(error);
    }
}
