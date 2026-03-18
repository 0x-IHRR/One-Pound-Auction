import { z } from 'zod';

import {
    marketplaceContentStatuses,
    marketplaceItemTypes,
    marketplaceLivePlatforms,
    marketplaceLiveStatuses,
} from '@/features/marketplace/types/box';

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
const optionalUrl = z
    .string()
    .trim()
    .url('直播链接格式不正确。')
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));
const optionalPatchUrl = z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
        if (value === undefined || value === null) {
            return value;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    })
    .pipe(z.union([z.string().url('直播链接格式不正确。'), z.null(), z.undefined()]));
const optionalDateTime = z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((value) => {
        if (!value) {
            return null;
        }

        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? value : date;
    })
    .pipe(z.union([z.date(), z.null()]));
const optionalPatchDateTime = z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((value) => {
        if (value === undefined) {
            return undefined;
        }

        if (value === null || value === '') {
            return null;
        }

        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? value : date;
    })
    .pipe(z.union([z.date(), z.null(), z.undefined()]));

function refineLiveFields(
    value: {
        livePlatform?: (typeof marketplaceLivePlatforms)[number] | null;
        liveUrl?: string | null;
        liveStartsAt?: Date | null;
        liveStatus?: (typeof marketplaceLiveStatuses)[number] | null;
    },
    context: z.RefinementCtx,
) {
    const hasLiveFields = Boolean(value.livePlatform || value.liveUrl || value.liveStartsAt || value.liveStatus);

    if (!hasLiveFields) {
        return;
    }

    if (!value.livePlatform) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '开启直播接入后必须选择直播平台。',
            path: ['livePlatform'],
        });
    }

    if (!value.liveUrl) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '开启直播接入后必须填写直播链接。',
            path: ['liveUrl'],
        });
    }

    if (value.liveStatus === 'SCHEDULED' && !value.liveStartsAt) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '直播待开场时必须填写开始时间。',
            path: ['liveStartsAt'],
        });
    }
}

export const createBoxInputSchema = z.object({
    itemType: z.enum(marketplaceItemTypes).default('OFFER'),
    title: requiredText.max(80, '标题最多 80 个字符。'),
    hook_description: requiredText.max(200, '摘要最多 200 个字符。'),
    hidden_content: requiredText.max(5000, '隐藏内容最多 5000 个字符。'),
    price: z.coerce.number().positive().default(1),
    accepts_barter: z.boolean().optional().default(false),
    barter_demand: optionalText,
    status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
    livePlatform: z.enum(marketplaceLivePlatforms).optional().nullable().default(null),
    liveUrl: optionalUrl,
    liveStartsAt: optionalDateTime,
    liveStatus: z.enum(marketplaceLiveStatuses).optional().nullable().default(null),
}).superRefine((value, context) => {
    if (value.accepts_barter && !value.barter_demand) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: '开启交换后必须填写交换诉求。',
            path: ['barter_demand'],
        });
    }

    refineLiveFields(value, context);
});

export const updateBoxInputSchema = z.object({
    itemType: z.enum(marketplaceItemTypes).optional(),
    title: requiredText.max(80, '标题最多 80 个字符。').optional(),
    hook_description: requiredText.max(200, '摘要最多 200 个字符。').optional(),
    hidden_content: requiredText.max(5000, '隐藏内容最多 5000 个字符。').optional(),
    price: z.coerce.number().positive().optional(),
    accepts_barter: z.boolean().optional(),
    barter_demand: optionalPatchText,
    livePlatform: z.enum(marketplaceLivePlatforms).nullable().optional(),
    liveUrl: optionalPatchUrl,
    liveStartsAt: optionalPatchDateTime,
    liveStatus: z.enum(marketplaceLiveStatuses).nullable().optional(),
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

    refineLiveFields(value, context);
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
