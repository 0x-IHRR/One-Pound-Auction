"use client";

import { Flame, ShoppingCart } from "lucide-react";

export type BlindBoxData = {
    id: string;
    title: string;
    hook_description: string;
    price: number;
    sales_count: number;
    itemType?: string;
    accepts_barter?: boolean;
    barter_demand?: string | null;
};

interface BlindBoxCardProps {
    box: BlindBoxData;
    onClick: (box: BlindBoxData) => void;
    featured?: boolean;
}

export default function BlindBoxCard({ box, onClick, featured = false }: BlindBoxCardProps) {
    const tagColor = box.itemType === 'WISH' ? 'pink' : 'orange';
    const tagText = box.itemType === 'WISH' ? '悬赏许愿' : '资源出售';

    return (
        <div
            onClick={() => onClick(box)}
            className={`relative flex flex-col rounded-xl p-4 transition-all card-glow cursor-pointer group ${featured
                    ? "bg-gradient-to-b from-[#0d2847] to-[#111827] border-[#00d4aa]/50 border shadow-lg shadow-[#00d4aa]/10"
                    : "bg-[#111827] border border-border hover:border-[#00d4aa]/30"
                }`}
        >
            {/* Price tag (top-left subtle) */}
            <div className="absolute top-3 left-3 text-xs text-muted-foreground">
                ¥{box.price.toFixed(2)}
            </div>

            {/* Tag + Price row */}
            <div className="flex items-center justify-between mb-4 mt-1">
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${tagColor === 'pink'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}
                >
                    <Flame className="w-3 h-3" />
                    {tagText}
                </span>
                <span className="text-[#00d4aa] font-bold text-sm">
                    ¥{box.price.toFixed(2)}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                {box.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
                {box.hook_description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>已有 {box.sales_count} 人揭榜/购买</span>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#00d4aa]/10 text-[#00d4aa] text-xs font-medium hover:bg-[#00d4aa]/20 transition-colors">
                    <ShoppingCart className="w-3 h-3" />
                    购买
                </button>
            </div>
        </div>
    );
}
