export const marketplaceItemTypes = ['OFFER', 'WISH'] as const;
export const marketplaceContentStatuses = ['DRAFT', 'PUBLISHED', 'UNLISTED', 'DELETED'] as const;
export const ownerVisibleMarketplaceStatuses = ['DRAFT', 'PUBLISHED', 'UNLISTED'] as const;
export const marketplaceLivePlatforms = ['ZOOM', 'X_SPACES', 'OTHER'] as const;
export const marketplaceLiveStatuses = ['SCHEDULED', 'LIVE', 'ENDED'] as const;
export const marketplaceFulfillmentModes = ['PAID_UNLOCK', 'FREE_HELP_REQUEST'] as const;
export const marketplaceProblemStatuses = ['OPEN', 'IN_PROGRESS', 'SOLVED'] as const;
export const marketplaceSourceTypes = ['CREATOR', 'SOCIAL_COLLECTOR', 'REDDIT_MANUAL'] as const;

export type MarketplaceItemType = (typeof marketplaceItemTypes)[number];
export type MarketplaceContentStatus = (typeof marketplaceContentStatuses)[number];
export type MarketplaceOwnerVisibleStatus = (typeof ownerVisibleMarketplaceStatuses)[number];
export type MarketplaceLivePlatform = (typeof marketplaceLivePlatforms)[number];
export type MarketplaceLiveStatus = (typeof marketplaceLiveStatuses)[number];
export type MarketplaceFulfillmentMode = (typeof marketplaceFulfillmentModes)[number];
export type MarketplaceProblemStatus = (typeof marketplaceProblemStatuses)[number];
export type MarketplaceSourceType = (typeof marketplaceSourceTypes)[number];

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
    livePlatform: MarketplaceLivePlatform | null;
    liveUrl: string | null;
    liveStartsAt: Date | null;
    liveStatus: MarketplaceLiveStatus | null;
    fulfillmentMode: MarketplaceFulfillmentMode;
    problemStatus: MarketplaceProblemStatus | null;
    sourceType: MarketplaceSourceType;
    submitterContact: string | null;
    submitterContext: string | null;
    sourceUrl: string | null;
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
    livePlatform: MarketplaceLivePlatform | null;
    liveUrl: string | null;
    liveStartsAt: Date | null;
    liveStatus: MarketplaceLiveStatus | null;
    fulfillmentMode?: MarketplaceFulfillmentMode;
    problemStatus?: MarketplaceProblemStatus | null;
    sourceType?: MarketplaceSourceType;
    submitterContact?: string | null;
    submitterContext?: string | null;
    sourceUrl?: string | null;
};

export type UpdateBoxInput = {
    itemType?: MarketplaceItemType;
    title?: string;
    hook_description?: string;
    hidden_content?: string;
    price?: number;
    accepts_barter?: boolean;
    barter_demand?: string | null;
    livePlatform?: MarketplaceLivePlatform | null;
    liveUrl?: string | null;
    liveStartsAt?: Date | null;
    liveStatus?: MarketplaceLiveStatus | null;
    sourceUrl?: string | null;
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
    orderId: string;
    paid: boolean;
};

export type MarketplaceBoxSummary = Omit<MarketplaceBox, 'hidden_content' | 'submitterContact' | 'submitterContext' | 'sourceUrl'>;
export type AdminMarketplaceBoxSummary = Omit<MarketplaceBox, 'hidden_content'>;

export type MarketplaceBoxDetail = MarketplaceBoxSummary & {
    hidden_content?: string;
    isOwner: boolean;
    isUnlocked: boolean;
    canPurchase: boolean;
};
