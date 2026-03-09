import Link from 'next/link';
import { ArrowRight, Flame, Heart, Lightbulb, Package, Wrench } from 'lucide-react';

import type { MarketplaceBoxSummary } from '@/features/marketplace/types/box';

export type BlindBoxData = MarketplaceBoxSummary;

interface BlindBoxCardProps {
    box: BlindBoxData;
    href: string;
    featured?: boolean;
}

function detectCategory(box: BlindBoxData): { label: string; color: string; icon: typeof Flame } {
    const text = `${box.title}${box.hook_description}`.toLowerCase();

    if (box.itemType === 'WISH') {
        return { label: '悬赏', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: Heart };
    }

    if (text.includes('教程') || text.includes('课程') || text.includes('指南') || text.includes('手册') || text.includes('模板') || text.includes('公式')) {
        return { label: '资源', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', icon: Package };
    }

    if (text.includes('帮') || text.includes('服务') || text.includes('简历') || text.includes('review') || text.includes('设计')) {
        return { label: '服务', color: 'bg-orange-500/15 text-orange-400 border-orange-500/25', icon: Wrench };
    }

    return { label: 'Idea', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: Lightbulb };
}

export default function BlindBoxCard({ box, href, featured = false }: BlindBoxCardProps) {
    const category = detectCategory(box);
    const CategoryIcon = category.icon;

    return (
        <Link
            href={href}
            className={`sci-fi-card flex h-[230px] cursor-pointer flex-col p-5 ${featured ? 'sci-fi-card-featured' : ''}`}
        >
            <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${category.color}`}>
                    <CategoryIcon className="h-3 w-3" />
                    {category.label}
                </span>
                <span className="text-sm font-bold tabular-nums text-[#00d4aa]">¥{box.price.toFixed(2)}</span>
            </div>

            <h3 className="mb-2 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                {box.title}
            </h3>

            <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {box.hook_description}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-[#1e3a5f]/40 pt-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Flame className="h-3 w-3 text-orange-400" />
                    已有 {box.sales_count} 人揭榜/购买
                </div>
                <span className="flex items-center gap-1 rounded-md border border-[#00d4aa]/15 bg-[#00d4aa]/10 px-2.5 py-1 text-[11px] font-medium text-[#00d4aa]">
                    查看详情
                    <ArrowRight className="h-3 w-3" />
                </span>
            </div>
        </Link>
    );
}
