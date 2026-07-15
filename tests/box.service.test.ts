import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    adminUpdateProblemStatus,
    createMarketplaceBox,
    deleteMarketplaceBox,
    getMarketplaceBoxDetail,
    listAdminMarketplaceBoxes,
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
            livePlatform: null,
            liveUrl: null,
            liveStartsAt: null,
            liveStatus: null,
            fulfillmentMode: 'PAID_UNLOCK',
            problemStatus: null,
            sourceType: 'CREATOR',
            submitterContact: null,
            submitterContext: null,
            sourceUrl: null,
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

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('创建内容时写入作者归属并返回作者详情', async () => {
        repositoryMocks.createBox.mockResolvedValue(makeBox({
            status: 'DRAFT',
            publishedAt: null,
            livePlatform: 'ZOOM',
            liveUrl: 'https://zoom.us/j/1234567890',
            liveStartsAt: new Date('2026-03-20T12:30:00.000Z'),
            liveStatus: 'SCHEDULED',
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
            livePlatform: 'ZOOM',
            liveUrl: 'https://zoom.us/j/1234567890',
            liveStartsAt: new Date('2026-03-20T12:30:00.000Z'),
            liveStatus: 'SCHEDULED',
        }, currentUser)).resolves.toMatchObject({
            authorEmail: 'owner@example.com',
            authorName: 'Owner',
            status: 'DRAFT',
            isOwner: true,
            hidden_content: '隐藏内容',
            livePlatform: 'ZOOM',
            liveStatus: 'SCHEDULED',
        });

        expect(repositoryMocks.createBox).toHaveBeenCalledWith(expect.objectContaining({
            authorEmail: 'owner@example.com',
            authorName: 'Owner',
            barter_demand: null,
            fulfillmentMode: 'PAID_UNLOCK',
            sourceType: 'CREATOR',
            publishedAt: null,
            livePlatform: 'ZOOM',
            liveUrl: 'https://zoom.us/j/1234567890',
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

    it('公开列表和详情隐藏提交者私密信息，管理员列表保留', async () => {
        const problem = makeBox({
            itemType: 'WISH',
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
            submitterContact: 'private@example.com',
            submitterContext: '内部项目背景',
            sourceUrl: 'https://example.com/private-context',
        });
        repositoryMocks.listBoxes.mockResolvedValue([problem]);
        repositoryMocks.findBoxById.mockResolvedValue(problem);

        const [publicSummary] = await listMarketplaceBoxes({});
        const publicDetail = await getMarketplaceBoxDetail('box-1', null);
        const [adminSummary] = await listAdminMarketplaceBoxes();

        expect(publicSummary).not.toHaveProperty('submitterContact');
        expect(publicSummary).not.toHaveProperty('submitterContext');
        expect(publicSummary).not.toHaveProperty('sourceUrl');
        expect(publicDetail).not.toHaveProperty('submitterContact');
        expect(publicDetail).not.toHaveProperty('submitterContext');
        expect(publicDetail).not.toHaveProperty('sourceUrl');
        expect(adminSummary).toMatchObject({
            submitterContact: 'private@example.com',
            submitterContext: '内部项目背景',
            sourceUrl: 'https://example.com/private-context',
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

    it('生产环境默认关闭模拟购买入口', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('PAYMENT_SIMULATION_ENABLED', '');
        repositoryMocks.findBoxById.mockResolvedValue(makeBox());

        await expect(getMarketplaceBoxDetail('box-1', {
            email: 'buyer@example.com',
            name: 'Buyer',
            role: 'USER',
        })).resolves.toMatchObject({
            canPurchase: false,
            hidden_content: undefined,
        });
    });

    it('免费问题请求详情不会开放购买', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            itemType: 'WISH',
            price: 0,
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
            authorEmail: null,
            authorName: '匿名提问者',
        }));

        await expect(getMarketplaceBoxDetail('box-1', null)).resolves.toMatchObject({
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
            canPurchase: false,
            hidden_content: undefined,
        });
    });

    it('管理员可以更新问题收集器状态', async () => {
        repositoryMocks.findBoxById.mockResolvedValue(makeBox({
            itemType: 'WISH',
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
        }));
        repositoryMocks.updateBox.mockResolvedValue(makeBox({
            itemType: 'WISH',
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'SOLVED',
        }));

        await expect(adminUpdateProblemStatus('box-1', 'SOLVED')).resolves.toMatchObject({
            problemStatus: 'SOLVED',
        });

        expect(repositoryMocks.updateBox).toHaveBeenCalledWith('box-1', expect.objectContaining({
            problemStatus: 'SOLVED',
            updatedAt: expect.any(Date),
        }));
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
