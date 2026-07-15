import { z } from 'zod';

const requiredText = z.string().trim().min(1, '该字段不能为空。');
const optionalText = (max: number, message: string) => z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));

export const problemSubmissionInputSchema = z.object({
    title: requiredText.max(80, '标题最多 80 个字符。'),
    problem: requiredText.max(600, '问题描述最多 600 个字符。'),
    context: optionalText(1500, '补充信息最多 1500 个字符。'),
    displayName: optionalText(60, '称呼最多 60 个字符。'),
    contact: optionalText(200, '联系方式最多 200 个字符。'),
    sourceUrl: optionalText(300, '来源链接最多 300 个字符。').pipe(z.union([
        z.string().url('来源链接格式不正确。'),
        z.null(),
    ])),
    publicConsent: z.boolean().refine((value) => value, '提交前需要同意公开问题摘要。'),
    website: z.string().trim().max(0, '提交失败，请刷新页面后重试。').optional().default(''),
});

export type ProblemSubmissionInput = z.infer<typeof problemSubmissionInputSchema>;
