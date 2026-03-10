import type { CurrentUser } from '@/app/lib/auth/session';
import { findBoxById } from '@/features/marketplace/server/repositories/box.repository';
import {
    completeOrderPayment,
    createOrderWithPayment,
    failOrderPayment,
    findLatestUnlockRecord,
    findOrderById,
    listAbnormalOrdersForAdmin,
    listOrdersByBuyerEmail,
    listOrdersForAdmin,
} from '@/features/order-payment/server/repositories/order.repository';
import type {
    CreateOrderInput,
    CreateOrderResult,
    OrderRecord,
    PaymentCallbackInput,
    PayOrderResult,
    PurchaseSummary,
} from '@/features/order-payment/types/order';
import { AppError } from '@/shared/errors';

const SIMULATED_PROVIDER = 'SIMULATED';

function mapPurchaseSummary(order: OrderRecord): PurchaseSummary {
    return {
        orderId: order.id,
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        amount: order.amount,
        orderStatus: order.status,
        paidAt: order.paidAt,
        unlockedAt: order.unlockRecord?.unlockedAt ?? null,
        paymentStatus: order.payment?.status ?? null,
        item: {
            id: order.item.id,
            title: order.item.title,
            hook_description: order.item.hook_description,
            price: order.item.price,
            authorName: order.item.authorName,
            publishedAt: order.item.publishedAt,
        },
    };
}

export async function createOrder(input: CreateOrderInput, user: CurrentUser): Promise<CreateOrderResult> {
    const box = await findBoxById(input.itemId);

    if (!box || box.deletedAt || box.status === 'DELETED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { itemId: input.itemId });
    }

    if (box.status !== 'PUBLISHED') {
        throw new AppError('CONFLICT', '当前内容不可购买。', 409, { itemId: input.itemId, status: box.status });
    }

    if (!box.authorEmail) {
        throw new AppError('CONFLICT', '当前内容缺少作者归属，暂不支持购买。', 409, { itemId: input.itemId });
    }

    if (box.authorEmail === user.email) {
        throw new AppError('FORBIDDEN', '不能购买自己发布的内容。', 403, { itemId: input.itemId });
    }

    const unlocked = await findLatestUnlockRecord(input.itemId, user.email);

    if (unlocked) {
        throw new AppError('CONFLICT', '你已经购买并解锁过这条内容。', 409, { itemId: input.itemId });
    }

    const order = await createOrderWithPayment({
        buyerEmail: user.email,
        buyerName: user.name ?? null,
        itemId: box.id,
        sellerEmail: box.authorEmail,
        amount: box.price,
        provider: SIMULATED_PROVIDER,
    });

    return { order };
}

export async function payOrder(orderId: string, user: CurrentUser): Promise<PayOrderResult> {
    const order = await findOrderById(orderId);

    if (!order) {
        throw new AppError('NOT_FOUND', '订单不存在。', 404, { orderId });
    }

    if (order.buyerEmail !== user.email) {
        throw new AppError('FORBIDDEN', '你无权支付这笔订单。', 403, { orderId });
    }

    if (order.status === 'CANCELLED') {
        throw new AppError('CONFLICT', '已取消订单不能支付。', 409, { orderId });
    }

    if (order.status === 'FAILED') {
        throw new AppError('CONFLICT', '支付失败订单不能再次支付。', 409, { orderId });
    }

    const callbackPayload = JSON.stringify({
        orderId,
        provider: SIMULATED_PROVIDER,
        status: 'SUCCEEDED',
        amount: order.amount,
        triggeredAt: new Date().toISOString(),
    });

    return processPaymentCallback({
        orderId,
        provider: SIMULATED_PROVIDER,
        providerTradeNo: `sim-${orderId}`,
        status: 'SUCCEEDED',
        amount: order.amount,
        callbackPayload,
    });
}

export async function processPaymentCallback(input: PaymentCallbackInput): Promise<PayOrderResult> {
    const order = await findOrderById(input.orderId);

    if (!order) {
        throw new AppError('NOT_FOUND', '订单不存在。', 404, { orderId: input.orderId });
    }

    if (!order.payment) {
        throw new AppError('NOT_FOUND', '支付记录不存在。', 404, { orderId: input.orderId });
    }

    if (order.status === 'PAID' && order.unlockRecord) {
        return {
            order,
            idempotent: true,
        };
    }

    if (order.payment.provider !== input.provider) {
        throw new AppError('CONFLICT', '支付渠道与订单不匹配。', 409, {
            orderId: input.orderId,
            provider: input.provider,
            expectedProvider: order.payment.provider,
        });
    }

    if (Math.abs(order.amount - input.amount) > 0.000001) {
        throw new AppError('CONFLICT', '支付金额与订单金额不一致。', 409, {
            orderId: input.orderId,
            orderAmount: order.amount,
            callbackAmount: input.amount,
        });
    }

    if (input.status === 'FAILED') {
        const failedOrder = await failOrderPayment({
            orderId: input.orderId,
            providerTradeNo: input.providerTradeNo,
            callbackPayload: input.callbackPayload,
            amount: input.amount,
        });

        return {
            order: failedOrder,
            idempotent: false,
        };
    }

    const result = await completeOrderPayment({
        orderId: input.orderId,
        providerTradeNo: input.providerTradeNo,
        callbackPayload: input.callbackPayload,
        amount: input.amount,
    });

    if (!result) {
        throw new AppError('NOT_FOUND', '订单不存在。', 404, { orderId: input.orderId });
    }

    return result;
}

export async function hasUnlockedBox(itemId: string, buyerEmail: string): Promise<boolean> {
    return Boolean(await findLatestUnlockRecord(itemId, buyerEmail));
}

export async function listMyPaidOrders(user: CurrentUser): Promise<PurchaseSummary[]> {
    const orders = await listOrdersByBuyerEmail(user.email);
    return orders.map(mapPurchaseSummary);
}

export async function listAdminOrders(): Promise<PurchaseSummary[]> {
    const orders = await listOrdersForAdmin();
    return orders.map(mapPurchaseSummary);
}

export async function listAdminAbnormalOrders(): Promise<PurchaseSummary[]> {
    const orders = await listAbnormalOrdersForAdmin();
    return orders.map(mapPurchaseSummary);
}
