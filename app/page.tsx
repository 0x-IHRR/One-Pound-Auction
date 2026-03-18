import Image from 'next/image';
import { CalendarDays, ChevronDown, ExternalLink, Radio } from 'lucide-react';

import AuthNav from '@/app/components/auth/AuthNav';
import PlazaClient from '@/features/marketplace/components/PlazaClient';
import { listMarketplaceBoxes } from '@/features/marketplace/server/services/box.service';

export const dynamic = 'force-dynamic';

const activities = [
    { user: '游历', action: '刚把一条压箱底的旧草稿重新点亮' },
    { user: '西单男孩', action: '把【即兴表演赛博朋克风头像】重新摆上了摊' },
    { user: 'User_39x', action: '用 1 元捞走了【小红书爆款标题生成器】' },
    { user: '大佬_Null', action: '在许愿池丢下了【求前腾讯 PM 帮看简历】' },
];

function readQuery(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

export default async function Home({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const itemType = readQuery(resolvedSearchParams.itemType);
    const q = readQuery(resolvedSearchParams.q)?.trim();
    const boxes = await listMarketplaceBoxes({
        itemType: itemType === 'OFFER' || itemType === 'WISH' ? itemType : undefined,
        q: q || undefined,
    });
    const liveHighlights = boxes.filter((box) => box.livePlatform && box.liveUrl && box.liveStatus !== 'ENDED').slice(0, 3);

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,170,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(0,119,182,0.08),transparent_35%)] pointer-events-none" />

            <div className="relative z-10 w-full px-4 pb-16 pt-6 md:px-8 xl:px-10">
                <header className="-mx-4 flex flex-col gap-4 border-y border-white/8 bg-[#0d1220]/80 px-4 py-4 backdrop-blur md:-mx-8 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-4 md:px-8 xl:-mx-10 xl:px-10">
                    <div className="flex items-center">
                        <Image
                            src="/logo/logo_cropped.png"
                            alt="一元破壁集市 Logo"
                            width={168}
                            height={48}
                            className="h-12 w-auto"
                            priority
                        />
                    </div>

                    {liveHighlights.length > 0 ? (
                        <div className="flex justify-center">
                            <details className="group relative w-full max-w-sm">
                                <summary className="flex list-none items-center justify-center gap-2 rounded-full border border-rose-500/22 bg-rose-500/10 px-4 py-2 text-[15px] font-medium text-rose-200 transition hover:border-rose-400/35 hover:bg-rose-500/16 [&::-webkit-details-marker]:hidden">
                                    <Radio className="h-4 w-4" />
                                    直播拍卖入口
                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500/18 px-1.5 py-0.5 text-[11px] font-semibold text-rose-100">
                                        {liveHighlights.length}
                                    </span>
                                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                </summary>

                                <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-30 w-[min(92vw,28rem)] -translate-x-1/2 rounded-[24px] border border-rose-500/18 bg-[linear-gradient(135deg,rgba(70,10,34,0.36),rgba(13,18,32,0.96))] p-3 shadow-[0_20px_60px_rgba(3,7,18,0.5)] backdrop-blur-md">
                                    <div className="space-y-2">
                                        {liveHighlights.map((box) => (
                                            <a
                                                key={box.id}
                                                href={box.liveUrl ?? undefined}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group/live block rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-rose-400/35 hover:bg-white/[0.07]"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] uppercase tracking-[0.22em] text-rose-200/75">
                                                            {box.livePlatform === 'ZOOM' ? 'Zoom' : box.livePlatform === 'X_SPACES' ? 'X Spaces' : 'Live Link'}
                                                        </p>
                                                        <p className="mt-1 truncate text-sm font-semibold text-white">{box.title}</p>
                                                    </div>
                                                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-200">
                                                        <Radio className="h-3 w-3" />
                                                        {box.liveStatus === 'LIVE' ? '直播中' : '待开场'}
                                                    </span>
                                                </div>

                                                {box.liveStartsAt ? (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-300">
                                                        <CalendarDays className="h-3.5 w-3.5 text-[#00d4aa]" />
                                                        {new Date(box.liveStartsAt).toLocaleString('zh-CN')}
                                                    </div>
                                                ) : null}

                                                <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-rose-200 transition group-hover/live:text-white">
                                                    直接进场
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </div>
                    ) : (
                        <div className="hidden md:block" />
                    )}

                    <AuthNav />
                </header>

                <main className="pt-10">
                    <section className="w-full text-center">
                        <p className="text-sm uppercase tracking-[0.28em] text-[#00d4aa]">Content Plaza</p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                            一元破壁集市
                        </h1>
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                            有人花 1 元卖掉脑海里闪过的点子，有人花 1 元买到眼下最缺的答案。这里不讲宏大叙事，只让好东西和真需求更快碰头。
                        </p>

                        <form className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur md:flex-row">
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="搜一句你现在最想要的，比如：简历、模板、Prompt"
                                className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#0d1220] px-5 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/40"
                            />
                            {itemType ? <input type="hidden" name="itemType" value={itemType} /> : null}
                            <button
                                type="submit"
                                className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-6 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                            >
                                去捞一捞
                            </button>
                        </form>
                    </section>

                    <div className="-mx-4 my-10 w-auto overflow-hidden border-y border-white/8 bg-white/[0.03] px-4 py-3 md:-mx-8 md:px-8 xl:-mx-10 xl:px-10">
                        <div className="flex animate-ticker whitespace-nowrap">
                            {[...activities, ...activities].map((item, index) => (
                                <div key={`${item.user}-${index}`} className="mx-6 flex items-center gap-2 text-sm">
                                    <span className="font-medium text-[#00d4aa]">{item.user}</span>
                                    <span className="text-slate-400">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <PlazaClient
                        initialBoxes={boxes}
                        activeItemType={itemType === 'OFFER' || itemType === 'WISH' ? itemType : undefined}
                        currentQuery={q || undefined}
                    />
                </main>
            </div>
        </div>
    );
}
