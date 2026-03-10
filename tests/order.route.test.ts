import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors';

const authMocks = vi.hoisted(() => ({
    isAuthGuardError: vi.fn(),
    requireUser: vi.fn(),
}));

const orderServiceMocks = vi.hoisted(() => ({
    createOrder: vi.fn(),
    payOrder: vi.fn(),
    processPaymentCallback: vi.fn(),
}));

const readJsonBodyMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/auth/guards', () => ({
    isAuthGuardError: authMocks.isAuthGuardError,
    requireUser: authMocks.requireUser,
}));

vi.mock('@/features/order-payment/server/services/order.service', () => ({
    createOrder: orderServiceMocks.createOrder,
    payOrder: orderServiceMocks.payOrder,
    processPaymentCallback: orderServiceMocks.processPaymentCallback,
}));

vi.mock('@/server/lib/read-json-body', () => ({
    readJsonBody: readJsonBodyMock,
}));

import { POST as postOrder } from '@/app/api/orders/route';
import { POST as payOrderRoute } from '@/app/api/orders/[id]/pay/route';
import { POST as paymentCallbackRoute } from '@/app/api/payments/callback/route';

describe('order routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('未登录创建订单返回 401', async () => {
        authMocks.requireUser.mockRejectedValue(new Error('auth-required'));
        authMocks.isAuthGuardError.mockReturnValue(true);

        const response = await postOrder(new Request('http://localhost/api/orders', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(401);
        expect(payload.error.code).toBe('UNAUTHENTICATED');
    });

    it('支付订单时透传服务结果', async () => {
        authMocks.requireUser.mockResolvedValue({
            email: 'buyer@example.com',
            name: 'Buyer',
            role: 'USER',
        });
        authMocks.isAuthGuardError.mockReturnValue(false);
        orderServiceMocks.payOrder.mockResolvedValue({
            order: {
                id: 'order-1',
                status: 'PAID',
            },
            idempotent: false,
        });

        const response = await payOrderRoute(
            new Request('http://localhost/api/orders/order-1/pay', { method: 'POST' }),
            { params: Promise.resolve({ id: 'order-1' }) },
        );
        const payload = (await response.json()) as { success: true; data: { order: { status: string } } };

        expect(response.status).toBe(200);
        expect(payload.data.order.status).toBe('PAID');
    });

    it('支付回调按统一错误模型返回业务错误', async () => {
        readJsonBodyMock.mockResolvedValue({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'SUCCEEDED',
            amount: 2,
            callbackPayload: '{}',
        });
        orderServiceMocks.processPaymentCallback.mockRejectedValue(
            new AppError('CONFLICT', '支付金额与订单金额不一致。', 409),
        );

        const response = await paymentCallbackRoute(new Request('http://localhost/api/payments/callback', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(409);
        expect(payload.error.code).toBe('CONFLICT');
    });

    it('支付回调参数不合法时返回 400', async () => {
        readJsonBodyMock.mockResolvedValue({
            orderId: '',
            provider: 'SIMULATED',
            providerTradeNo: '',
            status: 'SUCCEEDED',
            amount: 0,
            callbackPayload: '',
        });

        const response = await paymentCallbackRoute(new Request('http://localhost/api/payments/callback', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(400);
        expect(payload.error.code).toBe('VALIDATION_ERROR');
        expect(orderServiceMocks.processPaymentCallback).not.toHaveBeenCalled();
    });
});
