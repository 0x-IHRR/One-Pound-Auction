import assert from 'node:assert/strict';
import test from 'node:test';
import { createBoxDetailRouteHandlers, createBoxesRouteHandlers } from '../../features/marketplace/handlers.ts';
import { createInMemoryMarketplaceRepository } from '../../features/marketplace/repository.ts';
import { createMarketplaceService } from '../../features/marketplace/service.ts';
import { anotherUser, createRecord, ownerUser } from './test-helpers.ts';

function createNoopRevalidate() {
    return () => undefined;
}

test('未登录创建内容返回 401', async () => {
    const handlers = createBoxesRouteHandlers({
        service: createMarketplaceService(createInMemoryMarketplaceRepository()),
        resolveUser: async () => null,
        revalidate: createNoopRevalidate(),
    });

    const response = await handlers.POST(
        new Request('http://localhost/api/boxes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemType: 'OFFER',
                title: '未登录创建',
                hook_description: '应该被拒绝',
                hidden_content: 'hidden',
                price: 1,
                status: 'DRAFT',
            }),
        }),
    );

    assert.equal(response.status, 401);
});

test('非作者编辑内容返回 403', async () => {
    const handlers = createBoxDetailRouteHandlers({
        service: createMarketplaceService(
            createInMemoryMarketplaceRepository([
                createRecord({ id: 'route_edit_content', authorEmail: ownerUser.email }),
            ]),
        ),
        resolveUser: async () => anotherUser,
        revalidate: createNoopRevalidate(),
    });

    const response = await handlers.PATCH(
        new Request('http://localhost/api/boxes/route_edit_content', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: '非法编辑' }),
        }),
        { params: Promise.resolve({ id: 'route_edit_content' }) },
    );

    assert.equal(response.status, 403);
});

test('公共列表按 itemType 和 q 过滤正确', async () => {
    const handlers = createBoxesRouteHandlers({
        service: createMarketplaceService(
            createInMemoryMarketplaceRepository([
                createRecord({
                    id: 'offer_match',
                    itemType: 'OFFER',
                    title: '简历模板',
                    hook_description: '校招模板',
                }),
                createRecord({
                    id: 'offer_other',
                    itemType: 'OFFER',
                    title: 'Figma 模板',
                    hook_description: '落地页资源',
                }),
                createRecord({
                    id: 'wish_match',
                    itemType: 'WISH',
                    title: '求简历诊断',
                    hook_description: '帮我看看结构',
                }),
            ]),
        ),
        resolveUser: async () => null,
        revalidate: createNoopRevalidate(),
    });

    const response = await handlers.GET(
        new Request('http://localhost/api/boxes?itemType=OFFER&q=%E7%AE%80%E5%8E%86'),
    );
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.length, 1);
    assert.equal(data[0].id, 'offer_match');
});
