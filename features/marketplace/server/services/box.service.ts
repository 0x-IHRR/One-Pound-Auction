import { AppError } from '@/shared/errors';
import type { CurrentUser } from '@/app/lib/auth/session';
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

import { createBox, findBoxById, incrementSalesCount, listBoxes, updateBox } from '../repositories/box.repository';

function toSummary(box: MarketplaceBox): MarketplaceBoxSummary {
    const { hidden_content, ...summary } = box;
    void hidden_content;
    return summary;
}

function toDetail(box: MarketplaceBox, isOwner: boolean): MarketplaceBoxDetail {
    return {
        ...toSummary(box),
        hidden_content: isOwner ? box.hidden_content : undefined,
        isOwner,
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

    if (!owner && box.status !== 'PUBLISHED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id });
    }

    return toDetail(box, owner);
}

export async function createMarketplaceBox(input: CreateBoxInput, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const now = new Date();
    const created = await createBox({
        ...input,
        barter_demand: input.accepts_barter ? input.barter_demand : null,
        authorEmail: user.email,
        authorName: user.name ?? null,
        sales_count: 0,
        publishedAt: input.status === 'PUBLISHED' ? now : null,
        deletedAt: null,
    });

    return toDetail(created, true);
}

export async function updateMarketplaceBox(id: string, input: UpdateBoxInput, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const box = assertOwnedBox(await findBoxById(id), user);
    const acceptsBarter = input.accepts_barter ?? box.accepts_barter;
    const barterDemand = acceptsBarter ? input.barter_demand ?? box.barter_demand : null;

    if (acceptsBarter && !barterDemand) {
        throw new AppError('VALIDATION_ERROR', '开启交换后必须填写交换诉求。', 400);
    }

    const updated = await updateBox(id, {
        ...input,
        accepts_barter: acceptsBarter,
        barter_demand: barterDemand,
        updatedAt: new Date(),
    });

    return toDetail(updated, true);
}

export async function publishMarketplaceBox(id: string, user: CurrentUser): Promise<MarketplaceBoxDetail> {
    const box = assertOwnedBox(await findBoxById(id), user);

    if (box.status === 'PUBLISHED') {
        return toDetail(box, true);
    }

    const updated = await updateBox(id, {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
    });

    return toDetail(updated, true);
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

    return toDetail(updated, true);
}

export async function deleteMarketplaceBox(id: string, user: CurrentUser): Promise<void> {
    assertOwnedBox(await findBoxById(id), user);

    await updateBox(id, {
        status: 'DELETED',
        deletedAt: new Date(),
        updatedAt: new Date(),
    });
}

export async function purchaseMarketplaceBox(params: PurchaseBoxParams): Promise<PurchaseBoxResult> {
    const box = await findBoxById(params.id);

    if (!box || box.deletedAt || box.status === 'DELETED') {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id: params.id });
    }

    if (box.status !== 'PUBLISHED') {
        throw new AppError('CONFLICT', '当前内容不可购买。', 409, { id: params.id, status: box.status });
    }

    const updatedBox = await incrementSalesCount(params.id);

    return {
        hidden_content: updatedBox.hidden_content,
    };
}
