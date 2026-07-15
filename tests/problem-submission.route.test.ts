import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
    createProblemSubmission: vi.fn(),
}));

const readJsonBodyMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/problem-collector/server/services/problem-submission.service', () => serviceMocks);
vi.mock('@/server/lib/read-json-body', () => ({
    readJsonBody: readJsonBodyMock,
}));

import { POST } from '@/app/api/problem-submissions/route';

describe('problem submission route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('免登录提交问题并返回公开结果', async () => {
        readJsonBodyMock.mockResolvedValue({
            title: '作品集没人看',
            problem: '打开率很低',
            context: '这是私密补充',
            contact: 'me@example.com',
            publicConsent: true,
            website: '',
        });
        serviceMocks.createProblemSubmission.mockResolvedValue({
            id: 'box-1',
            title: '作品集没人看',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
        });

        const response = await POST(new Request('http://localhost/api/problem-submissions', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: true; data: Record<string, unknown> };

        expect(response.status).toBe(201);
        expect(payload).toEqual({
            success: true,
            data: {
                id: 'box-1',
                title: '作品集没人看',
                problemStatus: 'OPEN',
                sourceType: 'SOCIAL_COLLECTOR',
            },
        });
        expect(JSON.stringify(payload)).not.toContain('me@example.com');
        expect(JSON.stringify(payload)).not.toContain('这是私密补充');
    });

    it('校验失败时返回统一错误 envelope', async () => {
        readJsonBodyMock.mockResolvedValue({
            title: '',
            problem: '',
            publicConsent: false,
        });

        const response = await POST(new Request('http://localhost/api/problem-submissions', {
            method: 'POST',
        }));
        const payload = (await response.json()) as { success: false; error: { code: string } };

        expect(response.status).toBe(400);
        expect(payload.error.code).toBe('VALIDATION_ERROR');
        expect(serviceMocks.createProblemSubmission).not.toHaveBeenCalled();
    });
});
