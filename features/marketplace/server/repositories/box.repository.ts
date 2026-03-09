import type { Prisma } from '@prisma/client';

import prisma from '@/server/db/prisma';
import type {
    CreateBoxInput,
    ListMarketplaceBoxesQuery,
    MarketplaceBox,
    MarketplaceContentStatus,
    MarketplaceItemType,
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
    authorEmail?: string | null;
    authorName?: string | null;
    publishedAt?: Date | null;
    deletedAt?: Date | null;
    updatedAt?: Date;
};

function normalizeItemType(value: string): MarketplaceItemType {
    return value === 'WISH' ? 'WISH' : 'OFFER';
}

function normalizeStatus(value: string): MarketplaceContentStatus {
    if (value === 'DRAFT' || value === 'UNLISTED' || value === 'DELETED') {
        return value;
    }

    return 'PUBLISHED';
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
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    deletedAt: Date | null;
}): MarketplaceBox {
    return {
        ...record,
        itemType: normalizeItemType(record.itemType),
        status: normalizeStatus(record.status),
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
    });

    return record ? mapBox(record) : null;
}

export async function incrementSalesCount(id: string): Promise<MarketplaceBox> {
    const record = await prisma.auctionItem.update({
        where: { id },
        data: {
            sales_count: {
                increment: 1,
            },
        },
    });

    return mapBox(record);
}

export async function updateBox(id: string, data: BoxUpdateData): Promise<MarketplaceBox> {
    const record = await prisma.auctionItem.update({
        where: { id },
        data,
    });

    return mapBox(record);
}
