import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const authMocks = vi.hoisted(() => ({
    isAuthGuardError: vi.fn(),
    requireAdmin: vi.fn(),
}));

const redirectMock = vi.hoisted(() => vi.fn((target: string) => {
    throw new Error(`REDIRECT:${target}`);
}));

const marketplaceServiceMocks = vi.hoisted(() => ({
    listAdminMarketplaceBoxes: vi.fn(),
}));

const orderServiceMocks = vi.hoisted(() => ({
    listAdminAbnormalOrders: vi.fn(),
    listAdminOrders: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: redirectMock,
}));

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: { href: string; children: unknown }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('lucide-react', () => ({
    ShieldCheck: () => <svg data-testid="shield-check" />,
}));

vi.mock('@/app/components/AdminUnlistButton', () => ({
    default: ({ boxId, disabled }: { boxId: string; disabled: boolean }) => (
        <button data-box-id={boxId} data-disabled={disabled ? 'true' : 'false'} type="button">
            下架
        </button>
    ),
}));

vi.mock('@/app/components/AdminProblemStatusControl', () => ({
    default: ({ boxId, value }: { boxId: string; value: string }) => (
        <select data-box-id={boxId} defaultValue={value}>
            <option value={value}>{value}</option>
        </select>
    ),
}));

vi.mock('@/app/components/StatusBadge', () => ({
    default: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock('@/app/lib/auth/guards', () => ({
    isAuthGuardError: authMocks.isAuthGuardError,
    requireAdmin: authMocks.requireAdmin,
}));

vi.mock('@/app/lib/auth/redirects', () => ({
    buildSignInPath: (callbackPath: string) => `/sign-in?callback=${encodeURIComponent(callbackPath)}`,
}));

vi.mock('@/features/marketplace/server/services/box.service', () => ({
    listAdminMarketplaceBoxes: marketplaceServiceMocks.listAdminMarketplaceBoxes,
}));

vi.mock('@/features/order-payment/server/services/order.service', () => ({
    listAdminAbnormalOrders: orderServiceMocks.listAdminAbnormalOrders,
    listAdminOrders: orderServiceMocks.listAdminOrders,
}));

import AdminPage from '@/app/admin/page';

describe('admin page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('未登录管理员会跳转到登录页', async () => {
        authMocks.requireAdmin.mockRejectedValue({
            code: 'UNAUTHENTICATED',
        });
        authMocks.isAuthGuardError.mockReturnValue(true);

        await expect(AdminPage()).rejects.toThrow('REDIRECT:/sign-in?callback=%2Fadmin');
        expect(redirectMock).toHaveBeenCalledWith('/sign-in?callback=%2Fadmin');
    });

    it('非管理员会跳转到个人中心拒绝提示', async () => {
        authMocks.requireAdmin.mockRejectedValue({
            code: 'FORBIDDEN',
        });
        authMocks.isAuthGuardError.mockReturnValue(true);

        await expect(AdminPage()).rejects.toThrow('REDIRECT:/me?denied=admin');
        expect(redirectMock).toHaveBeenCalledWith('/me?denied=admin');
    });

    it('管理员访问时渲染内容列表、订单列表和异常订单', async () => {
        authMocks.requireAdmin.mockResolvedValue({
            email: 'admin@example.com',
            role: 'ADMIN',
        });
        authMocks.isAuthGuardError.mockReturnValue(false);
        marketplaceServiceMocks.listAdminMarketplaceBoxes.mockResolvedValue([
            {
                id: 'box-1',
                itemType: 'OFFER',
                title: '前端模板',
                hook_description: '描述',
                price: 9.9,
                accepts_barter: false,
                barter_demand: null,
                sales_count: 3,
                authorEmail: 'seller@example.com',
                authorName: 'Seller',
                status: 'PUBLISHED',
                livePlatform: null,
                liveUrl: null,
                liveStartsAt: null,
                liveStatus: null,
                fulfillmentMode: 'PAID_UNLOCK',
                problemStatus: null,
                sourceType: 'CREATOR',
                sourceUrl: null,
                createdAt: new Date('2026-03-10T08:00:00.000Z'),
                updatedAt: new Date('2026-03-10T08:00:00.000Z'),
                publishedAt: new Date('2026-03-10T08:00:00.000Z'),
                deletedAt: null,
            },
            {
                id: 'box-collector-1',
                itemType: 'WISH',
                title: '作品集没人看',
                hook_description: '用户打开第一页就关闭',
                price: 0,
                accepts_barter: false,
                barter_demand: null,
                sales_count: 0,
                authorEmail: null,
                authorName: '匿名提问者',
                status: 'PUBLISHED',
                livePlatform: null,
                liveUrl: null,
                liveStartsAt: null,
                liveStatus: null,
                fulfillmentMode: 'FREE_HELP_REQUEST',
                problemStatus: 'OPEN',
                sourceType: 'SOCIAL_COLLECTOR',
                sourceUrl: 'https://example.com/work',
                submitterContact: 'me@example.com',
                submitterContext: '这是私密补充',
                createdAt: new Date('2026-03-10T08:00:00.000Z'),
                updatedAt: new Date('2026-03-10T08:00:00.000Z'),
                publishedAt: new Date('2026-03-10T08:00:00.000Z'),
                deletedAt: null,
            },
        ]);
        orderServiceMocks.listAdminOrders.mockResolvedValue([
            {
                orderId: 'order-1',
                buyerEmail: 'buyer@example.com',
                buyerName: 'Buyer',
                amount: 9.9,
                orderStatus: 'PAID',
                paidAt: new Date('2026-03-10T09:00:00.000Z'),
                unlockedAt: new Date('2026-03-10T09:01:00.000Z'),
                paymentStatus: 'SUCCEEDED',
                item: {
                    id: 'box-1',
                    title: '前端模板',
                    hook_description: '描述',
                    price: 9.9,
                    authorName: 'Seller',
                    publishedAt: new Date('2026-03-10T08:00:00.000Z'),
                },
            },
        ]);
        orderServiceMocks.listAdminAbnormalOrders.mockResolvedValue([
            {
                orderId: 'order-2',
                buyerEmail: 'stuck@example.com',
                buyerName: 'Stuck Buyer',
                amount: 9.9,
                orderStatus: 'PENDING',
                paidAt: null,
                unlockedAt: null,
                paymentStatus: 'INITIATED',
                item: {
                    id: 'box-2',
                    title: '异常内容',
                    hook_description: '异常描述',
                    price: 9.9,
                    authorName: 'Seller',
                    publishedAt: new Date('2026-03-10T08:00:00.000Z'),
                },
            },
        ]);

        const page = await AdminPage();
        const html = renderToStaticMarkup(page);

        expect(html).toContain('最小后台');
        expect(html).toContain('前端模板');
        expect(html).toContain('作品集没人看');
        expect(html).toContain('me@example.com');
        expect(html).toContain('这是私密补充');
        expect(html).toContain('Buyer');
        expect(html).toContain('异常订单');
        expect(html).toContain('Stuck Buyer');
    });
});
