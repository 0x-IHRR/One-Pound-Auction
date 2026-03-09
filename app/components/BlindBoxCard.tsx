import Link from 'next/link';
import { Flame, ArrowRight, Lightbulb, Package, Wrench, Heart } from 'lucide-react';
import type { MarketplaceContentSummary } from '../../features/marketplace/types';

export type BlindBoxData = MarketplaceContentSummary;

interface BlindBoxCardProps {
    box: BlindBoxData;
    href: string;
    featured?: boolean;
}

// Smart category detection based on title/description keywords
function detectCategory(box: BlindBoxData): { label: string; color: string; icon: typeof Flame } {
    const text = (box.title + box.hook_description).toLowerCase();

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
            className={`sci-fi-card flex flex-col p-5 cursor-pointer h-[230px] ${featured ? 'sci-fi-card-featured' : ''
                }`}
        >
            {/* Tag + Price row */}
            <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${category.color}`}>
                    <CategoryIcon className="w-3 h-3" />
                    {category.label}
                </span>
                <span className="text-[#00d4aa] font-bold text-sm tabular-nums">
                    ¥{box.price.toFixed(2)}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-foreground mb-2 line-clamp-2 leading-snug tracking-tight">
                {box.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1">
                {box.hook_description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#1e3a5f]/40">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Flame className="w-3 h-3 text-orange-400" />
                    已有 {box.sales_count} 人揭榜/购买
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00d4aa]/10 text-[#00d4aa] text-[11px] font-medium border border-[#00d4aa]/15">
                    查看详情
                    <ArrowRight className="w-3 h-3" />
                </span>
            </div>
        </Link>
    );
}
