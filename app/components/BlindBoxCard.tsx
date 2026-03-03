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
            className="glass-panel cursor-pointer relative overflow-hidden group p-6 flex flex-col justify-between h-48"
        >
            {/* Background Gradient Effect on Hover */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Header section with sales count */}
            <div className="flex justify-between items-start mb-4 z-10">
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 text-blue-200">
                    🔥 已售出 {box.sales_count} 份
                </div>
                <div className="bg-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    ¥{box.price.toFixed(2)}
                </div>
            </div>

            {/* Content Section */}
            <div className="z-10 mt-auto">
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-blue-300 transition-colors line-clamp-2">
                    {box.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                    {box.hook_description}
                </p>
            </div>

            {/* 'Tap to unlock' hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute bottom-6 right-6 z-10"
            >
                <span className="text-xs text-blue-400 font-medium">点击开启 &rarr;</span>
            </motion.div>
        </motion.div>
    );
}
