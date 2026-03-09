"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';
import type { MarketplaceContentStatus } from '@/features/marketplace/types/box';

interface MyContentActionsProps {
    id: string;
    status: MarketplaceContentStatus;
}

export default function MyContentActions({ id, status }: MyContentActionsProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const runAction = async (label: string, url: string, method: 'POST' | 'DELETE') => {
        setActiveAction(label);
        setError(null);
        const response = await fetch(url, { method });
        const payload = await response.json().catch(() => null) as ApiSuccess<unknown> | ApiFailure | null;

        if (!response.ok) {
            setError(getApiErrorMessage(payload, '操作失败。'));
            setActiveAction(null);
            return;
        }

        startTransition(() => {
            router.refresh();
        });
        setActiveAction(null);
    };

    return (
        <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
                <Link
                    href={`/boxes/${id}`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                    查看
                </Link>
                <Link
                    href={`/boxes/${id}/edit`}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                    编辑
                </Link>
                {status !== 'PUBLISHED' ? (
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void runAction('publish', `/api/boxes/${id}/publish`, 'POST')}
                        className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-3 py-1.5 text-xs font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20 disabled:opacity-60"
                    >
                        {activeAction === 'publish' ? '处理中...' : '发布'}
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void runAction('unlist', `/api/boxes/${id}/unlist`, 'POST')}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-60"
                    >
                        {activeAction === 'unlist' ? '处理中...' : '下架'}
                    </button>
                )}
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                        if (!window.confirm('删除后内容会进入软删除状态，确认继续吗？')) {
                            return;
                        }
                        void runAction('delete', `/api/boxes/${id}`, 'DELETE');
                    }}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                >
                    {activeAction === 'delete' ? '处理中...' : '删除'}
                </button>
            </div>
            {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
    );
}
