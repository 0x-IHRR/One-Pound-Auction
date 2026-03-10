import { z } from 'zod';

import { paymentProviders } from '@/features/order-payment/types/order';

const requiredId = z.string().trim().min(1, 'id 不能为空。');

export const createOrderInputSchema = z.object({
    itemId: requiredId,
});

export const orderIdParamsSchema = z.object({
    id: requiredId,
});

export const paymentCallbackInputSchema = z.object({
    orderId: requiredId,
    provider: z.enum(paymentProviders).default('SIMULATED'),
    providerTradeNo: z.string().trim().min(1, 'providerTradeNo 不能为空。'),
    status: z.enum(['SUCCEEDED', 'FAILED']),
    amount: z.coerce.number().positive('amount 必须大于 0。'),
    callbackPayload: z.string().trim().min(1, 'callbackPayload 不能为空。'),
});
