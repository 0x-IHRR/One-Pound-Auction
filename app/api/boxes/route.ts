import { createBoxInputSchema } from '@/features/marketplace/schemas/box.schema';
import { createMarketplaceBox, listMarketplaceBoxes } from '@/features/marketplace/server/services/box.service';
import { readJsonBody } from '@/server/lib/read-json-body';
import { fail, ok } from '@/shared/http';

export async function GET() {
    try {
        const boxes = await listMarketplaceBoxes();
        return ok(boxes);
    } catch (error) {
        return fail(error);
    }
}

export async function POST(request: Request) {
    try {
        const json = await readJsonBody(request);
        const input = createBoxInputSchema.parse(json);
        const newBox = await createMarketplaceBox(input);
        return ok(newBox, 201);
    } catch (error) {
        return fail(error);
    }
}
