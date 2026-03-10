import prisma from '@/server/db/prisma';
import type { PaymentStatus, OrderRecord } from '@/features/order-payment/types/order';

function normalizeOrderStatus(value: string): OrderRecord['status'] {
    if (value === 'PAID' || value === 'FAILED' || value === 'CANCELLED') {
        return value;
    }

    return 'PENDING';
}

function normalizePaymentStatus(value: string): PaymentStatus {
    if (value === 'SUCCEEDED' || value === 'FAILED') {
        return value;
    }

    return 'INITIATED';
}

function mapOrder(record: {
    id: string;
    buyerEmail: string;
    buyerName: string | null;
    itemId: string;
    sellerEmail: string;
    amount: number;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
    cancelledAt: Date | null;
    item: {
        id: string;
        title: string;
        hook_description: string;
        price: number;
        authorEmail: string | null;
        authorName: string | null;
        status: string;
        publishedAt: Date | null;
    };
    payment: {
        id: string;
        provider: string;
        providerTradeNo: string | null;
        status: string;
        amount: number;
        callbackPayload: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    unlockRecord: {
        id: string;
        orderId: string;
        itemId: string;
        buyerEmail: string;
        unlockedAt: Date;
    } | null;
}): OrderRecord {
    return {
        ...record,
        status: normalizeOrderStatus(record.status),
        payment: record.payment
            ? {
                ...record.payment,
                status: normalizePaymentStatus(record.payment.status),
            }
            : null,
    };
}

const orderInclude = {
    item: {
        select: {
            id: true,
            title: true,
            hook_description: true,
            price: true,
            authorEmail: true,
            authorName: true,
            status: true,
            publishedAt: true,
        },
    },
    payment: true,
    unlockRecord: true,
} as const;

export async function createOrderWithPayment(data: {
    buyerEmail: string;
    buyerName: string | null;
    itemId: string;
    sellerEmail: string;
    amount: number;
    provider: string;
}): Promise<OrderRecord> {
    const record = await prisma.order.create({
        data: {
            buyerEmail: data.buyerEmail,
            buyerName: data.buyerName,
            itemId: data.itemId,
            sellerEmail: data.sellerEmail,
            amount: data.amount,
            payment: {
                create: {
                    provider: data.provider,
                    amount: data.amount,
                },
            },
        },
        include: orderInclude,
    });

    return mapOrder(record);
}

export async function findOrderById(id: string): Promise<OrderRecord | null> {
    const record = await prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });

    return record ? mapOrder(record) : null;
}

export async function findLatestUnlockRecord(itemId: string, buyerEmail: string) {
    return prisma.unlockRecord.findUnique({
        where: {
            itemId_buyerEmail: {
                itemId,
                buyerEmail,
            },
        },
    });
}

export async function listOrdersByBuyerEmail(buyerEmail: string): Promise<OrderRecord[]> {
    const records = await prisma.order.findMany({
        where: {
            buyerEmail,
            status: 'PAID',
        },
        include: orderInclude,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return records.map(mapOrder);
}

export async function listOrdersForAdmin(): Promise<OrderRecord[]> {
    const records = await prisma.order.findMany({
        include: orderInclude,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return records.map(mapOrder);
}

export async function listAbnormalOrdersForAdmin(): Promise<OrderRecord[]> {
    const records = await prisma.order.findMany({
        where: {
            OR: [
                { status: 'FAILED' },
                { status: 'CANCELLED' },
                { status: 'PENDING' },
            ],
        },
        include: orderInclude,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return records.map(mapOrder);
}

export async function completeOrderPayment(input: {
    orderId: string;
    providerTradeNo: string;
    callbackPayload: string;
    amount: number;
}) {
    const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.order.findUnique({
            where: { id: input.orderId },
            include: orderInclude,
        });

        if (!existing) {
            return null;
        }

        if (existing.status === 'PAID' && existing.unlockRecord) {
            return {
                order: existing,
                idempotent: true,
            };
        }

        const paidAt = existing.paidAt ?? new Date();

        await tx.payment.update({
            where: { orderId: input.orderId },
            data: {
                providerTradeNo: input.providerTradeNo,
                status: 'SUCCEEDED',
                amount: input.amount,
                callbackPayload: input.callbackPayload,
                updatedAt: new Date(),
            },
        });

        await tx.order.update({
            where: { id: input.orderId },
            data: {
                status: 'PAID',
                paidAt,
                cancelledAt: null,
            },
        });

        await tx.unlockRecord.upsert({
            where: { orderId: input.orderId },
            update: {},
            create: {
                orderId: input.orderId,
                itemId: existing.itemId,
                buyerEmail: existing.buyerEmail,
            },
        });

        const salesCount = await tx.unlockRecord.count({
            where: {
                itemId: existing.itemId,
            },
        });

        await tx.auctionItem.update({
            where: { id: existing.itemId },
            data: {
                sales_count: salesCount,
            },
        });

        const order = await tx.order.findUnique({
            where: { id: input.orderId },
            include: orderInclude,
        });

        return order
            ? {
                order,
                idempotent: false,
            }
            : null;
    });

    if (!result) {
        return null;
    }

    return {
        order: mapOrder(result.order),
        idempotent: result.idempotent,
    };
}

export async function failOrderPayment(input: {
    orderId: string;
    providerTradeNo: string;
    callbackPayload: string;
    amount: number;
}) {
    const record = await prisma.order.update({
        where: { id: input.orderId },
        data: {
            status: 'FAILED',
            payment: {
                update: {
                    providerTradeNo: input.providerTradeNo,
                    status: 'FAILED',
                    amount: input.amount,
                    callbackPayload: input.callbackPayload,
                    updatedAt: new Date(),
                },
            },
        },
        include: orderInclude,
    });

    return mapOrder(record);
}
