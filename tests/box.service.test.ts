import { beforeEach, describe, expect, it, vi } from 'vitest';

const repositoryMocks = vi.hoisted(() => ({
    createBox: vi.fn(),
    findBoxById: vi.fn(),
    incrementSalesCount: vi.fn(),
    listBoxes: vi.fn(),
}));

vi.mock('@/features/marketplace/server/repositories/box.repository', () => repositoryMocks);

import { createMarketplaceBox, purchaseMarketplaceBox } from '@/features/marketplace/server/services/box.service';

describe('marketplace box service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('在不接受交换时会清空 barter_demand', async () => {
        repositoryMocks.createBox.mockResolvedValue({
            id: 'box-1',
            itemType: 'OFFER',
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            price: 1,
            accepts_barter: false,
            barter_demand: null,
            sales_count: 0,
            createdAt: new Date(),
        });

        await createMarketplaceBox({
            itemType: 'OFFER',
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            price: 1,
            accepts_barter: false,
            barter_demand: '不会被保留',
        });

        expect(repositoryMocks.createBox).toHaveBeenCalledWith(expect.objectContaining({
            barter_demand: null,
        }));
    });

    it('购买不存在资源时抛出 404 业务错误', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(null);

        await expect(purchaseMarketplaceBox({ id: 'missing-id' })).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
    });

    it('购买成功时返回隐藏内容', async () => {
        repositoryMocks.findBoxById.mockResolvedValue({
            id: 'box-1',
        });
        repositoryMocks.incrementSalesCount.mockResolvedValue({
            hidden_content: '真正内容',
        });

        await expect(purchaseMarketplaceBox({ id: 'box-1' })).resolves.toEqual({
            hidden_content: '真正内容',
        });
    });
});
