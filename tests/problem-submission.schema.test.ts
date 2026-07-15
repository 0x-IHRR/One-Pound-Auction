import { describe, expect, it } from 'vitest';

import { problemSubmissionInputSchema } from '@/features/problem-collector/schemas/problem-submission.schema';

describe('problemSubmissionInputSchema', () => {
    it('清洗免登录问题提交字段', () => {
        expect(problemSubmissionInputSchema.parse({
            title: '  页面没人看  ',
            problem: '  用户打开作品集就走  ',
            context: '  我试过换标题  ',
            displayName: '  IHRR  ',
            contact: '  me@example.com  ',
            sourceUrl: '',
            publicConsent: true,
        })).toEqual({
            title: '页面没人看',
            problem: '用户打开作品集就走',
            context: '我试过换标题',
            displayName: 'IHRR',
            contact: 'me@example.com',
            sourceUrl: null,
            publicConsent: true,
            website: '',
        });
    });

    it('拒绝未同意公开摘要的提交', () => {
        expect(() => problemSubmissionInputSchema.parse({
            title: '标题',
            problem: '问题',
            publicConsent: false,
        })).toThrow('提交前需要同意公开问题摘要。');
    });

    it('拒绝 honeypot 命中的提交', () => {
        expect(() => problemSubmissionInputSchema.parse({
            title: '标题',
            problem: '问题',
            publicConsent: true,
            website: 'bot-filled',
        })).toThrow('提交失败，请刷新页面后重试。');
    });

    it('拒绝过长的问题描述', () => {
        expect(() => problemSubmissionInputSchema.parse({
            title: '标题',
            problem: '问'.repeat(601),
            publicConsent: true,
        })).toThrow('问题描述最多 600 个字符。');
    });
});
