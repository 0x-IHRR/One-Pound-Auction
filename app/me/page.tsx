import Link from 'next/link';
import SessionControls from '../components/SessionControls';
import StatusBadge from '../components/StatusBadge';
import MyContentActions from '../components/MyContentActions';
import { getCurrentUser } from '../lib/current-user';
import { marketplaceService } from '../../features/marketplace/service';
import type { MarketplaceContentStatus } from '../../features/marketplace/types';

export const dynamic = 'force-dynamic';

function readQuery(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

const filters: Array<{ label: string; value?: MarketplaceContentStatus }> = [
    { label: '全部可管理内容' },
    { label: '草稿', value: 'DRAFT' },
    { label: '已发布', value: 'PUBLISHED' },
    { label: '已下架', value: 'UNLISTED' },
];

export default async function MePage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const currentUser = await getCurrentUser();
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const status = readQuery(resolvedSearchParams.status);
    const activeStatus =
        status === 'DRAFT' || status === 'PUBLISHED' || status === 'UNLISTED'
            ? status
            : undefined;

    const contents = currentUser
        ? await marketplaceService.listMyContents({ status: activeStatus, authorEmail: currentUser.email }, currentUser)
        : [];

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                        返回广场
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-white">我的内容</h1>
                    <p className="mt-2 text-sm text-slate-400">管理草稿、已发布和已下架内容，不回填历史匿名数据。</p>
                </div>
                <SessionControls currentUser={currentUser} />
            </div>

            {!currentUser ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                    <p className="text-xl font-semibold text-white">当前未登录</p>
                    <p className="mt-3 text-sm text-slate-400">登录后才会显示与你邮箱绑定的内容列表。</p>
                </div>
            ) : (
                <>
                    <div className="mb-6 flex flex-wrap items-center gap-2">
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

                    <div className="space-y-4">
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
                                        <h2 className="mt-4 text-xl font-semibold text-white">{content.title}</h2>
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
                                <Link
                                    href="/creator"
                                    className="mt-6 inline-flex rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                                >
                                    去创建内容
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
}
