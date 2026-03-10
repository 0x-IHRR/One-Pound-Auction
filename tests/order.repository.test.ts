import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
    $transaction: vi.fn(),
    auctionItem: {
        update: vi.fn(),
    },
    order: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    payment: {
        update: vi.fn(),
    },
    unlockRecord: {
        count: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
    },
}));

vi.mock('@/server/db/prisma', () => ({
    default: prismaMock,
}));

import {
    completeOrderPayment,
    createOrderWithPayment,
    failOrderPayment,
    findLatestUnlockRecord,
    listAbnormalOrdersForAdmin,
} from '@/features/order-payment/server/repositories/order.repository';

function makeOrderRecord(overrides: Record<string, unknown> = {}) {
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

describe('order payment repository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('创建订单时同时创建支付记录', async () => {
        prismaMock.order.create.mockResolvedValue(makeOrderRecord());

        await expect(createOrderWithPayment({
            buyerEmail: 'buyer@example.com',
            buyerName: 'Buyer',
            itemId: 'box-1',
            sellerEmail: 'seller@example.com',
            amount: 9.9,
            provider: 'SIMULATED',
        })).resolves.toMatchObject({
            buyerEmail: 'buyer@example.com',
            payment: {
                status: 'INITIATED',
            },
        });

        expect(prismaMock.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                buyerEmail: 'buyer@example.com',
                payment: {
                    create: {
                        provider: 'SIMULATED',
                        amount: 9.9,
                    },
                },
            }),
        }));
    });

    it('按 itemId + buyerEmail 查询解锁记录', async () => {
        prismaMock.unlockRecord.findUnique.mockResolvedValue({
            id: 'unlock-1',
        });

        await expect(findLatestUnlockRecord('box-1', 'buyer@example.com')).resolves.toEqual({
            id: 'unlock-1',
        });

        expect(prismaMock.unlockRecord.findUnique).toHaveBeenCalledWith({
            where: {
                itemId_buyerEmail: {
                    itemId: 'box-1',
                    buyerEmail: 'buyer@example.com',
                },
            },
        });
    });

    it('支付完成事务会写支付、订单、解锁和销量', async () => {
        const tx = {
            auctionItem: {
                update: vi.fn().mockResolvedValue(undefined),
            },
            order: {
                findUnique: vi.fn()
                    .mockResolvedValueOnce(makeOrderRecord())
                    .mockResolvedValueOnce(makeOrderRecord({
                        status: 'PAID',
                        paidAt: new Date('2026-03-10T10:05:00.000Z'),
                        payment: {
                            ...makeOrderRecord().payment,
                            providerTradeNo: 'sim-order-1',
                            status: 'SUCCEEDED',
                            callbackPayload: '{}',
                        },
                        unlockRecord: {
                            id: 'unlock-1',
                            orderId: 'order-1',
                            itemId: 'box-1',
                            buyerEmail: 'buyer@example.com',
                            unlockedAt: new Date('2026-03-10T10:05:00.000Z'),
                        },
                    })),
                update: vi.fn().mockResolvedValue(undefined),
            },
            payment: {
                update: vi.fn().mockResolvedValue(undefined),
            },
            unlockRecord: {
                count: vi.fn().mockResolvedValue(3),
                upsert: vi.fn().mockResolvedValue(undefined),
            },
        };

        prismaMock.$transaction.mockImplementation(async (callback: (txArg: typeof tx) => unknown) => callback(tx));

        await expect(completeOrderPayment({
            orderId: 'order-1',
            providerTradeNo: 'sim-order-1',
            callbackPayload: '{}',
            amount: 9.9,
        })).resolves.toMatchObject({
            idempotent: false,
            order: {
                status: 'PAID',
                payment: {
                    status: 'SUCCEEDED',
                },
            },
        });

        expect(tx.payment.update).toHaveBeenCalled();
        expect(tx.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            data: expect.objectContaining({
                status: 'PAID',
                cancelledAt: null,
            }),
        });
        expect(tx.unlockRecord.upsert).toHaveBeenCalledWith({
            where: { orderId: 'order-1' },
            update: {},
            create: {
                orderId: 'order-1',
                itemId: 'box-1',
                buyerEmail: 'buyer@example.com',
            },
        });
        expect(tx.auctionItem.update).toHaveBeenCalledWith({
            where: { id: 'box-1' },
            data: {
                sales_count: 3,
            },
        });
    });

    it('已处理过的成功支付直接返回幂等结果', async () => {
        const tx = {
            order: {
                findUnique: vi.fn().mockResolvedValue(makeOrderRecord({
                    status: 'PAID',
                    unlockRecord: {
                        id: 'unlock-1',
                        orderId: 'order-1',
                        itemId: 'box-1',
                        buyerEmail: 'buyer@example.com',
                        unlockedAt: new Date('2026-03-10T10:05:00.000Z'),
                    },
                })),
            },
            payment: {
                update: vi.fn(),
            },
            unlockRecord: {
                upsert: vi.fn(),
                count: vi.fn(),
            },
            auctionItem: {
                update: vi.fn(),
            },
        };

        prismaMock.$transaction.mockImplementation(async (callback: (txArg: typeof tx) => unknown) => callback(tx));

        await expect(completeOrderPayment({
            orderId: 'order-1',
            providerTradeNo: 'sim-order-1',
            callbackPayload: '{}',
            amount: 9.9,
        })).resolves.toMatchObject({
            idempotent: true,
            order: {
                status: 'PAID',
            },
        });

        expect(tx.payment.update).not.toHaveBeenCalled();
        expect(tx.unlockRecord.upsert).not.toHaveBeenCalled();
    });

    it('失败支付会更新订单和支付状态', async () => {
        prismaMock.order.update.mockResolvedValue(makeOrderRecord({
            status: 'FAILED',
            payment: {
                ...makeOrderRecord().payment,
                status: 'FAILED',
                providerTradeNo: 'sim-order-1',
            },
        }));

        await expect(failOrderPayment({
            orderId: 'order-1',
            providerTradeNo: 'sim-order-1',
            callbackPayload: '{"status":"FAILED"}',
            amount: 9.9,
        })).resolves.toMatchObject({
            status: 'FAILED',
            payment: {
                status: 'FAILED',
            },
        });

        expect(prismaMock.order.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'order-1' },
            data: expect.objectContaining({
                status: 'FAILED',
            }),
        }));
    });

    it('异常订单列表只查询失败、取消和待支付状态', async () => {
        prismaMock.order.findMany.mockResolvedValue([makeOrderRecord({
            status: 'FAILED',
        })]);

        await expect(listAbnormalOrdersForAdmin()).resolves.toEqual([
            expect.objectContaining({
                status: 'FAILED',
            }),
        ]);

        expect(prismaMock.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                OR: [
                    { status: 'FAILED' },
                    { status: 'CANCELLED' },
                    { status: 'PENDING' },
                ],
            },
        }));
    });
});
