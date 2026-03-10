"use client";

import ContentReveal from '@/features/marketplace/components/ContentReveal';
import PaymentModal from '@/features/marketplace/components/PaymentModal';
import type { MarketplaceBoxDetail } from '@/features/marketplace/types/box';
import { useState } from 'react';

interface DetailPurchasePanelProps {
    content: MarketplaceBoxDetail;
}

export default function DetailPurchasePanel({ content }: DetailPurchasePanelProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    if (content.isUnlocked && content.hidden_content) {
        return <ContentReveal content={content.hidden_content} onReset={() => setIsPaymentOpen(false)} />;
    }

    if (content.isOwner) {
        return (
            <div className="rounded-3xl border border-[#00d4aa]/20 bg-[#00d4aa]/5 p-6">
                <p className="text-sm font-medium text-[#00d4aa]">你是这条内容的作者</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                    当前详情页不会自动展示隐藏内容给公共访问者。你可以在编辑页维护交付内容，在“我的内容”里执行发布、下架和删除动作。
                </p>
            </div>
        );
    }

    if (content.status !== 'PUBLISHED') {
        return (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200">
                当前内容未公开发布，暂不支持购买。
            </div>
        );
    }

    if (!content.canPurchase) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                当前内容已存在你的解锁记录或暂不可购买，可前往“我的购买”查看。
            </div>
        );
    }

    return (
        <>
            <div className="rounded-3xl border border-[#1e3a5f] bg-[#111827] p-6 shadow-[0_0_30px_rgba(0,212,170,0.06)]">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">解锁入口</p>
                <p className="mt-4 text-4xl font-black text-[#00d4aa]">¥{content.price.toFixed(2)}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                    购买会先创建订单，再进入模拟支付。支付成功后写入解锁记录，详情页根据解锁态展示隐藏内容。
                </p>
                <button
                    type="button"
                    onClick={() => setIsPaymentOpen(true)}
                    className="mt-6 w-full rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                >
                    立即购买并解锁
                </button>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onSuccess={() => {
                    setIsPaymentOpen(false);
                }}
                box={{
                    id: content.id,
                    title: content.title,
                    price: content.price,
                    accepts_barter: content.accepts_barter,
                    barter_demand: content.barter_demand,
                }}
            />
        </>
    );
}
