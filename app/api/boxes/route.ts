import { requireUser, isAuthGuardError } from '@/app/lib/auth/guards';
import { getCurrentUser } from '@/app/lib/auth/session';
import {
    createBoxInputSchema,
    listBoxesQuerySchema,
} from '@/features/marketplace/schemas/box.schema';
import {
    createMarketplaceBox,
    listMarketplaceBoxes,
    listMyMarketplaceBoxes,
} from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';
import { fail, ok } from '@/shared/http';
import { readJsonBody } from '@/server/lib/read-json-body';

export async function GET(request: Request) {
    try {
        const query = listBoxesQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
        const currentUser = await getCurrentUser();
        const isMineQuery = Boolean(currentUser && query.authorEmail && query.authorEmail === currentUser.email);
        const boxes = isMineQuery
            ? await listMyMarketplaceBoxes(currentUser as NonNullable<typeof currentUser>, query)
            : await listMarketplaceBoxes(query);

        return ok(boxes);
    } catch (error) {
        return fail(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireUser();
        const json = await readJsonBody(request);
        const input = createBoxInputSchema.parse(json);
        const newBox = await createMarketplaceBox(input, user);
        return ok(newBox, 201);
    } catch (error) {
        if (isAuthGuardError(error)) {
            return fail(new AppError('UNAUTHENTICATED', '请先登录后再创建内容。', 401));
        }

        return fail(error);
    }
}
