import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, ExternalLink, Radio } from 'lucide-react';
import AuthNav from '@/app/components/auth/AuthNav';
import DetailPurchasePanel from '@/app/components/DetailPurchasePanel';
import StatusBadge from '@/app/components/StatusBadge';
import { getCurrentUser } from '@/app/lib/auth/session';
import { getMarketplaceBoxDetail } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';

export const dynamic = 'force-dynamic';

export default async function BoxDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ purchase?: string }>;
}) {
    const { id } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const currentUser = await getCurrentUser();
    let content;

    try {
        content = await getMarketplaceBoxDetail(id, currentUser);
    } catch (error) {
        if (error instanceof AppError && error.status === 404) {
            notFound();
        }

        throw error;
    }

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                        返回广场
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-white">内容详情</h1>
                </div>
                <AuthNav />
            </div>

            {resolvedSearchParams?.purchase === 'success' ? (
                <div className="mb-6 rounded-2xl border border-[#00d4aa]/20 bg-[#00d4aa]/10 px-4 py-3 text-sm text-[#8ef5dd]">
                    支付成功，这条内容已经解锁。你现在看到的是当前登录账号可见的内容状态。
                </div>
            ) : null}

            {resolvedSearchParams?.purchase === 'already-unlocked' ? (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    这条内容你之前已经购买过，直接回到了已解锁详情。
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <article className="rounded-[32px] border border-white/8 bg-white/[0.03] p-7">
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={content.status} />
                        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            {content.itemType === 'OFFER' ? '夜市内容' : '许愿池内容'}
                        </span>
                        {content.fulfillmentMode === 'FREE_HELP_REQUEST' ? (
                            <span className="rounded-full border border-[#00d4aa]/25 bg-[#00d4aa]/10 px-2.5 py-1 text-xs font-medium text-[#00d4aa]">
                                {content.problemStatus === 'SOLVED'
                                    ? '已解决'
                                    : content.problemStatus === 'IN_PROGRESS'
                                        ? '处理中'
                                        : '待处理'}
                            </span>
                        ) : null}
                    </div>
                    <h1 className="mt-5 text-4xl font-black tracking-tight text-white">{content.title}</h1>
                    <p className="mt-5 text-lg leading-8 text-slate-300">{content.hook_description}</p>

                    <div className="mt-8 grid gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 md:grid-cols-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">作者</p>
                            <p className="mt-2 text-sm text-white">{content.authorName ?? '匿名历史内容'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">发布时间</p>
                            <p className="mt-2 text-sm text-white">
                                {content.publishedAt ? new Date(content.publishedAt).toLocaleString('zh-CN') : '未发布'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">购买次数</p>
                            <p className="mt-2 text-sm text-white">{content.sales_count}</p>
                        </div>
                    </div>

                    {content.livePlatform && content.liveUrl ? (
                        <section className="mt-8 rounded-[28px] border border-rose-500/18 bg-rose-500/[0.04] p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
                                    <Radio className="h-3.5 w-3.5" />
                                    {content.liveStatus === 'LIVE'
                                        ? '直播中'
                                        : content.liveStatus === 'ENDED'
                                            ? '直播已结束'
                                            : '直播拍卖入口'}
                                </span>
                                <span className="text-sm text-slate-300">
                                    {content.livePlatform === 'ZOOM'
                                        ? 'Zoom'
                                        : content.livePlatform === 'X_SPACES'
                                            ? 'X Spaces'
                                            : '外部直播'}
                                </span>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-300">
                                这条内容会在外部直播里继续成交或讲解。想跟着节奏进场，就从这里直接跳过去。
                            </p>

                            {content.liveStartsAt ? (
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                                    <CalendarDays className="h-3.5 w-3.5 text-[#00d4aa]" />
                                    开场时间：{new Date(content.liveStartsAt).toLocaleString('zh-CN')}
                                </div>
                            ) : null}

                            <div className="mt-5">
                                <a
                                    href={content.liveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/18"
                                >
                                    进入直播
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </section>
                    ) : null}

                    {content.isOwner && content.hidden_content ? (
                        <section className="mt-8 rounded-[28px] border border-[#00d4aa]/20 bg-[#00d4aa]/5 p-5">
                            <p className="text-sm font-medium text-[#00d4aa]">作者可见隐藏内容</p>
                            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">
                                {content.hidden_content}
                            </pre>
                            <div className="mt-5">
                                <Link
                                    href={`/boxes/${content.id}/edit`}
                                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
                                >
                                    去编辑
                                </Link>
                            </div>
                        </section>
                    ) : null}
                </article>

                <DetailPurchasePanel content={content} />
            </div>
        </main>
    );
}
