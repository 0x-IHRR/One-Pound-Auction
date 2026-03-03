"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";

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
}

export default function BlindBoxCard({ box, onClick }: BlindBoxCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => onClick(box)}
            className="glass-panel cursor-pointer relative overflow-hidden group p-6 flex flex-col justify-between h-56 min-w-[280px] snap-center shrink-0 border border-white/10 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
            {/* Soft ambient glow behind card content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

            {/* Header section with sales count */}
            <div className="flex justify-between items-start mb-4 z-10">
                <div className="flex flex-col gap-2">
                    <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border border-white/10 text-slate-300 w-fit">
                        {box.itemType === 'WISH' ? '✨ 悬赏许愿' : '🛍️ 资源出售'}
                    </div>
                </div>

                <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1 shadow-sm backdrop-blur-md">
                    <Lock className="w-3 h-3 text-amber-400" />
                    ¥{box.price.toFixed(2)}
                </div>
            </div>

            {/* Content Section */}
            <div className="z-10 mt-auto">
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                    {box.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-2 font-light">
                    {box.hook_description}
                </p>
                {/* Minimalist sales count indicator at bottom */}
                <div className="text-[10px] text-slate-500 font-medium">
                    🔥 已有 {box.sales_count} 人揭榜/购买
                </div>
            </div>

            {/* 'Tap to unlock' iOS style chevron */}
            <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                className="absolute bottom-6 right-6 z-10"
            >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md text-white">
                    <span className="text-sm">&rarr;</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
