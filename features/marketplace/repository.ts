import {
    type ListMarketplaceContentQuery,
    type MarketplaceContentRecord,
    type MarketplaceContentStatus,
    type MarketplaceItemType,
} from './types.ts';

export interface MarketplaceRepositoryCreateInput {
    itemType: MarketplaceItemType;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    sales_count: number;
    authorEmail: string | null;
    authorName: string | null;
    status: MarketplaceContentStatus;
    publishedAt: Date | null;
    deletedAt: Date | null;
}

export interface MarketplaceRepositoryListInput extends ListMarketplaceContentQuery {
    statuses?: MarketplaceContentStatus[];
    includeDeleted?: boolean;
}

export interface MarketplaceRepository {
    list(input: MarketplaceRepositoryListInput): Promise<MarketplaceContentRecord[]>;
    findById(id: string): Promise<MarketplaceContentRecord | null>;
    create(input: MarketplaceRepositoryCreateInput): Promise<MarketplaceContentRecord>;
    update(id: string, input: Partial<MarketplaceRepositoryCreateInput> & Partial<Pick<MarketplaceContentRecord, 'updatedAt'>>): Promise<MarketplaceContentRecord>;
}

async function getPrisma() {
    const prismaModule = await import('../../app/lib/prisma.ts');
    return prismaModule.default;
}

type RawMarketplaceRecord = Omit<MarketplaceContentRecord, 'itemType' | 'status'> & {
    itemType: string;
    status: string;
};

function toMarketplaceItemType(value: string): MarketplaceItemType {
    return value === 'WISH' ? 'WISH' : 'OFFER';
}

function toMarketplaceStatus(value: string): MarketplaceContentStatus {
    if (value === 'DRAFT' || value === 'UNLISTED' || value === 'DELETED') {
        return value;
    }

    return 'PUBLISHED';
}

function toMarketplaceRecord(record: RawMarketplaceRecord | null): MarketplaceContentRecord | null {
    if (!record) {
        return null;
    }

    return {
        ...record,
        itemType: toMarketplaceItemType(record.itemType),
        status: toMarketplaceStatus(record.status),
    };
}

function isMarketplaceRecord(record: MarketplaceContentRecord | null): record is MarketplaceContentRecord {
    return record !== null;
}

function matchesQuery(record: MarketplaceContentRecord, query: MarketplaceRepositoryListInput) {
    if (!query.includeDeleted && (record.deletedAt || record.status === 'DELETED')) {
        return false;
    }

    if (query.itemType && record.itemType !== query.itemType) {
        return false;
    }

    if (query.authorEmail && record.authorEmail !== query.authorEmail) {
        return false;
    }

    if (query.status && record.status !== query.status) {
        return false;
    }

    if (query.statuses && !query.statuses.includes(record.status)) {
        return false;
    }

    if (query.q) {
        const keyword = query.q.toLowerCase();
        const haystack = `${record.title} ${record.hook_description}`.toLowerCase();

        if (!haystack.includes(keyword)) {
            return false;
        }
    }

    return true;
}

export const prismaMarketplaceRepository: MarketplaceRepository = {
    async list(input) {
        const prisma = await getPrisma();
        const records = await prisma.auctionItem.findMany({
            where: {
                deletedAt: input.includeDeleted ? undefined : null,
                itemType: input.itemType,
                authorEmail: input.authorEmail,
                status: input.statuses ? { in: input.statuses } : input.status,
                OR: input.q
                    ? [
                        { title: { contains: input.q } },
                        { hook_description: { contains: input.q } },
                    ]
                    : undefined,
            },
            orderBy: { createdAt: 'desc' },
        });

        return records.map((record) => toMarketplaceRecord(record)).filter(isMarketplaceRecord);
    },
    async findById(id) {
        const prisma = await getPrisma();
        const record = await prisma.auctionItem.findUnique({
            where: { id },
        });

        return toMarketplaceRecord(record);
    },
    async create(input) {
        const prisma = await getPrisma();
        const record = await prisma.auctionItem.create({
            data: input,
        });

        const nextRecord = toMarketplaceRecord(record);

        if (!nextRecord) {
            throw new Error('Failed to create marketplace record.');
        }

        return nextRecord;
    },
    async update(id, input) {
        const prisma = await getPrisma();
        const record = await prisma.auctionItem.update({
            where: { id },
            data: input,
        });

        const nextRecord = toMarketplaceRecord(record);

        if (!nextRecord) {
            throw new Error(`Failed to update marketplace record ${id}.`);
        }

        return nextRecord;
    },
};

export function createInMemoryMarketplaceRepository(seed: MarketplaceContentRecord[] = []): MarketplaceRepository {
    const records = [...seed].map((record) => ({ ...record }));
    let sequence = records.length;

    return {
        async list(input) {
            return records
                .filter((record) => matchesQuery(record, input))
                .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
                .map((record) => ({ ...record }));
        },
        async findById(id) {
            const record = records.find((entry) => entry.id === id);

            return record ? { ...record } : null;
        },
        async create(input) {
            const now = new Date();
            const record: MarketplaceContentRecord = {
                id: `content_${sequence += 1}`,
                createdAt: now,
                updatedAt: now,
                ...input,
            };
            records.push(record);
            return { ...record };
        },
        async update(id, input) {
            const index = records.findIndex((entry) => entry.id === id);

            if (index < 0) {
                throw new Error(`Missing record ${id}`);
            }

            records[index] = {
                ...records[index],
                ...input,
                updatedAt: input.updatedAt ?? new Date(),
            };

            return { ...records[index] };
        },
    };
}
