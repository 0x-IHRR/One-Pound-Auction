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
    const tagText = box.itemType === 'WISH' ? '✨ 悬赏许愿' : '🔥 资源出售';

    return (
        <div
            onClick={() => onClick(box)}
            className={`sci-fi-card flex flex-col p-4 cursor-pointer h-[220px] ${featured ? 'sci-fi-card-featured' : ''
                }`}
        >
            {/* Tag + Price row */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${tagColor === 'pink'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}
                >
                    {tagText}
                </span>
                <span className="text-[#00d4aa] font-bold text-sm">
                    ¥{box.price.toFixed(2)}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                {box.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1">
                {box.hook_description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#1e3a5f]/50">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Flame className="w-3 h-3 text-orange-400" />
                    已有 {box.sales_count} 人揭榜/购买
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00d4aa]/10 text-[#00d4aa] text-[11px] font-medium hover:bg-[#00d4aa]/20 transition-colors">
                    <ShoppingCart className="w-3 h-3" />
                    购买
                </button>
            </div>
        </div>
    );
}
