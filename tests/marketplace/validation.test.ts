import assert from 'node:assert/strict';
import test from 'node:test';
import {
    parseCreateMarketplaceContentInput,
    parseListMarketplaceContentQuery,
    parseUpdateMarketplaceContentInput,
} from '../../features/marketplace/validation.ts';

test('创建草稿输入校验通过', () => {
    const result = parseCreateMarketplaceContentInput({
        itemType: 'OFFER',
        title: '一份简历模板',
        hook_description: '适合校招的单页模板',
        hidden_content: 'https://example.com/resume',
        price: 1,
        status: 'DRAFT',
    });

    assert.equal(result.success, true);
    if (result.success) {
        assert.equal(result.data.status, 'DRAFT');
        assert.equal(result.data.price, 1);
    }
});

test('创建发布内容输入校验通过', () => {
    const result = parseCreateMarketplaceContentInput({
        itemType: 'WISH',
        title: '求一位前端同学帮忙 review',
        hook_description: '帮我看看 React 组件有没有反模式',
        hidden_content: '请通过邮箱联系我',
        price: 3.2,
        status: 'PUBLISHED',
        accepts_barter: true,
        barter_demand: '我可以回赠一次后端接口评审',
    });

    assert.equal(result.success, true);
    if (result.success) {
        assert.equal(result.data.status, 'PUBLISHED');
        assert.equal(result.data.accepts_barter, true);
    }
});

test('编辑输入校验会拦截空更新', () => {
    const result = parseUpdateMarketplaceContentInput({});

    assert.equal(result.success, false);
    if (!result.success) {
        assert.match(result.error, /至少传入一个可更新字段/);
    }
});

test('查询参数校验支持 itemType、q、status、authorEmail', () => {
    const params = new URLSearchParams({
        itemType: 'OFFER',
        q: '简历',
        status: 'PUBLISHED',
        authorEmail: 'owner@example.com',
    });
    const result = parseListMarketplaceContentQuery(params);

    assert.equal(result.success, true);
    if (result.success) {
        assert.deepEqual(result.data, {
            itemType: 'OFFER',
            q: '简历',
            status: 'PUBLISHED',
            authorEmail: 'owner@example.com',
        });
    }
});
