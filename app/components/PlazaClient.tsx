"use client";

import { useState } from 'react';
import BlindBoxCard, { BlindBoxData } from './BlindBoxCard';
import PaymentModal from './PaymentModal';
import ContentReveal from './ContentReveal';
import { motion } from 'framer-motion';

export default function PlazaClient({ initialBoxes }: { initialBoxes: BlindBoxData[] }) {
    const [boxes, setBoxes] = useState<BlindBoxData[]>(initialBoxes);
    const [selectedBox, setSelectedBox] = useState<BlindBoxData | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [revealedContent, setRevealedContent] = useState<string | null>(null);

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

    return (
        <>
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {boxes.map((box) => (
                    <BlindBoxCard
                        key={box.id}
                        box={box}
                        onClick={handleBoxClick}
                    />
                ))}
            </motion.div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                box={selectedBox}
                onSuccess={handlePaymentSuccess}
            />
        </>
    );
}
