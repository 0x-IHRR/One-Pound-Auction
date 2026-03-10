import { requireUser, isAuthGuardError } from '@/app/lib/auth/guards';
import { createOrderInputSchema } from '@/features/order-payment/schemas/order.schema';
import { createOrder } from '@/features/order-payment/server/services/order.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function POST(request: Request) {
    try {
        const user = await requireUser();
        const json = await readJsonBody(request);
        const input = createOrderInputSchema.parse(json);
        const result = await createOrder(input, user);
        return ok(result, 201);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再下单。', 401));
        }

        return fail(error);
    }
}
