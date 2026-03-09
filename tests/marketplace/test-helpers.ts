import type { CurrentUser } from '../../app/lib/current-user.ts';
import type { MarketplaceContentRecord } from '../../features/marketplace/types.ts';

export const ownerUser: CurrentUser = {
    email: 'owner@example.com',
    name: 'Owner',
    role: 'USER',
};

export const anotherUser: CurrentUser = {
    email: 'another@example.com',
    name: 'Another',
    role: 'USER',
};

export function createRecord(overrides: Partial<MarketplaceContentRecord> = {}): MarketplaceContentRecord {
    return {
        id: overrides.id ?? 'content_seed',
        itemType: overrides.itemType ?? 'OFFER',
        title: overrides.title ?? '默认标题',
        hook_description: overrides.hook_description ?? '默认描述',
        hidden_content: overrides.hidden_content ?? '隐藏内容',
        price: overrides.price ?? 1,
        accepts_barter: overrides.accepts_barter ?? false,
        barter_demand: overrides.barter_demand ?? null,
        sales_count: overrides.sales_count ?? 0,
        authorEmail: overrides.authorEmail ?? ownerUser.email,
        authorName: overrides.authorName ?? ownerUser.name,
        status: overrides.status ?? 'PUBLISHED',
        createdAt: overrides.createdAt ?? new Date('2026-03-01T08:00:00.000Z'),
        updatedAt: overrides.updatedAt ?? new Date('2026-03-01T08:00:00.000Z'),
        publishedAt: overrides.publishedAt ?? new Date('2026-03-01T08:00:00.000Z'),
        deletedAt: overrides.deletedAt ?? null,
    };
}
