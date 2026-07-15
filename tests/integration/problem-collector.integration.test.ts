import { afterAll, describe, expect, it } from 'vitest';

import {
    adminUpdateProblemStatus,
    getMarketplaceBoxDetail,
    listAdminMarketplaceBoxes,
    listMarketplaceBoxes,
    purchaseMarketplaceBox,
} from '@/features/marketplace/server/services/box.service';
import { createProblemSubmission } from '@/features/problem-collector/server/services/problem-submission.service';
import prisma from '@/server/db/prisma';

describe('problem collector integration', () => {
    const marker = `integration-${Date.now()}`;
    let createdId: string | null = null;

    afterAll(async () => {
        if (createdId) {
            await prisma.auctionItem.deleteMany({
                where: { id: createdId },
            });
        }

        await prisma.$disconnect();
    });

    it('提交后公开视图脱敏、管理员可处理且免费请求不可购买', async () => {
        const created = await createProblemSubmission({
            title: `${marker} 作品集没人看`,
            problem: '访客打开第一页就离开。',
            context: '这是尚未公开的内部项目背景。',
            displayName: 'Integration User',
            contact: 'private-integration@example.com',
            sourceUrl: 'https://example.com/private-integration-context',
            publicConsent: true,
            website: '',
        });
        createdId = created.id;

        const [publicSummary] = await listMarketplaceBoxes({ q: marker });
        const publicDetail = await getMarketplaceBoxDetail(created.id, null);
        const adminSummary = (await listAdminMarketplaceBoxes())
            .find((box) => box.id === created.id);

        expect(publicSummary).toMatchObject({
            id: created.id,
            fulfillmentMode: 'FREE_HELP_REQUEST',
            problemStatus: 'OPEN',
        });
        expect(publicSummary).not.toHaveProperty('submitterContact');
        expect(publicSummary).not.toHaveProperty('submitterContext');
        expect(publicSummary).not.toHaveProperty('sourceUrl');
        expect(publicDetail).not.toHaveProperty('submitterContact');
        expect(publicDetail).not.toHaveProperty('submitterContext');
        expect(publicDetail).not.toHaveProperty('sourceUrl');
        expect(adminSummary).toMatchObject({
            submitterContact: 'private-integration@example.com',
            submitterContext: '这是尚未公开的内部项目背景。',
            sourceUrl: 'https://example.com/private-integration-context',
        });

        await expect(adminUpdateProblemStatus(created.id, 'SOLVED')).resolves.toMatchObject({
            problemStatus: 'SOLVED',
        });
        await expect(purchaseMarketplaceBox({ id: created.id }, {
            email: 'integration-buyer@example.com',
            name: 'Integration Buyer',
            role: 'USER',
        })).rejects.toMatchObject({
            code: 'CONFLICT',
            status: 409,
        });
    });
});
