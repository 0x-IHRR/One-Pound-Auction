export const orderStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'] as const;
export const paymentStatuses = ['INITIATED', 'SUCCEEDED', 'FAILED'] as const;
export const paymentProviders = ['SIMULATED'] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentProvider = (typeof paymentProviders)[number];

export type OrderRecord = {
    id: string;
    buyerEmail: string;
    buyerName: string | null;
    itemId: string;
    sellerEmail: string;
    amount: number;
    status: OrderStatus;
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
        status: PaymentStatus;
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
};

export type CreateOrderInput = {
    itemId: string;
};

export type PaymentCallbackInput = {
    orderId: string;
    provider: PaymentProvider;
    providerTradeNo: string;
    status: 'SUCCEEDED' | 'FAILED';
    amount: number;
    callbackPayload: string;
};

export type CreateOrderResult = {
    order: OrderRecord;
};

export type PayOrderResult = {
    order: OrderRecord;
    idempotent: boolean;
};

export type PurchaseSummary = {
    orderId: string;
    buyerEmail: string;
    buyerName: string | null;
    amount: number;
    orderStatus: OrderStatus;
    paidAt: Date | null;
    unlockedAt: Date | null;
    paymentStatus: PaymentStatus | null;
    item: {
        id: string;
        title: string;
        hook_description: string;
        price: number;
        authorName: string | null;
        publishedAt: Date | null;
    };
};
