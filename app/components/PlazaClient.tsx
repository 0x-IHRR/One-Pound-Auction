"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Store, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import BlindBoxCard, { BlindBoxData } from './BlindBoxCard';
import PaymentModal from './PaymentModal';
import ContentReveal from './ContentReveal';

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
        <>
            {/* ═══ Tab Navigation ═══ */}
            <div className="flex justify-center py-4">
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#111827] border border-border">
                    <button
                        onClick={() => setActiveTab('OFFER')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'OFFER'
                                ? 'bg-[#00d4aa] text-[#0a0e1a] shadow-lg shadow-[#00d4aa]/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Store className="w-4 h-4" />
                        夜市 (Offers)
                    </button>
                    <button
                        onClick={() => setActiveTab('WISH')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'WISH'
                                ? 'bg-[#00d4aa] text-[#0a0e1a] shadow-lg shadow-[#00d4aa]/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        许愿池 (Wishes)
                    </button>
                </div>
            </div>

            {/* ═══ Product Grid ═══ */}
            <div className="px-4 md:px-8 lg:px-12 pb-12">
                {/* First Row — Featured */}
                <div className="relative mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {filteredBoxes.length > 0 ? (
                            filteredBoxes.slice(0, 5).map((box, idx) => (
                                <BlindBoxCard
                                    key={box.id}
                                    box={box}
                                    onClick={handleBoxClick}
                                    featured={idx === 2 || idx === 3}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                还没有任何人发布内容，快去抢首发吧！
                            </div>
                        )}
                    </div>
                    {/* Navigation arrows */}
                    {filteredBoxes.length > 5 && (
                        <>
                            <button className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1e293b] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#00d4aa]/50 transition-colors z-10">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1e293b] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#00d4aa]/50 transition-colors z-10">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Second Row */}
                {filteredBoxes.length > 5 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {filteredBoxes.slice(5, 10).map((box) => (
                            <BlindBoxCard
                                key={box.id}
                                box={box}
                                onClick={handleBoxClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                box={selectedBox}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}
