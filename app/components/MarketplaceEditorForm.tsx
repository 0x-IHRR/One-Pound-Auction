"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import type {
    MarketplaceContentStatus,
    MarketplaceItemType,
    MarketplaceLivePlatform,
    MarketplaceLiveStatus,
} from '@/features/marketplace/types/box';
import StatusBadge from './StatusBadge';

const livePlatformOptions: Array<{ value: MarketplaceLivePlatform; label: string }> = [
    { value: 'ZOOM', label: 'Zoom' },
    { value: 'X_SPACES', label: 'X Spaces' },
    { value: 'OTHER', label: '其他直播平台' },
];

const liveStatusOptions: Array<{ value: MarketplaceLiveStatus; label: string }> = [
    { value: 'SCHEDULED', label: '待开场' },
    { value: 'LIVE', label: '直播中' },
    { value: 'ENDED', label: '已结束' },
];

function toDateTimeLocalValue(value?: string | null) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset();
    const normalized = new Date(date.getTime() - offset * 60_000);
    return normalized.toISOString().slice(0, 16);
}

interface MarketplaceEditorFormProps {
    mode: 'create' | 'edit';
    endpoint: string;
    redirectTo?: string;
        initialValues?: {
            itemType: MarketplaceItemType;
            title: string;
            hook_description: string;
            hidden_content: string;
            price: number;
            accepts_barter: boolean;
            barter_demand: string | null;
            livePlatform: MarketplaceLivePlatform | null;
            liveUrl: string | null;
            liveStartsAt: string | null;
            liveStatus: MarketplaceLiveStatus | null;
        };
    currentStatus?: MarketplaceContentStatus;
}

export default function MarketplaceEditorForm({
    mode,
    endpoint,
    redirectTo = '/me',
    initialValues,
    currentStatus,
}: MarketplaceEditorFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        itemType: initialValues?.itemType ?? 'OFFER',
        title: initialValues?.title ?? '',
        hook_description: initialValues?.hook_description ?? '',
        hidden_content: initialValues?.hidden_content ?? '',
        price: String(initialValues?.price ?? 1),
        accepts_barter: initialValues?.accepts_barter ?? false,
        barter_demand: initialValues?.barter_demand ?? '',
        livePlatform: initialValues?.livePlatform ?? '',
        liveUrl: initialValues?.liveUrl ?? '',
        liveStartsAt: toDateTimeLocalValue(initialValues?.liveStartsAt),
        liveStatus: initialValues?.liveStatus ?? '',
    });

    const submit = async (status?: Extract<MarketplaceContentStatus, 'DRAFT' | 'PUBLISHED'>) => {
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(endpoint, {
                method: mode === 'create' ? 'POST' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    barter_demand: formData.accepts_barter ? formData.barter_demand : null,
                    livePlatform: formData.livePlatform || null,
                    liveUrl: formData.liveUrl.trim() ? formData.liveUrl.trim() : null,
                    liveStartsAt: formData.liveStartsAt ? new Date(formData.liveStartsAt).toISOString() : null,
                    liveStatus: formData.liveStatus || null,
                    ...(mode === 'create' ? { status } : {}),
                }),
            });
            const payload = await response.json() as ApiSuccess<unknown> | ApiFailure;

            if (!response.ok) {
                setError(getApiErrorMessage(payload, '提交失败。'));
                return;
            }

            startTransition(() => {
                router.push(redirectTo);
                router.refresh();
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-[#1e3a5f] bg-[#111827] p-8 shadow-[0_0_30px_rgba(0,212,170,0.08)]">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(0,212,170,0.12),transparent_65%)] pointer-events-none" />
            <div className="relative z-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {mode === 'create' ? '发布新内容' : '编辑内容'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            {mode === 'create'
                                ? '支持先存草稿，再选择合适时机发布。'
                                : '编辑不改变上下架动作，发布与下架在“我的内容”中单独控制。'}
                        </p>
                    </div>
                    {currentStatus ? <StatusBadge status={currentStatus} /> : null}
                </div>

                <div className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, itemType: 'OFFER' }))}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                                formData.itemType === 'OFFER'
                                    ? 'border-[#00d4aa]/40 bg-[#00d4aa]/10 text-white'
                                    : 'border-white/10 bg-[#0d1220] text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <p className="text-sm font-medium">夜市内容</p>
                            <p className="mt-1 text-xs opacity-80">出售资源、服务、模板或知识盲盒。</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, itemType: 'WISH' }))}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                                formData.itemType === 'WISH'
                                    ? 'border-[#00d4aa]/40 bg-[#00d4aa]/10 text-white'
                                    : 'border-white/10 bg-[#0d1220] text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <p className="text-sm font-medium">许愿池内容</p>
                            <p className="mt-1 text-xs opacity-80">发布需求、悬赏或希望获取的帮助。</p>
                        </button>
                    </div>

                    <div className="grid gap-5">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-200">标题</span>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                                className="rounded-2xl border border-white/10 bg-[#0d1220] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                placeholder="一句话说清你卖什么、求什么"
                            />
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-200">外层描述</span>
                            <textarea
                                rows={4}
                                value={formData.hook_description}
                                onChange={(event) => setFormData((current) => ({ ...current, hook_description: event.target.value }))}
                                className="rounded-2xl border border-white/10 bg-[#0d1220] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                placeholder="告诉用户为什么值得点开，但不要把真正内容写透。"
                            />
                        </label>

                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-200">隐藏内容</span>
                            <textarea
                                rows={8}
                                value={formData.hidden_content}
                                onChange={(event) => setFormData((current) => ({ ...current, hidden_content: event.target.value }))}
                                className="rounded-2xl border border-white/10 bg-[#0d1220] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                placeholder="填写真正交付的内容、链接、联系方式或资源说明。"
                            />
                        </label>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-200">价格</span>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
                                className="rounded-2xl border border-white/10 bg-[#0d1220] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                            />
                        </label>

                        <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-4">
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={formData.accepts_barter}
                                    onChange={(event) => {
                                        const acceptsBarter = event.target.checked;
                                        setFormData((current) => ({
                                            ...current,
                                            accepts_barter: acceptsBarter,
                                            barter_demand: acceptsBarter ? current.barter_demand : '',
                                        }));
                                    }}
                                    className="h-4 w-4 accent-[#00d4aa]"
                                />
                                接受以物易物 / 交换回应
                            </label>
                            {formData.accepts_barter ? (
                                <textarea
                                    rows={3}
                                    value={formData.barter_demand}
                                    onChange={(event) => setFormData((current) => ({ ...current, barter_demand: event.target.value }))}
                                    className="mt-4 w-full rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/40"
                                    placeholder="写清你愿意交换什么，例如：一份运营复盘、一次简历修改。"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-5">
                        <div className="mb-4">
                            <h2 className="text-sm font-medium text-slate-100">直播拍卖入口</h2>
                            <p className="mt-1 text-xs leading-6 text-slate-400">
                                如果这条内容会在 Zoom、X Spaces 或别的平台里开拍，这里可以先把入口挂上。
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-slate-200">直播平台</span>
                                <select
                                    value={formData.livePlatform}
                                    onChange={(event) => setFormData((current) => ({ ...current, livePlatform: event.target.value }))}
                                    className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                >
                                    <option value="">暂不接入直播</option>
                                    {livePlatformOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-slate-200">直播状态</span>
                                <select
                                    value={formData.liveStatus}
                                    onChange={(event) => setFormData((current) => ({ ...current, liveStatus: event.target.value }))}
                                    className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                >
                                    <option value="">未设置</option>
                                    {liveStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2 md:col-span-2">
                                <span className="text-sm font-medium text-slate-200">直播链接</span>
                                <input
                                    type="url"
                                    value={formData.liveUrl}
                                    onChange={(event) => setFormData((current) => ({ ...current, liveUrl: event.target.value }))}
                                    className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                    placeholder="https://zoom.us/j/... 或 https://x.com/i/spaces/..."
                                />
                            </label>

                            <label className="grid gap-2 md:col-span-2">
                                <span className="text-sm font-medium text-slate-200">开场时间</span>
                                <input
                                    type="datetime-local"
                                    value={formData.liveStartsAt}
                                    onChange={(event) => setFormData((current) => ({ ...current, liveStartsAt: event.target.value }))}
                                    className="rounded-2xl border border-white/10 bg-[#09101d] px-4 py-3 text-white outline-none transition focus:border-[#00d4aa]/40"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {error ? <p className="mt-5 text-sm text-red-300">{error}</p> : null}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/me"
                        className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
                    >
                        返回我的内容
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        {mode === 'create' ? (
                            <button
                                type="button"
                                disabled={isSubmitting || isPending}
                                onClick={() => void submit('DRAFT')}
                                className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-60"
                            >
                                {isSubmitting || isPending ? '提交中...' : '保存草稿'}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            disabled={isSubmitting || isPending}
                            onClick={() => void submit(mode === 'create' ? 'PUBLISHED' : undefined)}
                            className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20 disabled:opacity-60"
                        >
                            {isSubmitting || isPending ? '提交中...' : mode === 'create' ? '直接发布' : '保存修改'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
