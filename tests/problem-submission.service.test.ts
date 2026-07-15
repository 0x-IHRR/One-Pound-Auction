import { beforeEach, describe, expect, it, vi } from 'vitest';

const repositoryMocks = vi.hoisted(() => ({
    createBox: vi.fn(),
}));

vi.mock('@/features/marketplace/server/repositories/box.repository', () => repositoryMocks);

import { createProblemSubmission } from '@/features/problem-collector/server/services/problem-submission.service';

describe('problem submission service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('把免登录问题创建为公开许愿池免费请求', async () => {
        repositoryMocks.createBox.mockResolvedValue({
            id: 'box-1',
            title: '作品集没人看',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
        });

        await expect(createProblemSubmission({
            title: '作品集没人看',
            problem: '用户打开第一页就关掉',
            context: '目标用户是海外客户',
            displayName: 'IHRR',
            contact: 'me@example.com',
            sourceUrl: null,
            publicConsent: true,
            website: '',
        })).resolves.toEqual({
            id: 'box-1',
            title: '作品集没人看',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
        });

        expect(repositoryMocks.createBox).toHaveBeenCalledWith(expect.objectContaining({
            itemType: 'WISH',
            hidden_content: '用户打开第一页就关掉',
            price: 0,
            status: 'PUBLISHED',
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
            sourceType: 'SOCIAL_COLLECTOR',
            submitterContact: 'me@example.com',
            submitterContext: '目标用户是海外客户',
            authorEmail: null,
            authorName: 'IHRR',
        }));
        const createPayload = repositoryMocks.createBox.mock.calls[0][0] as { hidden_content: string };
        expect(createPayload.hidden_content).not.toContain('me@example.com');
        expect(createPayload.hidden_content).not.toContain('目标用户是海外客户');
    });
});
