'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

type SubmissionResult = {
    id: string;
    title: string;
    problemStatus: string;
    sourceType: string;
};

export default function ProblemSubmissionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SubmissionResult | null>(null);

    const submit = async (event: {
        preventDefault: () => void;
        currentTarget: HTMLFormElement;
    }) => {
        event.preventDefault();
        setError(null);
        setResult(null);
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const payload = {
            title: String(formData.get('title') ?? ''),
            problem: String(formData.get('problem') ?? ''),
            context: String(formData.get('context') ?? ''),
            displayName: String(formData.get('displayName') ?? ''),
            contact: String(formData.get('contact') ?? ''),
            sourceUrl: String(formData.get('sourceUrl') ?? ''),
            publicConsent: formData.get('publicConsent') === 'on',
            website: String(formData.get('website') ?? ''),
        };

        try {
            const response = await fetch('/api/problem-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const responsePayload = (await response.json()) as ApiSuccess<SubmissionResult> | ApiFailure;

            if (!response.ok || !responsePayload.success) {
                throw new Error(getApiErrorMessage(responsePayload, '提交失败，请稍后重试。'));
            }

            setResult(responsePayload.data);
            event.currentTarget.reset();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : '提交失败，请稍后重试。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="border border-[#00d4aa]/25 bg-[#00d4aa]/10 p-6">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#00d4aa]" />
                    <p className="text-lg font-semibold text-white">问题已进入公开问题池</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                    我会优先看这些真实卡点。联系方式、补充背景和相关链接只在后台可见，公开页只展示你同意公开的问题摘要。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href={`/boxes/${result.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                    >
                        查看公开问题
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setResult(null)}
                        className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                    >
                        再提交一个
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={(event) => void submit(event)} className="border border-white/10 bg-[#101827] p-5 md:p-6">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <div className="grid gap-5">
                <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-100">一句话标题</span>
                    <input
                        name="title"
                        required
                        maxLength={80}
                        placeholder="比如：我的作品集页面没人愿意继续看"
                        className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/45"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-100">你现在卡在哪里</span>
                    <textarea
                        name="problem"
                        required
                        maxLength={600}
                        rows={5}
                        placeholder="直接说现象、你试过什么、哪里最烦。不是技术问题也可以。"
                        className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#00d4aa]/45"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-100">补充背景</span>
                    <textarea
                        name="context"
                        maxLength={1500}
                        rows={4}
                        placeholder="项目链接、截图说明、目标用户、已经尝试过的方法，都可以放这里。"
                        className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#00d4aa]/45"
                    />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-100">怎么称呼你</span>
                        <input
                            name="displayName"
                            maxLength={60}
                            placeholder="可留空"
                            className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/45"
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-100">联系方式</span>
                        <input
                            name="contact"
                            maxLength={200}
                            placeholder="微信、邮箱、X 账号，后台可见"
                            className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/45"
                        />
                    </label>
                </div>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-100">相关链接</span>
                    <input
                        name="sourceUrl"
                        type="url"
                        maxLength={300}
                        placeholder="https://..."
                        className="rounded-none border border-white/10 bg-[#0a0e1a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/45"
                    />
                </label>

                <label className="flex items-start gap-3 border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                    <input name="publicConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#00d4aa]" />
                    <span>我同意公开问题标题和摘要；联系方式、补充背景和相关链接只给管理员处理。</span>
                </label>
            </div>

            {error ? (
                <div className="mt-5 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa] px-5 py-3 text-sm font-semibold text-[#071014] transition hover:bg-[#55e8ce] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        提交中
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        提交给我
                    </>
                )}
            </button>
        </form>
    );
}
