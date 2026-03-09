import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/shared/errors';

const authMocks = vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    isAuthGuardError: vi.fn(),
    requireUser: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
    createMarketplaceBox: vi.fn(),
    listMarketplaceBoxes: vi.fn(),
    listMyMarketplaceBoxes: vi.fn(),
    updateMarketplaceBox: vi.fn(),
}));

const readJsonBodyMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/auth/guards', () => ({
    isAuthGuardError: authMocks.isAuthGuardError,
    requireUser: authMocks.requireUser,
}));

vi.mock('@/app/lib/auth/session', () => ({
    getCurrentUser: authMocks.getCurrentUser,
}));

vi.mock('@/features/marketplace/server/services/box.service', () => ({
    createMarketplaceBox: serviceMocks.createMarketplaceBox,
    listMarketplaceBoxes: serviceMocks.listMarketplaceBoxes,
    listMyMarketplaceBoxes: serviceMocks.listMyMarketplaceBoxes,
    updateMarketplaceBox: serviceMocks.updateMarketplaceBox,
}));

vi.mock('@/server/lib/read-json-body', () => ({
    readJsonBody: readJsonBodyMock,
}));

import { GET as getBoxes, POST as postBoxes } from '@/app/api/boxes/route';
import { PATCH as patchBox } from '@/app/api/boxes/[id]/route';

describe('marketplace box routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('未登录创建内容返回 401', async () => {
        authMocks.requireUser.mockRejectedValue(new Error('auth-required'));
        authMocks.isAuthGuardError.mockReturnValue(true);

        const response = await postBoxes(new Request('http://localhost/api/boxes', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(401);
        expect(payload).toMatchObject({
            success: false,
            error: {
                code: 'UNAUTHENTICATED',
            },
        });
    });

    it('非作者编辑内容返回 403', async () => {
        authMocks.requireUser.mockResolvedValue({
            email: 'member@example.com',
            name: 'Member',
            role: 'USER',
        });
        authMocks.isAuthGuardError.mockReturnValue(false);
        readJsonBodyMock.mockResolvedValue({
            title: '更新后的标题',
        });
        serviceMocks.updateMarketplaceBox.mockRejectedValue(
            new AppError('FORBIDDEN', '你无权操作这条内容。', 403),
        );

        const response = await patchBox(
            new Request('http://localhost/api/boxes/box-1', { method: 'PATCH' }),
            { params: Promise.resolve({ id: 'box-1' }) },
        );
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(403);
        expect(payload).toMatchObject({
            success: false,
            error: {
                code: 'FORBIDDEN',
            },
        });
    });

    it('公共列表按 itemType 和 q 过滤', async () => {
        authMocks.getCurrentUser.mockResolvedValue(null);
        serviceMocks.listMarketplaceBoxes.mockResolvedValue([]);

        const response = await getBoxes(
            new Request('http://localhost/api/boxes?itemType=OFFER&q=%E7%AE%80%E5%8E%86'),
        );
        const payload = (await response.json()) as { success: true; data: unknown[] };

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            success: true,
            data: [],
        });
        expect(serviceMocks.listMarketplaceBoxes).toHaveBeenCalledWith({
            itemType: 'OFFER',
            q: '简历',
        });
    });
});
