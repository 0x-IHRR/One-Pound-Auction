import Image from 'next/image';
import PlazaClient from './components/PlazaClient';
import SessionControls from './components/SessionControls';
import { getCurrentUser } from './lib/current-user';
import { marketplaceService } from '../features/marketplace/service';

export const dynamic = 'force-dynamic';

const activities = [
    { user: '游历', action: '刚刚重新发布了一个旧草稿' },
    { user: '西单男孩', action: '上架了闲置技能【即兴表演赛博朋克风头像】' },
    { user: 'User_39x', action: '用 1 元买下了【小红书爆款标题生成器】' },
    { user: '大佬_Null', action: '在许愿池挂出了【求前腾讯 PM 帮看简历】' },
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
    const currentUser = await getCurrentUser();
    const boxes = await marketplaceService.listPublicContents({
        itemType: itemType === 'OFFER' || itemType === 'WISH' ? itemType : undefined,
        q: q || undefined,
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,170,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(0,119,182,0.08),transparent_35%)] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
                <header className="flex flex-col gap-6 rounded-[32px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo/logo_cropped.png"
                            alt="一元破壁集市 Logo"
                            width={168}
                            height={48}
                            className="h-12 w-auto"
                            priority
                        />
                        <div>
                            <p className="text-sm font-medium text-[#00d4aa]">Marketplace Content</p>
                            <p className="text-sm text-slate-400">把原来的盲盒流升级成可搜索、可管理、可上下架的内容域。</p>
                        </div>
                    </div>
                    <SessionControls currentUser={currentUser} />
                </header>

                <main className="pt-10">
                    <section className="mx-auto max-w-4xl text-center">
                        <p className="text-sm uppercase tracking-[0.28em] text-[#00d4aa]">Content Plaza</p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                            一元破壁集市
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                            保留当前“能发、能看、能买”的闭环，同时补齐内容归属、状态、详情、筛选和我的内容管理入口。
                        </p>

                        <form className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur md:flex-row">
                            <input
                                type="text"
                                name="q"
                                defaultValue={q}
                                placeholder="搜索标题或描述，例如：简历、模板、Prompt"
                                className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#0d1220] px-5 py-3 text-sm text-white outline-none transition focus:border-[#00d4aa]/40"
                            />
                            {itemType ? <input type="hidden" name="itemType" value={itemType} /> : null}
                            <button
                                type="submit"
                                className="rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-6 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                            >
                                搜索内容
                            </button>
                        </form>
                    </section>

                    <div className="my-10 overflow-hidden rounded-full border border-white/8 bg-white/[0.03] py-3">
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
