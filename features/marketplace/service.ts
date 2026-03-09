import type { CurrentUser } from '../../app/lib/current-user.ts';
import { MarketplaceError } from './errors.ts';
import {
    prismaMarketplaceRepository,
    type MarketplaceRepository,
} from './repository.ts';
import {
    type CreateMarketplaceContentInput,
    type ListMarketplaceContentQuery,
    type MarketplaceContentDetail,
    type MarketplaceContentRecord,
    type MarketplaceContentSummary,
    type MarketplaceOwnerVisibleStatus,
    type UpdateMarketplaceContentInput,
} from './types.ts';

function toIsoString(value: Date | null) {
    return value ? value.toISOString() : null;
}

function toSummary(record: MarketplaceContentRecord): MarketplaceContentSummary {
    return {
        id: record.id,
        itemType: record.itemType,
        title: record.title,
        hook_description: record.hook_description,
        price: record.price,
        accepts_barter: record.accepts_barter,
        barter_demand: record.barter_demand,
        sales_count: record.sales_count,
        authorEmail: record.authorEmail,
        authorName: record.authorName,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        publishedAt: toIsoString(record.publishedAt),
    };
}

function toDetail(record: MarketplaceContentRecord, isOwner: boolean): MarketplaceContentDetail {
    return {
        ...toSummary(record),
        hidden_content: isOwner ? record.hidden_content : undefined,
        deletedAt: toIsoString(record.deletedAt),
        isOwner,
    };
}

function isOwner(record: MarketplaceContentRecord, user: CurrentUser | null) {
    return Boolean(user && record.authorEmail && record.authorEmail === user.email);
}

function assertOwnedRecord(record: MarketplaceContentRecord | null, user: CurrentUser) {
    if (!record || record.deletedAt || record.status === 'DELETED') {
        throw new MarketplaceError('内容不存在。', 404, 'CONTENT_NOT_FOUND');
    }

    if (!record.authorEmail || record.authorEmail !== user.email) {
        throw new MarketplaceError('你无权操作这条内容。', 403, 'CONTENT_FORBIDDEN');
    }

    return record;
}

function normalizeMineStatuses(status?: ListMarketplaceContentQuery['status']) {
    if (!status) {
        return ['DRAFT', 'PUBLISHED', 'UNLISTED'] as MarketplaceOwnerVisibleStatus[];
    }

    if (status === 'DELETED') {
        return [] as MarketplaceOwnerVisibleStatus[];
    }

    return [status] as MarketplaceOwnerVisibleStatus[];
}

export function createMarketplaceService(repository: MarketplaceRepository = prismaMarketplaceRepository) {
    return {
        async listPublicContents(query: ListMarketplaceContentQuery = {}) {
            const records = await repository.list({
                itemType: query.itemType,
                q: query.q,
                authorEmail: query.authorEmail,
                statuses: ['PUBLISHED'],
                includeDeleted: false,
            });

            return records.map(toSummary);
        },

        async listMyContents(query: ListMarketplaceContentQuery, user: CurrentUser) {
            const statuses = normalizeMineStatuses(query.status);

            if (statuses.length === 0) {
                return [];
            }

            const records = await repository.list({
                itemType: query.itemType,
                q: query.q,
                authorEmail: user.email,
                statuses,
                includeDeleted: false,
            });

            return records.map(toSummary);
        },

        async getContentDetail(id: string, user: CurrentUser | null) {
            const record = await repository.findById(id);

            if (!record || record.deletedAt || record.status === 'DELETED') {
                throw new MarketplaceError('内容不存在。', 404, 'CONTENT_NOT_FOUND');
            }

            const owner = isOwner(record, user);

            if (!owner && record.status !== 'PUBLISHED') {
                throw new MarketplaceError('内容不存在。', 404, 'CONTENT_NOT_FOUND');
            }

            return toDetail(record, owner);
        },

        async createContent(input: CreateMarketplaceContentInput, user: CurrentUser) {
            const now = new Date();
            const record = await repository.create({
                ...input,
                authorEmail: user.email,
                authorName: user.name,
                sales_count: 0,
                publishedAt: input.status === 'PUBLISHED' ? now : null,
                deletedAt: null,
            });

            return toDetail(record, true);
        },

        async updateContent(id: string, input: UpdateMarketplaceContentInput, user: CurrentUser) {
            const record = assertOwnedRecord(await repository.findById(id), user);
            const acceptsBarter = input.accepts_barter ?? record.accepts_barter;
            const barterDemand = acceptsBarter ? input.barter_demand ?? record.barter_demand : null;

            if (acceptsBarter && !barterDemand) {
                throw new MarketplaceError('开启交换后必须填写交换诉求。', 400, 'INVALID_BARTER_DEMAND');
            }

            const updated = await repository.update(id, {
                ...input,
                accepts_barter: acceptsBarter,
                barter_demand: barterDemand,
                updatedAt: new Date(),
            });

            return toDetail(updated, true);
        },

        async publishContent(id: string, user: CurrentUser) {
            const record = assertOwnedRecord(await repository.findById(id), user);

            if (record.status === 'PUBLISHED') {
                return toDetail(record, true);
            }

            const updated = await repository.update(id, {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                deletedAt: null,
                updatedAt: new Date(),
            });

            return toDetail(updated, true);
        },

        async unlistContent(id: string, user: CurrentUser) {
            const record = assertOwnedRecord(await repository.findById(id), user);

            if (record.status !== 'PUBLISHED') {
                throw new MarketplaceError('只有已发布内容可以下架。', 409, 'CONTENT_NOT_PUBLISHED');
            }

            const updated = await repository.update(id, {
                status: 'UNLISTED',
                updatedAt: new Date(),
            });

            return toDetail(updated, true);
        },

        async softDeleteContent(id: string, user: CurrentUser) {
            assertOwnedRecord(await repository.findById(id), user);

            const updated = await repository.update(id, {
                status: 'DELETED',
                deletedAt: new Date(),
                updatedAt: new Date(),
            });

            return toDetail(updated, true);
        },

        async purchaseContent(id: string) {
            const record = await repository.findById(id);

            if (!record || record.deletedAt || record.status !== 'PUBLISHED') {
                throw new MarketplaceError('当前内容不可购买。', 409, 'CONTENT_NOT_PURCHASABLE');
            }

            const updated = await repository.update(id, {
                sales_count: record.sales_count + 1,
                updatedAt: new Date(),
            });

            return {
                hidden_content: updated.hidden_content,
            };
        },
    };
}

export type MarketplaceService = ReturnType<typeof createMarketplaceService>;

export const marketplaceService = createMarketplaceService();
