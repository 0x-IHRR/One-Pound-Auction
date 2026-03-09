export const marketplaceItemTypes = ['OFFER', 'WISH'] as const;

export type MarketplaceItemType = (typeof marketplaceItemTypes)[number];

export type MarketplaceBox = {
    id: string;
    itemType: string;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
    sales_count: number;
    createdAt: Date;
};

export type CreateBoxInput = {
    itemType: MarketplaceItemType;
    title: string;
    hook_description: string;
    hidden_content: string;
    price: number;
    accepts_barter: boolean;
    barter_demand: string | null;
};

export type PurchaseBoxParams = {
    id: string;
};

export type PurchaseBoxResult = {
    hidden_content: string;
};
