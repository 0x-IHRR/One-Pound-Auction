import { AppError } from '@/shared/errors';
import type { CurrentUser } from '@/app/lib/auth/session';
import { createOrder, payOrder, hasUnlockedBox } from '@/features/order-payment/server/services/order.service';
import type {
    CreateBoxInput,
    ListMarketplaceBoxesQuery,
    MarketplaceBox,
    MarketplaceBoxDetail,
    MarketplaceBoxSummary,
    MarketplaceOwnerVisibleStatus,
    PurchaseBoxParams,
    PurchaseBoxResult,
    UpdateBoxInput,
} from '@/features/marketplace/types/box';

import { createBox, findBoxById, listBoxes, updateBox } from '../repositories/box.repository';

function normalizeLivePayload(input: {
    livePlatform?: CreateBoxInput['livePlatform'] | UpdateBoxInput['livePlatform'];
    liveUrl?: CreateBoxInput['liveUrl'] | UpdateBoxInput['liveUrl'];
    liveStartsAt?: CreateBoxInput['liveStartsAt'] | UpdateBoxInput['liveStartsAt'];
    liveStatus?: CreateBoxInput['liveStatus'] | UpdateBoxInput['liveStatus'];
}) {
    if (!input.livePlatform && !input.liveUrl && !input.liveStartsAt && !input.liveStatus) {
        return {
            livePlatform: null,
            liveUrl: null,
            liveStartsAt: null,
            liveStatus: null,
        };
    }

    return {
        livePlatform: input.livePlatform ?? null,
        liveUrl: input.liveUrl ?? null,
        liveStartsAt: input.liveStartsAt ?? null,
        liveStatus: input.liveStatus ?? null,
    };
}

function toSummary(box: MarketplaceBox): MarketplaceBoxSummary {
    const { hidden_content, ...summary } = box;
    void hidden_content;
    return summary;
}

function toDetail(box: MarketplaceBox, isOwner: boolean, isUnlocked: boolean): MarketplaceBoxDetail {
    return {
        ...toSummary(box),
        hidden_content: isOwner || isUnlocked ? box.hidden_content : undefined,
        isOwner,
        isUnlocked,
        canPurchase: box.status === 'PUBLISHED' && !isOwner && !isUnlocked,
    };
}

function isOwner(box: MarketplaceBox, user: CurrentUser | null) {
    return Boolean(user && box.authorEmail && box.authorEmail === user.email);
}

function assertOwnedBox(box: MarketplaceBox | null, user: CurrentUser) {
    if (!box || box.deletedAt || box.status === 'DELETED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404);
    }

    if (!box.authorEmail || box.authorEmail !== user.email) {
        throw new AppError('FORBIDDEN', '你无权操作这条内容。', 403);
    }

    return box;
}

function normalizeMineStatuses(status?: ListMarketplaceBoxesQuery['status']) {
    if (!status) {
        return ['DRAFT', 'PUBLISHED', 'UNLISTED'] satisfies MarketplaceOwnerVisibleStatus[];
    }

    if (status === 'DELETED') {
        return [] satisfies MarketplaceOwnerVisibleStatus[];
    }

    return [status] satisfies MarketplaceOwnerVisibleStatus[];
}

export async function listMarketplaceBoxes(query: ListMarketplaceBoxesQuery = {}): Promise<MarketplaceBoxSummary[]> {
    const boxes = await listBoxes({
        itemType: query.itemType,
        q: query.q,
        authorEmail: query.authorEmail,
        statuses: ['PUBLISHED'],
    });

    return boxes.map(toSummary);
}

export async function listMyMarketplaceBoxes(
    user: CurrentUser,
    query: ListMarketplaceBoxesQuery = {},
): Promise<MarketplaceBoxSummary[]> {
    const statuses = normalizeMineStatuses(query.status);

    if (statuses.length === 0) {
        return [];
    }

    const boxes = await listBoxes({
        itemType: query.itemType,
        q: query.q,
        authorEmail: user.email,
        statuses,
    });

    return boxes.map(toSummary);
}

export async function getMarketplaceBoxDetail(id: string, user: CurrentUser | null): Promise<MarketplaceBoxDetail> {
    const box = await findBoxById(id);

    if (!box || box.deletedAt || box.status === 'DELETED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id });
    }

    const owner = isOwner(box, user);
    const unlocked = Boolean(user && !owner && await hasUnlockedBox(id, user.email));

    if (!owner && box.status !== 'PUBLISHED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id });
    }

    return toDetail(box, owner, unlocked);
}

export async function createMarketplaceBox(input: CreateBoxInput, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const now = new Date();
    const created = await createBox({
        ...input,
        barter_demand: input.accepts_barter ? input.barter_demand : null,
        ...normalizeLivePayload(input),
        authorEmail: user.email,
        authorName: user.name ?? null,
        sales_count: 0,
        publishedAt: input.status === 'PUBLISHED' ? now : null,
        deletedAt: null,
    });

    return toDetail(created, true, false);
}

export async function updateMarketplaceBox(id: string, input: UpdateBoxInput, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const box = assertOwnedBox(await findBoxById(id), user);
    const acceptsBarter = input.accepts_barter ?? box.accepts_barter;
    const barterDemand = acceptsBarter ? input.barter_demand ?? box.barter_demand : null;
    const normalizedLive = normalizeLivePayload({
        livePlatform: input.livePlatform ?? box.livePlatform,
        liveUrl: input.liveUrl ?? box.liveUrl,
        liveStartsAt: input.liveStartsAt ?? box.liveStartsAt,
        liveStatus: input.liveStatus ?? box.liveStatus,
    });

    if (acceptsBarter && !barterDemand) {
        throw new AppError('VALIDATION_ERROR', '开启交换后必须填写交换诉求。', 400);
    }

    const updated = await updateBox(id, {
        ...input,
        accepts_barter: acceptsBarter,
        barter_demand: barterDemand,
        ...normalizedLive,
        updatedAt: new Date(),
    });

    return toDetail(updated, true, false);
}

export async function publishMarketplaceBox(id: string, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const box = assertOwnedBox(await findBoxById(id), user);

    if (box.status === 'PUBLISHED') {
        return toDetail(box, true, false);
    }

    const updated = await updateBox(id, {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
    });

    return toDetail(updated, true, false);
}

export async function unlistMarketplaceBox(id: string, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const box = assertOwnedBox(await findBoxById(id), user);

    if (box.status !== 'PUBLISHED') {
        throw new AppError('CONFLICT', '只有已发布内容可以下架。', 409);
    }

    const updated = await updateBox(id, {
        status: 'UNLISTED',
        updatedAt: new Date(),
    });

    return toDetail(updated, true, false);
}

export async function deleteMarketplaceBox(id: string, user: CurrentUser): Promise<void> {
    assertOwnedBox(await findBoxById(id), user);

    await updateBox(id, {
        status: 'DELETED',
        deletedAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function purchaseMarketplaceBox(params: PurchaseBoxParams, user: CurrentUser): Promise<PurchaseBoxResult> {
    const order = await createOrder({ itemId: params.id }, user);
    const paidOrder = await payOrder(order.order.id, user);

    return {
        orderId: paidOrder.order.id,
        paid: paidOrder.order.status === 'PAID',
    };
}

export async function listAdminMarketplaceBoxes(): Promise<MarketplaceBoxSummary[]> {
    const boxes = await listBoxes({
        includeDeleted: true,
    });

    return boxes.map(toSummary);
}

export async function adminUnlistMarketplaceBox(id: string): Promise<MarketplaceBoxDetail> {
    const box = await findBoxById(id);

    if (!box || box.deletedAt || box.status === 'DELETED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id });
    }

    if (box.status !== 'PUBLISHED') {
        throw new AppError('CONFLICT', '只有已发布内容可以下架。', 409, { id, status: box.status });
    }

    const updated = await updateBox(id, {
        status: 'UNLISTED',
        updatedAt: new Date(),
    });

    return toDetail(updated, false, false);
}
