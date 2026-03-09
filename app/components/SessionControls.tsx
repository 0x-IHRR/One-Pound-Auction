"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { CurrentUser } from '../lib/current-user';

interface SessionControlsProps {
    currentUser: CurrentUser | null;
}

export default function SessionControls({ currentUser }: SessionControlsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const response = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: '登录失败。' }));
            setError(data.error ?? '登录失败。');
            return;
        }

        startTransition(() => {
            router.refresh();
        });
    };

    const handleLogout = async () => {
        await fetch('/api/session', { method: 'DELETE' });
        startTransition(() => {
            router.refresh();
        });
    };

    if (currentUser) {
        return (
            <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
                <Link
                    href="/creator"
                    className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                >
                    发布内容
                </Link>
                <Link
                    href="/me"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                >
                    我的内容
                </Link>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleLogout}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-60"
                >
                    退出
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            {!isOpen ? (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                >
                    登录后管理内容
                </button>
            ) : (
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-[0_0_30px_rgba(0,212,170,0.08)]"
                >
                    <p className="mb-3 text-sm font-medium text-white">Demo 登录</p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="昵称"
                            className="w-full rounded-xl border border-white/10 bg-[#0d1220] px-3 py-2 text-sm text-white outline-none transition focus:border-[#00d4aa]/40"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="邮箱"
                            className="w-full rounded-xl border border-white/10 bg-[#0d1220] px-3 py-2 text-sm text-white outline-none transition focus:border-[#00d4aa]/40"
                        />
                    </div>
                    {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-full px-3 py-2 text-xs font-medium text-slate-400 transition hover:text-white"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20 disabled:opacity-60"
                        >
                            {isPending ? '登录中...' : '进入内容中心'}
                        </button>
                    </div>
                </form>
            )}
            <p className="text-xs text-slate-500">当前用 cookie 模拟登录，仅用于本分支内容归属管理。</p>
        </div>
    );
}
