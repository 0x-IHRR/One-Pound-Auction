import { z } from 'zod';

import { marketplaceContentStatuses, marketplaceItemTypes } from '@/features/marketplace/types/box';

const requiredText = z.string().trim().min(1, '该字段不能为空。');
const optionalText = z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));
const optionalPatchText = z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
        if (value === undefined || value === null) {
            return value;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    });

export const createBoxInputSchema = z.object({
    itemType: z.enum(marketplaceItemTypes).default('OFFER'),
    title: requiredText.max(80, '标题最多 80 个字符。'),
    hook_description: requiredText.max(200, '摘要最多 200 个字符。'),
    hidden_content: requiredText.max(5000, '隐藏内容最多 5000 个字符。'),
    price: z.coerce.number().positive().default(1),
    accepts_barter: z.boolean().optional().default(false),
    barter_demand: optionalText,
    status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
}).superRefine((value, context) => {
    if (value.accepts_barter && !value.barter_demand) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '开启交换后必须填写交换诉求。',
            path: ['barter_demand'],
        });
    }
});

export const updateBoxInputSchema = z.object({
    itemType: z.enum(marketplaceItemTypes).optional(),
    title: requiredText.max(80, '标题最多 80 个字符。').optional(),
    hook_description: requiredText.max(200, '摘要最多 200 个字符。').optional(),
    hidden_content: requiredText.max(5000, '隐藏内容最多 5000 个字符。').optional(),
    price: z.coerce.number().positive().optional(),
    accepts_barter: z.boolean().optional(),
    barter_demand: optionalPatchText,
}).superRefine((value, context) => {
    if (Object.values(value).every((field) => field === undefined)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '至少传入一个可更新字段。',
        });
    }

    if (value.accepts_barter === true && !value.barter_demand) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '开启交换后必须填写交换诉求。',
            path: ['barter_demand'],
        });
    }
});

export const listBoxesQuerySchema = z.object({
    itemType: z.enum(marketplaceItemTypes).optional(),
    q: z.string().trim().max(80, '搜索关键词最长 80 个字符。').optional(),
    status: z.enum(marketplaceContentStatuses).optional(),
    authorEmail: z.string().trim().email('authorEmail 格式不正确。').optional(),
});

export const boxIdParamsSchema = z.object({
    id: z.string().trim().min(1, 'id 不能为空。'),
});

export const purchaseBoxParamsSchema = boxIdParamsSchema;
