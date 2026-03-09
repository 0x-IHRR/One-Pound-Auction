import type { CurrentUser } from '../../app/lib/current-user.ts';
import { isMarketplaceError } from './errors.ts';
import { marketplaceService, type MarketplaceService } from './service.ts';
import {
    parseCreateMarketplaceContentInput,
    parseListMarketplaceContentQuery,
    parseUpdateMarketplaceContentInput,
} from './validation.ts';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface MarketplaceHandlerDependencies {
    service?: MarketplaceService;
    resolveUser?: (request: Request) => Promise<CurrentUser | null>;
    revalidate?: (path: string) => void | Promise<void>;
}

async function defaultResolveUser(request: Request) {
    const currentUserModule = await import('../../app/lib/current-user.ts');
    return currentUserModule.getCurrentUserFromRequest(request);
}

async function defaultRevalidate(path: string) {
    const nextCacheModule = await import('next/cache');
    nextCacheModule.revalidatePath(path);
}

function getDependencies(deps: MarketplaceHandlerDependencies = {}) {
    return {
        service: deps.service ?? marketplaceService,
        resolveUser: deps.resolveUser ?? defaultResolveUser,
        revalidate: deps.revalidate ?? defaultRevalidate,
    };
}

function handleError(error: unknown) {
    if (isMarketplaceError(error)) {
        return Response.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error(error);
    return Response.json({ error: '服务器内部错误。' }, { status: 500 });
}

async function revalidateContentPaths(id: string, revalidate: (path: string) => void | Promise<void>) {
    await revalidate('/');
    await revalidate('/creator');
    await revalidate('/me');
    await revalidate(`/boxes/${id}`);
    await revalidate(`/boxes/${id}/edit`);
}

export function createBoxesRouteHandlers(deps: MarketplaceHandlerDependencies = {}) {
    const { service, resolveUser, revalidate } = getDependencies(deps);

    return {
        GET: async function GET(request: Request) {
            try {
                const parsed = parseListMarketplaceContentQuery(new URL(request.url).searchParams);

                if (!parsed.success) {
                    return Response.json({ error: parsed.error }, { status: parsed.statusCode });
                }

                const user = await resolveUser(request);
                const shouldReadMine = Boolean(
                    user && parsed.data.authorEmail && parsed.data.authorEmail === user.email,
                );

                const boxes = shouldReadMine
                    ? await service.listMyContents(parsed.data, user as CurrentUser)
                    : await service.listPublicContents(parsed.data);

                return Response.json(boxes);
            } catch (error) {
                return handleError(error);
            }
        },
        POST: async function POST(request: Request) {
            try {
                const user = await resolveUser(request);

                if (!user) {
                    return Response.json({ error: '请先登录后再创建内容。' }, { status: 401 });
                }

                const parsed = parseCreateMarketplaceContentInput(await request.json());

                if (!parsed.success) {
                    return Response.json({ error: parsed.error }, { status: parsed.statusCode });
                }

                const created = await service.createContent(parsed.data, user);
                await revalidate('/');
                await revalidate('/me');

                return Response.json(created, { status: 201 });
            } catch (error) {
                return handleError(error);
            }
        },
    };
}

export function createBoxDetailRouteHandlers(deps: MarketplaceHandlerDependencies = {}) {
    const { service, resolveUser, revalidate } = getDependencies(deps);

    return {
        GET: async function GET(request: Request, context: RouteContext) {
            try {
                const user = await resolveUser(request);
                const { id } = await context.params;
                const detail = await service.getContentDetail(id, user);

                return Response.json(detail);
            } catch (error) {
                return handleError(error);
            }
        },
        PATCH: async function PATCH(request: Request, context: RouteContext) {
            try {
                const user = await resolveUser(request);

                if (!user) {
                    return Response.json({ error: '请先登录后再编辑内容。' }, { status: 401 });
                }

                const parsed = parseUpdateMarketplaceContentInput(await request.json());

                if (!parsed.success) {
                    return Response.json({ error: parsed.error }, { status: parsed.statusCode });
                }

                const { id } = await context.params;
                const updated = await service.updateContent(id, parsed.data, user);
                await revalidateContentPaths(id, revalidate);

                return Response.json(updated);
            } catch (error) {
                return handleError(error);
            }
        },
        DELETE: async function DELETE(request: Request, context: RouteContext) {
            try {
                const user = await resolveUser(request);

                if (!user) {
                    return Response.json({ error: '请先登录后再删除内容。' }, { status: 401 });
                }

                const { id } = await context.params;
                await service.softDeleteContent(id, user);
                await revalidateContentPaths(id, revalidate);

                return Response.json({ success: true });
            } catch (error) {
                return handleError(error);
            }
        },
    };
}

export function createBoxPublishRouteHandlers(deps: MarketplaceHandlerDependencies = {}) {
    const { service, resolveUser, revalidate } = getDependencies(deps);

    return {
        POST: async function POST(request: Request, context: RouteContext) {
            try {
                const user = await resolveUser(request);

                if (!user) {
                    return Response.json({ error: '请先登录后再发布内容。' }, { status: 401 });
                }

                const { id } = await context.params;
                const detail = await service.publishContent(id, user);
                await revalidateContentPaths(id, revalidate);

                return Response.json(detail);
            } catch (error) {
                return handleError(error);
            }
        },
    };
}

export function createBoxUnlistRouteHandlers(deps: MarketplaceHandlerDependencies = {}) {
    const { service, resolveUser, revalidate } = getDependencies(deps);

    return {
        POST: async function POST(request: Request, context: RouteContext) {
            try {
                const user = await resolveUser(request);

                if (!user) {
                    return Response.json({ error: '请先登录后再下架内容。' }, { status: 401 });
                }

                const { id } = await context.params;
                const detail = await service.unlistContent(id, user);
                await revalidateContentPaths(id, revalidate);

                return Response.json(detail);
            } catch (error) {
                return handleError(error);
            }
        },
    };
}

export function createPurchaseRouteHandlers(deps: MarketplaceHandlerDependencies = {}) {
    const { service, revalidate } = getDependencies(deps);

    return {
        POST: async function POST(_request: Request, context: RouteContext) {
            try {
                const { id } = await context.params;
                const result = await service.purchaseContent(id);
                await revalidate('/');
                await revalidate(`/boxes/${id}`);

                return Response.json({
                    success: true,
                    hidden_content: result.hidden_content,
                });
            } catch (error) {
                return handleError(error);
            }
        },
    };
}
