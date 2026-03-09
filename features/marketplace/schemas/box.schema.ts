import { z } from 'zod';

import { marketplaceItemTypes } from '@/features/marketplace/types/box';

const requiredText = z.string().trim().min(1, '该字段不能为空。');

export const createBoxInputSchema = z.object({
    itemType: z.enum(marketplaceItemTypes).default('OFFER'),
    title: requiredText,
    hook_description: requiredText,
    hidden_content: requiredText,
    price: z.coerce.number().positive().default(1),
    accepts_barter: z.boolean().optional().default(false),
    barter_demand: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((value) => (value && value.length > 0 ? value : null)),
});

export const purchaseBoxParamsSchema = z.object({
    id: z.string().trim().min(1, 'id 不能为空。'),
});
