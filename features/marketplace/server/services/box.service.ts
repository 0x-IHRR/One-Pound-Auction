import { AppError } from '@/shared/errors';
import type { CreateBoxInput, MarketplaceBox, PurchaseBoxParams, PurchaseBoxResult } from '@/features/marketplace/types/box';

import { createBox, findBoxById, incrementSalesCount, listBoxes } from '../repositories/box.repository';

export async function listMarketplaceBoxes(): Promise<MarketplaceBox[]> {
    return listBoxes();
}

export async function createMarketplaceBox(input: CreateBoxInput): Promise<MarketplaceBox> {
    return createBox({
        ...input,
        barter_demand: input.accepts_barter ? input.barter_demand : null,
    });
}

export async function purchaseMarketplaceBox(params: PurchaseBoxParams): Promise<PurchaseBoxResult> {
    const box = await findBoxById(params.id);

    if (!box) {
        throw new AppError('NOT_FOUND', '目标内容不存在。', 404, { id: params.id });
    }

    const updatedBox = await incrementSalesCount(params.id);

    return {
        hidden_content: updatedBox.hidden_content,
    };
}
