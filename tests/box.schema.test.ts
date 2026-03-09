import { describe, expect, it } from 'vitest';

import { createBoxInputSchema, purchaseBoxParamsSchema } from '@/features/marketplace/schemas/box.schema';

describe('createBoxInputSchema', () => {
    it('会清洗文本并补齐默认值', () => {
        expect(createBoxInputSchema.parse({
            title: '  标题  ',
            hook_description: '  描述  ',
            hidden_content: '  隐藏内容  ',
        })).toEqual({
            itemType: 'OFFER',
            title: '标题',
            hook_description: '描述',
            hidden_content: '隐藏内容',
            price: 1,
            accepts_barter: false,
            barter_demand: null,
        });
    });

    it('在必填字段为空时失败', () => {
        expect(() => createBoxInputSchema.parse({
            title: ' ',
            hook_description: '描述',
            hidden_content: '隐藏内容',
        })).toThrow();
    });
});

describe('purchaseBoxParamsSchema', () => {
    it('要求 id 为非空字符串', () => {
        expect(() => purchaseBoxParamsSchema.parse({ id: ' ' })).toThrow();
    });
});
