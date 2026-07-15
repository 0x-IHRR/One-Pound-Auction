import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
    isAuthGuardError: vi.fn(),
    requireAdmin: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
    adminUpdateProblemStatus: vi.fn(),
}));

const readJsonBodyMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/lib/auth/guards', () => ({
    isAuthGuardError: authMocks.isAuthGuardError,
    requireAdmin: authMocks.requireAdmin,
}));

vi.mock('@/features/marketplace/server/services/box.service', () => ({
    adminUpdateProblemStatus: serviceMocks.adminUpdateProblemStatus,
}));

vi.mock('@/server/lib/read-json-body', () => ({
    readJsonBody: readJsonBodyMock,
}));

import { PATCH } from '@/app/api/admin/boxes/[id]/problem-status/route';

describe('admin problem status route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('管理员可以更新问题状态', async () => {
        authMocks.requireAdmin.mockResolvedValue({
            email: 'admin@example.com',
            role: 'ADMIN',
        });
        authMocks.isAuthGuardError.mockReturnValue(false);
        readJsonBodyMock.mockResolvedValue({
            problemStatus: 'SOLVED',
        });
        serviceMocks.adminUpdateProblemStatus.mockResolvedValue({
            id: 'box-1',
            problemStatus: 'SOLVED',
        });

        const response = await PATCH(
            new Request('http://localhost/api/admin/boxes/box-1/problem-status', { method: 'PATCH' }),
            { params: Promise.resolve({ id: 'box-1' }) },
        );
        const payload = (await response.json()) as { success: true; data: { problemStatus: string } };

        expect(response.status).toBe(200);
        expect(payload.data.problemStatus).toBe('SOLVED');
        expect(serviceMocks.adminUpdateProblemStatus).toHaveBeenCalledWith('box-1', 'SOLVED');
    });

    it('非管理员更新问题状态返回 403', async () => {
        authMocks.requireAdmin.mockRejectedValue({
            code: 'FORBIDDEN',
        });
        authMocks.isAuthGuardError.mockReturnValue(true);

        const response = await PATCH(
            new Request('http://localhost/api/admin/boxes/box-1/problem-status', { method: 'PATCH' }),
            { params: Promise.resolve({ id: 'box-1' }) },
        );
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(403);
        expect(payload.error.code).toBe('FORBIDDEN');
        expect(serviceMocks.adminUpdateProblemStatus).not.toHaveBeenCalled();
    });
});
