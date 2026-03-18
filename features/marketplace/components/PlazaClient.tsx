import Link from 'next/link';
import { Plus, Search, Sparkles, Store } from 'lucide-react';

import BlindBoxCard, { type BlindBoxData } from '@/features/marketplace/components/BlindBoxCard';
import MarqueeRow from '@/features/marketplace/components/MarqueeRow';

interface PlazaClientProps {
    initialBoxes: BlindBoxData[];
    activeItemType?: 'OFFER' | 'WISH';
    currentQuery?: string;
}

function buildHref(itemType?: 'OFFER' | 'WISH', q?: string) {
    const searchParams = new URLSearchParams();

    if (itemType) {
        searchParams.set('itemType', itemType);
    }

    if (q) {
        searchParams.set('q', q);
    }

    const query = searchParams.toString();
    return query ? `/?${query}` : '/';
}

export default function PlazaClient({ initialBoxes, activeItemType, currentQuery }: PlazaClientProps) {
    const rows = [
        initialBoxes.filter((_, index) => index % 3 === 0),
        initialBoxes.filter((_, index) => index % 3 === 1),
        initialBoxes.filter((_, index) => index % 3 === 2),
    ].filter((row) => row.length > 0);

    return (
        <section className="w-full pb-20">
            <div className="mx-auto mb-8 flex w-full max-w-3xl flex-col gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={buildHref(undefined, currentQuery)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                            !activeItemType
                                ? 'bg-[#00d4aa] text-[#0a0e1a]'
                                : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                        }`}
                    >
                        <Search className="h-4 w-4" />
                        全部逛逛
                    </Link>
                    <Link
                        href={buildHref('OFFER', currentQuery)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                            activeItemType === 'OFFER'
                                ? 'bg-[#00d4aa] text-[#0a0e1a]'
                                : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                        }`}
                    >
                        <Store className="h-4 w-4" />
                        夜市
                    </Link>
                    <Link
                        href={buildHref('WISH', currentQuery)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                            activeItemType === 'WISH'
                                ? 'bg-[#00d4aa] text-[#0a0e1a]'
                                : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                        }`}
                    >
                        <Sparkles className="h-4 w-4" />
                        许愿池
                    </Link>
                </div>

                <Link
                    href="/creator"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                >
                    <Plus className="h-4 w-4" />
                    挂个新摊
                </Link>
            </div>

            {initialBoxes.length > 0 ? (
                <div className="space-y-5">
                    <div className="xl:-mx-10">
                        {rows.map((row, index) => (
                            <MarqueeRow
                                key={`row-${index}`}
                                boxes={row}
                                rowIndex={index}
                                direction={index % 2 === 0 ? "right" : "left"}
                            />
                        ))}
                    </div>

                    <div className="grid gap-5 pt-6 sm:grid-cols-2 xl:hidden">
                        {initialBoxes.map((box, index) => (
                            <BlindBoxCard
                                key={`fallback-${box.id}`}
                                box={box}
                                href={`/boxes/${box.id}`}
                                featured={index % 5 === 0}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
                    <p className="text-base font-medium text-white">这一栏暂时还空着</p>
                    <p className="mt-2 text-sm text-slate-400">换个词再捞一遍，或者干脆自己先挂点东西上来。</p>
                </div>
            )}
        </section>
    );
}
