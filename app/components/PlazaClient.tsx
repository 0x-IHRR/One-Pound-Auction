"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import BlindBoxCard, { BlindBoxData } from './BlindBoxCard';
import PaymentModal from './PaymentModal';
import ContentReveal from './ContentReveal';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlazaClient({ initialBoxes }: { initialBoxes: BlindBoxData[] }) {
    const [boxes, setBoxes] = useState<BlindBoxData[]>(initialBoxes);
    const [selectedBox, setSelectedBox] = useState<BlindBoxData | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [revealedContent, setRevealedContent] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'OFFER' | 'WISH'>('OFFER');

    const handleBoxClick = (box: BlindBoxData) => {
        setSelectedBox(box);
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = (content: string) => {
        setIsPaymentOpen(false);
        setRevealedContent(content);

        // Optimistically update sales count locally
        setBoxes(current =>
            current.map(b =>
                b.id === selectedBox?.id ? { ...b, sales_count: b.sales_count + 1 } : b
            )
        );
    };

    const handleReset = () => {
        setSelectedBox(null);
        setRevealedContent(null);
    };

    if (revealedContent) {
        return <ContentReveal content={revealedContent} onReset={handleReset} />;
    }

    const filteredBoxes = boxes.filter(box => (box.itemType || 'OFFER') === activeTab);

    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto items-center">

            {/* Top Container: Apple Segmented Control + Creator Entry */}
            <div className="flex flex-row items-center justify-center gap-4 mb-10 w-full max-w-lg relative z-10">

                {/* Segmented Control */}
                <div className="flex bg-white/5 p-1 rounded-full relative border border-white/10 backdrop-blur-xl shadow-[inset_0_2px_15px_rgba(255,255,255,0.02)] flex-1 min-w-0">
                    <button
                        onClick={() => setActiveTab('OFFER')}
                        className={`flex-1 py-2 px-4 text-[13px] sm:text-sm font-medium rounded-full z-10 transition-colors ${activeTab === 'OFFER' ? 'text-white drop-shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        🛍️ 夜市 (Offers)
                    </button>
                    <button
                        onClick={() => setActiveTab('WISH')}
                        className={`flex-1 py-2 px-4 text-[13px] sm:text-sm font-medium rounded-full z-10 transition-colors ${activeTab === 'WISH' ? 'text-white drop-shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        ⛲️ 许愿池 (Wishes)
                    </button>
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-500/80 to-indigo-500/80 rounded-full shadow-lg border border-white/10"
                        initial={false}
                        animate={{ left: activeTab === 'OFFER' ? '4px' : 'calc(50%)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ zIndex: 0 }}
                    />
                </div>

                {/* Minimalist Creator Button */}
                <Link
                    href="/creator"
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full p-2 pr-3.5 transition-all text-slate-300 backdrop-blur-lg shrink-0"
                >
                    <div className="bg-white/10 p-1 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-medium hidden sm:block">去发帖 / 摆个小摊</span>
                </Link>
            </div>

            {/* Card Grid — wraps on desktop, horizontal scroll on mobile */}
            <div className="w-full overflow-x-auto md:overflow-visible pb-4 pt-4 hide-scrollbar">
                <div className="flex flex-nowrap md:flex-wrap gap-5 px-2 md:px-0 md:justify-center">
                    <AnimatePresence mode='popLayout'>
                        {filteredBoxes.length > 0 ? (
                            filteredBoxes.map((box, i) => (
                                <motion.div
                                    key={box.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="w-[260px] md:w-[280px] shrink-0 md:shrink"
                                >
                                    <BlindBoxCard
                                        box={box}
                                        onClick={handleBoxClick}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full text-center py-16 text-slate-500 font-light text-sm"
                            >
                                还没有任何人发布内容，快去抢首发吧！ ✨
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                box={selectedBox}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
