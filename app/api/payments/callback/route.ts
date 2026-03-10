import { paymentCallbackInputSchema } from '@/features/order-payment/schemas/order.schema';
import { processPaymentCallback } from '@/features/order-payment/server/services/order.service';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function POST(request: Request) {
    try {
        const json = await readJsonBody(request);
        const input = paymentCallbackInputSchema.parse(json);
        const result = await processPaymentCallback(input);
        return ok(result);
    } catch (error) {
        return fail(error);
    }
}
