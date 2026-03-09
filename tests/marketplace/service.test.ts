import assert from 'node:assert/strict';
import test from 'node:test';
import { MarketplaceError } from '../../features/marketplace/errors.ts';
import { createInMemoryMarketplaceRepository } from '../../features/marketplace/repository.ts';
import { createMarketplaceService } from '../../features/marketplace/service.ts';
import { anotherUser, createRecord, ownerUser } from './test-helpers.ts';

test('作者创建内容时会写入轻量归属信息', async () => {
    const service = createMarketplaceService(createInMemoryMarketplaceRepository());

    const created = await service.createContent(
        {
            itemType: 'OFFER',
            title: '内容归属测试',
            hook_description: '验证 author 字段',
            hidden_content: 'hidden',
            price: 1,
            accepts_barter: false,
            barter_demand: null,
            status: 'DRAFT',
        },
        ownerUser,
    );

    assert.equal(created.authorEmail, ownerUser.email);
    assert.equal(created.authorName, ownerUser.name);
    assert.equal(created.status, 'DRAFT');
});

test('只能编辑自己的内容', async () => {
    const service = createMarketplaceService(
        createInMemoryMarketplaceRepository([
            createRecord({ id: 'editable_content', authorEmail: ownerUser.email }),
        ]),
    );

    await assert.rejects(
        () =>
            service.updateContent(
                'editable_content',
                { title: '被拒绝的更新' },
                anotherUser,
            ),
        (error: unknown) =>
            error instanceof MarketplaceError &&
            error.statusCode === 403 &&
            error.code === 'CONTENT_FORBIDDEN',
    );
});

test('只能发布或下架自己的内容', async () => {
    const service = createMarketplaceService(
        createInMemoryMarketplaceRepository([
            createRecord({ id: 'draft_content', status: 'DRAFT', publishedAt: null }),
            createRecord({ id: 'published_content', status: 'PUBLISHED' }),
        ]),
    );

    await assert.rejects(
        () => service.publishContent('draft_content', anotherUser),
        (error: unknown) => error instanceof MarketplaceError && error.statusCode === 403,
    );

    await assert.rejects(
        () => service.unlistContent('published_content', anotherUser),
        (error: unknown) => error instanceof MarketplaceError && error.statusCode === 403,
    );
});

test('软删除后不再出现在公共列表', async () => {
    const repository = createInMemoryMarketplaceRepository([
        createRecord({ id: 'visible_content', status: 'PUBLISHED' }),
    ]);
    const service = createMarketplaceService(repository);

    await service.softDeleteContent('visible_content', ownerUser);

    const publicList = await service.listPublicContents({});
    assert.equal(publicList.length, 0);
});

test('公共详情不能读取草稿、下架或删除内容', async () => {
    const service = createMarketplaceService(
        createInMemoryMarketplaceRepository([
            createRecord({ id: 'draft_content', status: 'DRAFT', publishedAt: null }),
            createRecord({ id: 'unlisted_content', status: 'UNLISTED' }),
            createRecord({ id: 'deleted_content', status: 'DELETED', deletedAt: new Date('2026-03-05T00:00:00.000Z') }),
        ]),
    );

    await assert.rejects(
        () => service.getContentDetail('draft_content', null),
        (error: unknown) => error instanceof MarketplaceError && error.statusCode === 404,
    );
    await assert.rejects(
        () => service.getContentDetail('unlisted_content', null),
        (error: unknown) => error instanceof MarketplaceError && error.statusCode === 404,
    );
    await assert.rejects(
        () => service.getContentDetail('deleted_content', null),
        (error: unknown) => error instanceof MarketplaceError && error.statusCode === 404,
    );
});

test('purchase 对非 PUBLISHED 内容返回业务错误', async () => {
    const service = createMarketplaceService(
        createInMemoryMarketplaceRepository([
            createRecord({ id: 'draft_purchase', status: 'DRAFT', publishedAt: null }),
        ]),
    );

    await assert.rejects(
        () => service.purchaseContent('draft_purchase'),
        (error: unknown) =>
            error instanceof MarketplaceError &&
            error.statusCode === 409 &&
            error.code === 'CONTENT_NOT_PURCHASABLE',
    );
});
