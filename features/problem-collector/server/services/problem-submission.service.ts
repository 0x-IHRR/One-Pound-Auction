import { createBox } from '@/features/marketplace/server/repositories/box.repository';
import type { MarketplaceProblemStatus, MarketplaceSourceType } from '@/features/marketplace/types/box';
import type { ProblemSubmissionInput } from '@/features/problem-collector/schemas/problem-submission.schema';

export type ProblemSubmissionResult = {
    id: string;
    title: string;
    problemStatus: MarketplaceProblemStatus;
    sourceType: MarketplaceSourceType;
};

export async function createProblemSubmission(input: ProblemSubmissionInput): Promise<ProblemSubmissionResult> {
    const now = new Date();
    const created = await createBox({
        itemType: 'WISH',
        title: input.title,
        hook_description: input.problem,
        hidden_content: input.problem,
        price: 0,
        accepts_barter: false,
        barter_demand: null,
        status: 'PUBLISHED',
        livePlatform: null,
        liveUrl: null,
        liveStartsAt: null,
        liveStatus: null,
        fulfillmentMode: 'FREE_HELP_REQUEST',
        problemStatus: 'OPEN',
        sourceType: 'SOCIAL_COLLECTOR',
        submitterContact: input.contact,
        submitterContext: input.context,
        sourceUrl: input.sourceUrl,
        authorEmail: null,
        authorName: input.displayName ?? '匿名提问者',
        sales_count: 0,
        publishedAt: now,
        deletedAt: null,
    });

    return {
        id: created.id,
        title: created.title,
        problemStatus: created.problemStatus ?? 'OPEN',
        sourceType: created.sourceType ?? 'SOCIAL_COLLECTOR',
    };
}
