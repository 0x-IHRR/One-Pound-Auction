import { purchaseBoxParamsSchema } from '@/features/marketplace/schemas/box.schema';
import { purchaseMarketplaceBox } from '@/features/marketplace/server/services/box.service';
import { fail, ok } from '@/shared/http';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const input = purchaseBoxParamsSchema.parse(await params);
        const result = await purchaseMarketplaceBox(input);
        return ok(result);
    } catch (error) {
        return fail(error);
    }
}
