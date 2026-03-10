import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';

import MyContentActions from '@/app/components/MyContentActions';
import StatusBadge from '@/app/components/StatusBadge';
import { signOutAction } from '@/app/lib/auth/actions';
import { isAuthGuardError, requireUser } from '@/app/lib/auth/guards';
import { buildSignInPath } from '@/app/lib/auth/redirects';
import { listMyMarketplaceBoxes } from '@/features/marketplace/server/services/box.service';
import type { MarketplaceContentStatus } from '@/features/marketplace/types/box';

type MePageProps = {
    searchParams: Promise<{
        denied?: string;
        status?: string;
    }>;
};

const filters: Array<{ label: string; value?: MarketplaceContentStatus }> = [
    { label: '全部可管理内容' },
    { label: '草稿', value: 'DRAFT' },
    { label: '已发布', value: 'PUBLISHED' },
    { label: '已下架', value: 'UNLISTED' },
];

export default async function MePage({ searchParams }: MePageProps) {
    let user;

    try {
        user = await requireUser();
    } catch (error) {
        if (isAuthGuardError(error)) {
            redirect(buildSignInPath('/me'));
        }

        throw error;
    }

    const { denied, status } = await searchParams;
    const activeStatus =
        status === 'DRAFT' || status === 'PUBLISHED' || status === 'UNLISTED'
            ? status
            : undefined;
    const contents = await listMyMarketplaceBoxes(user, { status: activeStatus });

    return (
        <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">PROFILE</p>
                        <h1 className="mt-2 text-3xl font-black">个人中心</h1>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
                    >
                        返回广场
                    </Link>
                </div>

                {denied === 'admin' ? (
                    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        当前账号不是管理员，后台入口已拦截。
                    </div>
                ) : null}

                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div className="flex items-center gap-3">
                        {user.role === 'ADMIN' ? (
                            <ShieldCheck className="h-8 w-8 text-[#00d4aa]" />
                        ) : (
                            <UserCircle2 className="h-8 w-8 text-[#00d4aa]" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{user.name ?? '未命名用户'}</h2>
                            <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">角色</p>
                            <p className="mt-3 text-lg font-semibold text-[#00d4aa]">{user.role}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">创作权限</p>
                            <p className="mt-3 text-lg font-semibold text-white">已解锁 /creator</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/creator"
                            className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/20"
                        >
                            去发布内容
                        </Link>
                        <Link
                            href="/me/purchases"
                            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
                        >
                            查看我的购买
                        </Link>
                        {user.role === 'ADMIN' ? (
                            <Link
                                href="/admin"
                                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
                            >
                                进入管理后台
                            </Link>
                        ) : null}
                        <form action={signOutAction}>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-rose-400/40 hover:text-rose-300"
                            >
                                <LogOut className="h-4 w-4" />
                                退出登录
                            </button>
                        </form>
                    </div>
                </section>

                <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">CONTENT</p>
                            <h2 className="mt-2 text-2xl font-black">我的内容</h2>
                            <p className="mt-2 text-sm text-slate-400">管理草稿、已发布和已下架内容，不回填历史匿名数据。</p>
                        </div>
                        <Link
                            href="/creator"
                            className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/20"
                        >
                            去创建内容
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {filters.map((filter) => {
                            const href = filter.value ? `/me?status=${filter.value}` : '/me';
                            const isActive = filter.value ? filter.value === activeStatus : !activeStatus;

                            return (
                                <Link
                                    key={filter.label}
                                    href={href}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-[#00d4aa] text-[#0a0e1a]'
                                            : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {filter.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-4">
                        {contents.length > 0 ? (
                            contents.map((content) => (
                                <article
                                    key={content.id}
                                    className="grid gap-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto]"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge status={content.status} />
                                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                {content.itemType === 'OFFER' ? '夜市' : '许愿池'}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 text-xl font-semibold text-white">{content.title}</h3>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                                            {content.hook_description}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                                            <span>价格 ¥{content.price.toFixed(2)}</span>
                                            <span>购买 {content.sales_count} 次</span>
                                            <span>更新于 {new Date(content.updatedAt).toLocaleString('zh-CN')}</span>
                                        </div>
                                    </div>
                                    <MyContentActions id={content.id} status={content.status} />
                                </article>
                            ))
                        ) : (
                            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                                <p className="text-lg font-semibold text-white">当前筛选下没有内容</p>
                                <p className="mt-3 text-sm text-slate-400">先去保存一条草稿，或者直接发布新的公开内容。</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
