import { beforeEach, describe, expect, it, vi } from 'vitest';

const boxRepositoryMocks = vi.hoisted(() => ({
    findBoxById: vi.fn(),
}));

const orderRepositoryMocks = vi.hoisted(() => ({
    completeOrderPayment: vi.fn(),
    createOrderWithPayment: vi.fn(),
    failOrderPayment: vi.fn(),
    findLatestUnlockRecord: vi.fn(),
    findOrderById: vi.fn(),
    listAbnormalOrdersForAdmin: vi.fn(),
    listOrdersByBuyerEmail: vi.fn(),
    listOrdersForAdmin: vi.fn(),
}));

vi.mock('@/features/marketplace/server/repositories/box.repository', () => boxRepositoryMocks);
vi.mock('@/features/order-payment/server/repositories/order.repository', () => orderRepositoryMocks);

import {
    createOrder,
    listAdminAbnormalOrders,
    listMyPaidOrders,
    payOrder,
    processPaymentCallback,
} from '@/features/order-payment/server/services/order.service';

function makeBox(overrides: Record<string, unknown> = {}) {
    const now = new Date('2026-03-10T09:00:00.000Z');

    return {
        id: 'box-1',
        itemType: 'OFFER',
        title: '标题',
        hook_description: '描述',
        hidden_content: '隐藏内容',
        price: 9.9,
        accepts_barter: false,
        barter_demand: null,
        sales_count: 0,
        authorEmail: 'seller@example.com',
        authorName: 'Seller',
        status: 'PUBLISHED',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
        deletedAt: null,
        ...overrides,
    };
}

function makeOrder(overrides: Record<string, unknown> = {}) {
    const now = new Date('2026-03-10T10:00:00.000Z');

    return {
        id: 'order-1',
        buyerEmail: 'buyer@example.com',
        buyerName: 'Buyer',
        itemId: 'box-1',
        sellerEmail: 'seller@example.com',
        amount: 9.9,
        status: 'PENDING',
        createdAt: now,
        paidAt: null,
        cancelledAt: null,
        item: {
            id: 'box-1',
            title: '标题',
            hook_description: '描述',
            price: 9.9,
            authorEmail: 'seller@example.com',
            authorName: 'Seller',
            status: 'PUBLISHED',
            publishedAt: now,
        },
        payment: {
            id: 'payment-1',
            provider: 'SIMULATED',
            providerTradeNo: null,
            status: 'INITIATED',
            amount: 9.9,
            callbackPayload: null,
            createdAt: now,
            updatedAt: now,
        },
        unlockRecord: null,
        ...overrides,
    };
}

const currentUser = {
    email: 'buyer@example.com',
    name: 'Buyer',
    role: 'USER' as const,
};

describe('order payment service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        boxRepositoryMocks.findBoxById.mockResolvedValue(makeBox());
        orderRepositoryMocks.findLatestUnlockRecord.mockResolvedValue(null);
    });

    it('下单时拒绝购买自己发布的内容', async () => {
        boxRepositoryMocks.findBoxById.mockResolvedValue(makeBox({
            authorEmail: 'buyer@example.com',
        }));

        await expect(createOrder({ itemId: 'box-1' }, currentUser)).rejects.toMatchObject({
            code: 'FORBIDDEN',
            status: 403,
        });
    });

    it('下单时若已解锁则返回冲突', async () => {
        orderRepositoryMocks.findLatestUnlockRecord.mockResolvedValue({
            id: 'unlock-1',
        });

        await expect(createOrder({ itemId: 'box-1' }, currentUser)).rejects.toMatchObject({
            code: 'CONFLICT',
            status: 409,
        });
    });

    it('下单成功时创建订单和支付记录', async () => {
        orderRepositoryMocks.createOrderWithPayment.mockResolvedValue(makeOrder());

        await expect(createOrder({ itemId: 'box-1' }, currentUser)).resolves.toMatchObject({
            order: {
                buyerEmail: 'buyer@example.com',
                sellerEmail: 'seller@example.com',
                amount: 9.9,
            },
        });

        expect(orderRepositoryMocks.createOrderWithPayment).toHaveBeenCalledWith({
            buyerEmail: 'buyer@example.com',
            buyerName: 'Buyer',
            itemId: 'box-1',
            sellerEmail: 'seller@example.com',
            amount: 9.9,
            provider: 'SIMULATED',
        });
    });

    it('支付订单时限制买家本人操作', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder());

        await expect(payOrder('order-1', {
            email: 'other@example.com',
            name: 'Other',
            role: 'USER',
        })).rejects.toMatchObject({
            code: 'FORBIDDEN',
            status: 403,
        });
    });

    it('支付成功回调已处理过时返回幂等结果', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder({
            status: 'PAID',
            paidAt: new Date('2026-03-10T10:05:00.000Z'),
            unlockRecord: {
                id: 'unlock-1',
                orderId: 'order-1',
                itemId: 'box-1',
                buyerEmail: 'buyer@example.com',
                unlockedAt: new Date('2026-03-10T10:05:00.000Z'),
            },
        }));

        await expect(processPaymentCallback({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'SUCCEEDED',
            amount: 9.9,
            callbackPayload: '{}',
        })).resolves.toMatchObject({
            idempotent: true,
            order: {
                status: 'PAID',
            },
        });

        expect(orderRepositoryMocks.completeOrderPayment).not.toHaveBeenCalled();
    });

    it('回调缺少支付记录时返回 404', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder({
            payment: null,
        }));

        await expect(processPaymentCallback({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'SUCCEEDED',
            amount: 9.9,
            callbackPayload: '{}',
        })).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
    });

    it('回调渠道不匹配时返回冲突', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder({
            payment: {
                ...makeOrder().payment,
                provider: 'OTHER_PROVIDER',
            },
        }));

        await expect(processPaymentCallback({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'SUCCEEDED',
            amount: 9.9,
            callbackPayload: '{}',
        })).rejects.toMatchObject({
            code: 'CONFLICT',
            status: 409,
        });
    });

    it('回调金额不一致时返回冲突', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder());

        await expect(processPaymentCallback({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'SUCCEEDED',
            amount: 19.9,
            callbackPayload: '{}',
        })).rejects.toMatchObject({
            code: 'CONFLICT',
            status: 409,
        });
    });

    it('失败回调转到失败流转', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder());
        orderRepositoryMocks.failOrderPayment.mockResolvedValue(makeOrder({
            status: 'FAILED',
            payment: {
                ...makeOrder().payment,
                status: 'FAILED',
            },
        }));

        await expect(processPaymentCallback({
            orderId: 'order-1',
            provider: 'SIMULATED',
            providerTradeNo: 'sim-order-1',
            status: 'FAILED',
            amount: 9.9,
            callbackPayload: '{"status":"FAILED"}',
        })).resolves.toMatchObject({
            idempotent: false,
            order: {
                status: 'FAILED',
            },
        });

        expect(orderRepositoryMocks.failOrderPayment).toHaveBeenCalledWith({
            orderId: 'order-1',
            providerTradeNo: 'sim-order-1',
            callbackPayload: '{"status":"FAILED"}',
            amount: 9.9,
        });
    });

    it('我的购买列表映射出前端展示摘要', async () => {
        orderRepositoryMocks.listOrdersByBuyerEmail.mockResolvedValue([
            makeOrder({
                status: 'PAID',
                paidAt: new Date('2026-03-10T10:05:00.000Z'),
                unlockRecord: {
                    id: 'unlock-1',
                    orderId: 'order-1',
                    itemId: 'box-1',
                    buyerEmail: 'buyer@example.com',
                    unlockedAt: new Date('2026-03-10T10:05:00.000Z'),
                },
            }),
        ]);

        await expect(listMyPaidOrders(currentUser)).resolves.toEqual([
            expect.objectContaining({
                orderId: 'order-1',
                buyerEmail: 'buyer@example.com',
                paymentStatus: 'INITIATED',
                item: expect.objectContaining({
                    id: 'box-1',
                    title: '标题',
                }),
            }),
        ]);
    });

    it('异常订单列表复用统一摘要映射', async () => {
        orderRepositoryMocks.listAbnormalOrdersForAdmin.mockResolvedValue([
            makeOrder({
                status: 'FAILED',
            }),
        ]);

        await expect(listAdminAbnormalOrders()).resolves.toEqual([
            expect.objectContaining({
                orderStatus: 'FAILED',
                buyerName: 'Buyer',
            }),
        ]);
    });

    it('已取消订单不能再次支付', async () => {
        orderRepositoryMocks.findOrderById.mockResolvedValue(makeOrder({
            status: 'CANCELLED',
        }));

        await expect(payOrder('order-1', currentUser)).rejects.toMatchObject({
            code: 'CONFLICT',
            status: 409,
        });
    });
});
