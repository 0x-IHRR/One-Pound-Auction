import { describe, expect, it } from 'vitest';

import {
    createBoxInputSchema,
    listBoxesQuerySchema,
    purchaseBoxParamsSchema,
    updateProblemStatusInputSchema,
    updateBoxInputSchema,
} from '@/features/marketplace/schemas/box.schema';

describe('createBoxInputSchema', () => {
    it('支持创建草稿并清洗文本', () => {
        expect(createBoxInputSchema.parse({
            title: '  标题  ',
            hook_description: '  描述  ',
            hidden_content: '  隐藏内容  ',
            status: 'DRAFT',
        })).toEqual({
            itemType: 'OFFER',
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            price: 1,
            accepts_barter: false,
            barter_demand: null,
            status: 'DRAFT',
            livePlatform: null,
            liveUrl: null,
            liveStartsAt: null,
            liveStatus: null,
        });
    });

    it('支持创建已发布内容', () => {
        expect(createBoxInputSchema.parse({
            itemType: 'WISH',
            title: '求产品建议',
            hook_description: '帮我看一句定位',
            hidden_content: '详细需求',
            status: 'PUBLISHED',
            accepts_barter: true,
            barter_demand: '一次产品复盘',
            price: '2.5',
            livePlatform: 'ZOOM',
            liveUrl: 'https://zoom.us/j/1234567890',
            liveStartsAt: '2026-03-20T12:30:00.000Z',
            liveStatus: 'SCHEDULED',
        })).toEqual({
            itemType: 'WISH',
            title: '求产品建议',
            hook_description: '帮我看一句定位',
            hidden_content: '详细需求',
            price: 2.5,
            accepts_barter: true,
            barter_demand: '一次产品复盘',
            status: 'PUBLISHED',
            livePlatform: 'ZOOM',
            liveUrl: 'https://zoom.us/j/1234567890',
            liveStartsAt: new Date('2026-03-20T12:30:00.000Z'),
            liveStatus: 'SCHEDULED',
        });
    });

    it('在开启交换但未提供诉求时失败', () => {
        expect(() => createBoxInputSchema.parse({
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            accepts_barter: true,
        })).toThrow('开启交换后必须填写交换诉求。');
    });

    it('直播待开场时要求提供平台、链接和开始时间', () => {
        expect(() => createBoxInputSchema.parse({
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            liveStatus: 'SCHEDULED',
        })).toThrow();
    });
});

describe('updateBoxInputSchema', () => {
    it('允许编辑单个字段', () => {
        expect(updateBoxInputSchema.parse({
            title: '新的标题',
        })).toEqual({
            title: '新的标题',
        });
    });

    it('拒绝空编辑请求', () => {
        expect(() => updateBoxInputSchema.parse({})).toThrow('至少传入一个可更新字段。');
    });
});

describe('listBoxesQuerySchema', () => {
    it('支持公共列表查询参数', () => {
        expect(listBoxesQuerySchema.parse({
            itemType: 'OFFER',
            q: '简历',
            status: 'PUBLISHED',
            authorEmail: 'owner@example.com',
        })).toEqual({
            itemType: 'OFFER',
            q: '简历',
            status: 'PUBLISHED',
            authorEmail: 'owner@example.com',
        });
    });

    it('拒绝非法邮箱格式', () => {
        expect(() => listBoxesQuerySchema.parse({
            authorEmail: 'not-an-email',
        })).toThrow('authorEmail 格式不正确。');
    });
});

describe('purchaseBoxParamsSchema', () => {
    it('要求 id 为非空字符串', () => {
        expect(() => purchaseBoxParamsSchema.parse({ id: ' ' })).toThrow();
    });
});

describe('updateProblemStatusInputSchema', () => {
    it('只允许合法的问题状态', () => {
        expect(updateProblemStatusInputSchema.parse({
            problemStatus: 'IN_PROGRESS',
        })).toEqual({
            problemStatus: 'IN_PROGRESS',
        });

        expect(() => updateProblemStatusInputSchema.parse({
            problemStatus: 'DONE',
        })).toThrow();
    });
});
