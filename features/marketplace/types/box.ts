export const marketplaceItemTypes = ['OFFER', 'WISH'] as const;
export const marketplaceContentStatuses = ['DRAFT', 'PUBLISHED', 'UNLISTED', 'DELETED'] as const;
export const ownerVisibleMarketplaceStatuses = ['DRAFT', 'PUBLISHED', 'UNLISTED'] as const;

export type MarketplaceItemType = (typeof marketplaceItemTypes)[number];
export type MarketplaceContentStatus = (typeof marketplaceContentStatuses)[number];
export type MarketplaceOwnerVisibleStatus = (typeof ownerVisibleMarketplaceStatuses)[number];

export type MarketplaceBox = {
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
};

export type CreateBoxInput = {
    itemType: MarketplaceItemType;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    status: Extract<MarketplaceContentStatus, 'DRAFT' | 'PUBLISHED'>;
};

export type UpdateBoxInput = {
    itemType?: MarketplaceItemType;
    title?: string;
    hook_description?: string;
    hidden_content?: string;
    price?: number;
    accepts_barter?: boolean;
    barter_demand?: string | null;
};

export type ListMarketplaceBoxesQuery = {
    itemType?: MarketplaceItemType;
    q?: string;
    status?: MarketplaceContentStatus;
    authorEmail?: string;
};

export type PurchaseBoxParams = {
    id: string;
};

export type PurchaseBoxResult = {
    hidden_content: string;
};

export type MarketplaceBoxSummary = Omit<MarketplaceBox, 'hidden_content'>;

export type MarketplaceBoxDetail = MarketplaceBoxSummary & {
    hidden_content?: string;
    isOwner: boolean;
};
