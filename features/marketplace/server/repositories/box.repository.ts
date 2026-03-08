import prisma from '@/server/db/prisma';
import type { CreateBoxInput, MarketplaceBox } from '@/features/marketplace/types/box';

export async function listBoxes(): Promise<MarketplaceBox[]> {
    return prisma.auctionItem.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createBox(data: CreateBoxInput): Promise<MarketplaceBox> {
    return prisma.auctionItem.create({
        data,
    });
}

export async function findBoxById(id: string): Promise<MarketplaceBox | null> {
    return prisma.auctionItem.findUnique({
        where: { id },
    });
}

export async function incrementSalesCount(id: string): Promise<MarketplaceBox> {
    return prisma.auctionItem.update({
        where: { id },
        data: {
            sales_count: {
                increment: 1,
            },
        },
    });
}
