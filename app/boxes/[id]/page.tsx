import Link from 'next/link';
import { notFound } from 'next/navigation';
import DetailPurchasePanel from '../../components/DetailPurchasePanel';
import SessionControls from '../../components/SessionControls';
import StatusBadge from '../../components/StatusBadge';
import { getCurrentUser } from '../../lib/current-user';
import { isMarketplaceError } from '../../../features/marketplace/errors';
import { marketplaceService } from '../../../features/marketplace/service';

export const dynamic = 'force-dynamic';

export default async function BoxDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    let content;

    try {
        content = await marketplaceService.getContentDetail(id, currentUser);
    } catch (error) {
        if (isMarketplaceError(error) && error.statusCode === 404) {
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
                <SessionControls currentUser={currentUser} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <article className="rounded-[32px] border border-white/8 bg-white/[0.03] p-7">
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={content.status} />
                        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            {content.itemType === 'OFFER' ? '夜市内容' : '许愿池内容'}
                        </span>
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
