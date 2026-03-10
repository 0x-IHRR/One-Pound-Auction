import { beforeEach, describe, expect, it, vi } from 'vitest';

const repositoryMocks = vi.hoisted(() => ({
    createBox: vi.fn(),
    findBoxById: vi.fn(),
    listBoxes: vi.fn(),
    updateBox: vi.fn(),
}));

const orderServiceMocks = vi.hoisted(() => ({
    createOrder: vi.fn(),
    hasUnlockedBox: vi.fn(),
    payOrder: vi.fn(),
}));

vi.mock('@/features/marketplace/server/repositories/box.repository', () => repositoryMocks);
vi.mock('@/features/order-payment/server/services/order.service', () => orderServiceMocks);

import {
    createMarketplaceBox,
    deleteMarketplaceBox,
    getMarketplaceBoxDetail,
    listMarketplaceBoxes,
    publishMarketplaceBox,
    purchaseMarketplaceBox,
    unlistMarketplaceBox,
    updateMarketplaceBox,
} from '@/features/marketplace/server/services/box.service';

function makeBox(overrides: Record<string, unknown> = {}) {
    const now = new Date('2026-03-09T08:00:00.000Z');

    return {
        id: 'box-1',
        itemType: 'OFFER',
        title: '标题',
        hook_description: '描述',
        hidden_content: '隐藏内容',
        price: 1,
        accepts_barter: false,
        barter_demand: null,
        sales_count: 0,
        authorEmail: 'owner@example.com',
        authorName: 'Owner',
        status: 'PUBLISHED',
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
        deletedAt: null,
        ...overrides,
    };
}

const currentUser = {
    email: 'owner@example.com',
    name: 'Owner',
    role: 'USER' as const,
};

describe('marketplace box service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        orderServiceMocks.hasUnlockedBox.mockResolvedValue(false);
    });

    it('创建内容时写入作者归属并返回作者详情', async () => {
        repositoryMocks.createBox.mockResolvedValue(makeBox({
            status: 'DRAFT',
            publishedAt: null,
        }));

        await expect(createMarketplaceBox({
            itemType: 'OFFER',
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            price: 1,
            accepts_barter: false,
            barter_demand: '不会被保留',
            status: 'DRAFT',
        }, currentUser)).resolves.toMatchObject({
            authorEmail: 'owner@example.com',
            authorName: 'Owner',
            status: 'DRAFT',
            isOwner: true,
            hidden_content: '隐藏内容',
        });

        expect(repositoryMocks.createBox).toHaveBeenCalledWith(expect.objectContaining({
            authorEmail: 'owner@example.com',
            authorName: 'Owner',
            barter_demand: null,
            publishedAt: null,
        }));
    });

    it('公共列表只查询已发布内容', async () => {
        repositoryMocks.listBoxes.mockResolvedValue([makeBox()]);

        await expect(listMarketplaceBoxes({
            itemType: 'OFFER',
            q: '简历',
        })).resolves.toHaveLength(1);

        expect(repositoryMocks.listBoxes).toHaveBeenCalledWith({
            itemType: 'OFFER',
            q: '简历',
            authorEmail: undefined,
            statuses: ['PUBLISHED'],
        });
    });

    it('只能编辑自己的内容', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            authorEmail: 'other@example.com',
            authorName: 'Other',
        }));

        await expect(updateMarketplaceBox('box-1', {
            title: '新的标题',
        }, currentUser)).rejects.toMatchObject({
            code: 'FORBIDDEN',
            status: 403,
        });
    });

    it('只能发布自己的内容', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            status: 'DRAFT',
            publishedAt: null,
            authorEmail: 'other@example.com',
        }));

        await expect(publishMarketplaceBox('box-1', currentUser)).rejects.toMatchObject({
            code: 'FORBIDDEN',
            status: 403,
        });
    });

    it('只能下架自己的内容', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            authorEmail: 'other@example.com',
        }));

        await expect(unlistMarketplaceBox('box-1', currentUser)).rejects.toMatchObject({
            code: 'FORBIDDEN',
            status: 403,
        });
    });

    it('软删除时写入 DELETED 状态', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox());
        repositoryMocks.updateBox.mockResolvedValue(makeBox({
            status: 'DELETED',
            deletedAt: new Date('2026-03-09T09:00:00.000Z'),
        }));

        await expect(deleteMarketplaceBox('box-1', currentUser)).resolves.toBeUndefined();
        expect(repositoryMocks.updateBox).toHaveBeenCalledWith('box-1', expect.objectContaining({
            status: 'DELETED',
            deletedAt: expect.any(Date),
        }));
    });

    it('公共详情不能读取草稿、下架和删除内容', async () => {
        repositoryMocks.findBoxById
            .mockResolvedValueOnce(makeBox({
                status: 'DRAFT',
                publishedAt: null,
            }))
            .mockResolvedValueOnce(makeBox({
                status: 'UNLISTED',
            }))
            .mockResolvedValueOnce(makeBox({
                status: 'DELETED',
                deletedAt: new Date('2026-03-09T09:00:00.000Z'),
            }));

        await expect(getMarketplaceBoxDetail('box-1', null)).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
        await expect(getMarketplaceBoxDetail('box-1', null)).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
        await expect(getMarketplaceBoxDetail('box-1', null)).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
    });

    it('购买未发布内容时返回业务错误', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            status: 'UNLISTED',
        }));

        await expect(getMarketplaceBoxDetail('box-1', null)).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
    });

    it('购买不存在资源时抛出 404 业务错误', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(null);

        await expect(getMarketplaceBoxDetail('missing-id', null)).rejects.toMatchObject({
            code: 'NOT_FOUND',
            status: 404,
        });
    });

    it('已解锁用户读取详情时可见隐藏内容', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox());
        orderServiceMocks.hasUnlockedBox.mockResolvedValue(true);

        await expect(getMarketplaceBoxDetail('box-1', {
            email: 'buyer@example.com',
            name: 'Buyer',
            role: 'USER',
        })).resolves.toMatchObject({
            isUnlocked: true,
            hidden_content: '隐藏内容',
        });
    });

    it('兼容购买入口委托订单域处理支付', async () => {
        orderServiceMocks.createOrder.mockResolvedValue({
            order: {
                id: 'order-1',
            },
        });
        orderServiceMocks.payOrder.mockResolvedValue({
            order: {
                id: 'order-1',
                status: 'PAID',
            },
        });

        await expect(purchaseMarketplaceBox({ id: 'box-1' }, {
            email: 'buyer@example.com',
            name: 'Buyer',
            role: 'USER',
        })).resolves.toEqual({
            orderId: 'order-1',
            paid: true,
        });
    });
});
