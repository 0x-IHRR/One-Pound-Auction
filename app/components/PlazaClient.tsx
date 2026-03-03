"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Store, Sparkles, Plus } from 'lucide-react';
import BlindBoxCard, { BlindBoxData } from './BlindBoxCard';
import PaymentModal from './PaymentModal';
import ContentReveal from './ContentReveal';

function CardCarouselRow({ boxes, speed, reverse, onBoxClick }: {
    boxes: BlindBoxData[];
    speed: number;
    reverse?: boolean;
    onBoxClick: (box: BlindBoxData) => void;
}) {
    // Duplicate for seamless infinite scroll
    const items = [...boxes, ...boxes];

    return (
        <div className="relative overflow-hidden py-3">
            {/* Wide edge fade masks for the "slide in/out" effect */}
            <div className="absolute left-0 top-0 bottom-0 w-[12%] bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[12%] bg-gradient-to-l from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent z-10 pointer-events-none" />

            <div
                className="flex gap-5 w-max hover:[animation-play-state:paused]"
                style={{
                    animation: `carousel-scroll ${speed}s linear infinite${reverse ? ' reverse' : ''}`,
                }}
            >
                {items.map((box, i) => (
                    <div key={`${box.id}-${i}`} className="w-[300px] shrink-0">
                        <BlindBoxCard
                            box={box}
                            onClick={onBoxClick}
                            featured={i % boxes.length === 0}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PlazaClient({ initialBoxes }: { initialBoxes: BlindBoxData[] }) {
    const [boxes] = useState<BlindBoxData[]>(initialBoxes);
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
    };

    const handleReset = () => {
        setSelectedBox(null);
        setRevealedContent(null);
    };

    if (revealedContent) {
        return <ContentReveal content={revealedContent} onReset={handleReset} />;
    }

    const filteredBoxes = boxes.filter(box => (box.itemType || 'OFFER') === activeTab);

    // Split cards into rows (4 per row)
    const rows: BlindBoxData[][] = [];
    for (let i = 0; i < filteredBoxes.length; i += 4) {
        rows.push(filteredBoxes.slice(i, i + 4));
    }
    // Ensure at least some cards per row for the carousel effect
    // If a row has < 3 cards, pad with items from the front
    const paddedRows = rows.map(row => {
        if (row.length < 3 && filteredBoxes.length >= 3) {
            const needed = 3 - row.length;
            return [...row, ...filteredBoxes.slice(0, needed)];
        }
        return row;
    });

    return (
        <>
            {/* ═══ Tab Nav + Post Button ═══ */}
            <div className="flex items-center justify-center gap-3 py-4 px-4">
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#111827] border border-border">
                    <button
                        onClick={() => setActiveTab('OFFER')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'OFFER'
                                ? 'bg-[#00d4aa] text-[#0a0e1a] shadow-lg shadow-[#00d4aa]/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Store className="w-4 h-4" />
                        夜市 (Offers)
                    </button>
                    <button
                        onClick={() => setActiveTab('WISH')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'WISH'
                                ? 'bg-[#00d4aa] text-[#0a0e1a] shadow-lg shadow-[#00d4aa]/20'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        许愿池 (Wishes)
                    </button>
                </div>
                <Link
                    href="/creator"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#00d4aa]/20 to-[#0077b6]/20 border border-[#00d4aa]/30 text-[#00d4aa] text-xs font-medium hover:from-[#00d4aa]/30 hover:to-[#0077b6]/30 transition-all hover:shadow-lg hover:shadow-[#00d4aa]/10"
                >
                    <Plus className="w-4 h-4" />
                    去发帖
                </Link>
            </div>

            {/* ═══ Multi-Row Card Carousel ═══ */}
            <div className="pb-16 space-y-2">
                {paddedRows.length > 0 ? (
                    paddedRows.map((row, rowIdx) => (
                        <CardCarouselRow
                            key={rowIdx}
                            boxes={row}
                            speed={35 + rowIdx * 8}
                            reverse={rowIdx % 2 === 1}
                            onBoxClick={handleBoxClick}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 text-muted-foreground text-sm">
                        还没有任何人发布内容，快去抢首发吧！ ✨
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
