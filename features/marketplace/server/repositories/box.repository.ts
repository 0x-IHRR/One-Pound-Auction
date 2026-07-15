import type { Prisma } from '@prisma/client';

import prisma from '@/server/db/prisma';
import type {
    CreateBoxInput,
    ListMarketplaceBoxesQuery,
    MarketplaceBox,
    MarketplaceContentStatus,
    MarketplaceFulfillmentMode,
    MarketplaceItemType,
    MarketplaceLivePlatform,
    MarketplaceLiveStatus,
    MarketplaceProblemStatus,
    MarketplaceSourceType,
    UpdateBoxInput,
} from '@/features/marketplace/types/box';

type BoxRepositoryFilters = ListMarketplaceBoxesQuery & {
    statuses?: MarketplaceContentStatus[];
    includeDeleted?: boolean;
};

type BoxCreateData = CreateBoxInput & {
    authorEmail: string | null;
    authorName: string | null;
    sales_count: number;
    publishedAt: Date | null;
    deletedAt: Date | null;
};

type BoxUpdateData = UpdateBoxInput & {
    sales_count?: number;
    status?: MarketplaceContentStatus;
    fulfillmentMode?: MarketplaceFulfillmentMode;
    problemStatus?: MarketplaceProblemStatus | null;
    sourceType?: MarketplaceSourceType;
    submitterContact?: string | null;
    submitterContext?: string | null;
    authorEmail?: string | null;
    authorName?: string | null;
    publishedAt?: Date | null;
    deletedAt?: Date | null;
    updatedAt?: Date;
};

function normalizeLivePlatform(value: string | null | undefined): MarketplaceLivePlatform | null {
    if (value === 'ZOOM' || value === 'X_SPACES' || value === 'OTHER') {
        return value;
    }

    return null;
}

function normalizeLiveStatus(value: string | null | undefined): MarketplaceLiveStatus | null {
    if (value === 'SCHEDULED' || value === 'LIVE' || value === 'ENDED') {
        return value;
    }

    return null;
}

function normalizeItemType(value: string): MarketplaceItemType {
    return value === 'WISH' ? 'WISH' : 'OFFER';
}

function normalizeStatus(value: string): MarketplaceContentStatus {
    if (value === 'DRAFT' || value === 'UNLISTED' || value === 'DELETED') {
        return value;
    }

    return 'PUBLISHED';
}

function normalizeFulfillmentMode(value: string): MarketplaceFulfillmentMode {
    return value === 'FREE_HELP_REQUEST' ? 'FREE_HELP_REQUEST' : 'PAID_UNLOCK';
}

function normalizeProblemStatus(value: string | null | undefined): MarketplaceProblemStatus | null {
    if (value === 'OPEN' || value === 'IN_PROGRESS' || value === 'SOLVED') {
        return value;
    }

    return null;
}

function normalizeSourceType(value: string | null | undefined): MarketplaceSourceType {
    if (value === 'SOCIAL_COLLECTOR' || value === 'REDDIT_MANUAL') {
        return value;
    }

    return 'CREATOR';
}

function mapBox(record: {
    id: string;
    itemType: string;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    sales_count: number;
    authorEmail: string | null;
    authorName: string | null;
    status: string;
    livePlatform: string | null;
    liveUrl: string | null;
    liveStartsAt: Date | null;
    liveStatus: string | null;
    fulfillmentMode: string;
    problemStatus: string | null;
    sourceType: string | null;
    submitterContact: string | null;
    submitterContext: string | null;
    sourceUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    deletedAt: Date | null;
    _count?: {
        unlockRecords: number;
    };
}): MarketplaceBox {
    const { _count, ...rest } = record;

    return {
        ...rest,
        sales_count: _count?.unlockRecords ?? record.sales_count,
        itemType: normalizeItemType(record.itemType),
        status: normalizeStatus(record.status),
        livePlatform: normalizeLivePlatform(record.livePlatform),
        liveStatus: normalizeLiveStatus(record.liveStatus),
        fulfillmentMode: normalizeFulfillmentMode(record.fulfillmentMode),
        problemStatus: normalizeProblemStatus(record.problemStatus),
        sourceType: normalizeSourceType(record.sourceType),
    };
}

export async function listBoxes(filters: BoxRepositoryFilters = {}): Promise<MarketplaceBox[]> {
    const where: Prisma.AuctionItemWhereInput = {
        deletedAt: filters.includeDeleted ? undefined : null,
        itemType: filters.itemType,
        authorEmail: filters.authorEmail,
        status: filters.statuses ? { in: filters.statuses } : filters.status,
        OR: filters.q
            ? [
                { title: { contains: filters.q } },
                { hook_description: { contains: filters.q } },
            ]
            : undefined,
    };

    const records = await prisma.auctionItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    unlockRecords: true,
                },
            },
        },
    });

    return records.map(mapBox);
}

export async function createBox(data: BoxCreateData): Promise<MarketplaceBox> {
    const record = await prisma.auctionItem.create({
        data,
    });

    return mapBox(record);
}

export async function findBoxById(id: string): Promise<MarketplaceBox | null> {
    const record = await prisma.auctionItem.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    unlockRecords: true,
                },
            },
        },
    });

    return record ? mapBox(record) : null;
}

export async function updateBox(id: string, data: BoxUpdateData): Promise<MarketplaceBox> {
    const record = await prisma.auctionItem.update({
        where: { id },
        data,
        include: {
            _count: {
                select: {
                    unlockRecords: true,
                },
            },
        },
    });

    return mapBox(record);
}
