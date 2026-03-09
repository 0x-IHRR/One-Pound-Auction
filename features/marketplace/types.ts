export const MARKETPLACE_ITEM_TYPES = ['OFFER', 'WISH'] as const;
export const MARKETPLACE_CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'UNLISTED', 'DELETED'] as const;
export const MARKETPLACE_VISIBLE_OWNER_STATUSES = ['DRAFT', 'PUBLISHED', 'UNLISTED'] as const;

export type MarketplaceItemType = (typeof MARKETPLACE_ITEM_TYPES)[number];
export type MarketplaceContentStatus = (typeof MARKETPLACE_CONTENT_STATUSES)[number];
export type MarketplaceOwnerVisibleStatus = (typeof MARKETPLACE_VISIBLE_OWNER_STATUSES)[number];

export interface CreateMarketplaceContentInput {
    itemType: MarketplaceItemType;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    status: Extract<MarketplaceContentStatus, 'DRAFT' | 'PUBLISHED'>;
}

export interface UpdateMarketplaceContentInput {
    itemType?: MarketplaceItemType;
    title?: string;
    hook_description?: string;
    hidden_content?: string;
    price?: number;
    accepts_barter?: boolean;
    barter_demand?: string | null;
}

export interface ListMarketplaceContentQuery {
    itemType?: MarketplaceItemType;
    q?: string;
    status?: MarketplaceContentStatus;
    authorEmail?: string;
}

export interface MarketplaceContentSummary {
    id: string;
    itemType: MarketplaceItemType;
    title: string;
    hook_description: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    sales_count: number;
    authorEmail: string | null;
    authorName: string | null;
    status: MarketplaceContentStatus;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}

export interface MarketplaceContentDetail extends MarketplaceContentSummary {
    hidden_content?: string;
    deletedAt: string | null;
    isOwner: boolean;
}

export interface MarketplaceContentRecord {
    id: string;
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
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    deletedAt: Date | null;
}
