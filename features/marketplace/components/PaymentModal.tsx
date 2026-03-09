'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, QrCode, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

import type { MarketplaceBoxDetail, PurchaseBoxResult } from '@/features/marketplace/types/box';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

type PaymentBoxData = Pick<
    MarketplaceBoxDetail,
    'id' | 'title' | 'price' | 'accepts_barter' | 'barter_demand'
>;

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (content: string) => void;
    box: PaymentBoxData | null;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, box }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!box) {
        return null;
    }

    const handleSimulatePayment = async () => {
        setIsProcessing(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const response = await fetch(`/api/boxes/${box.id}/purchase`, {
                method: 'POST',
            });
            const payload = (await response.json()) as ApiSuccess<PurchaseBoxResult> | ApiFailure;

            if (response.ok && payload.success) {
                setIsProcessing(false);
                onSuccess(payload.data.hidden_content);
            } else {
                throw new Error(getApiErrorMessage(payload, '支付失败，请重试。'));
            }
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            alert(error instanceof Error ? error.message : '支付模拟失败，请重试。');
        }
    };

    return (
        <AnimatePresence>
            {isOpen ? (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isProcessing ? undefined : onClose}
                        className="fixed inset-0 z-40 bg-[#0d1220]/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-6"
                    >
                        <div className="relative overflow-hidden rounded-2xl border border-[#1e3a5f] bg-[#111827] p-6 shadow-[0_0_30px_rgba(0,212,170,0.1)]">
                            <div className="pointer-events-none absolute left-1/2 top-0 h-[100px] w-full -translate-x-1/2 bg-[#00d4aa]/5 blur-[50px]" />

                            {!isProcessing ? (
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 z-10 text-slate-400 transition-colors hover:text-[#00d4aa]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            ) : null}

                            <div className="relative z-10 mb-6 text-center">
                                <h2 className="mb-1 text-2xl font-bold text-slate-100">支付解锁</h2>
                                <p className="mx-auto max-w-[250px] truncate text-sm text-slate-400">{box.title}</p>
                            </div>

                            <div className="relative z-10 mb-6 flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0d1220]/50 p-6">
                                {isProcessing ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Loader2 className="mb-4 h-16 w-16 animate-spin text-[#00d4aa]" />
                                        <p className="text-sm font-medium text-[#00d4aa]/80">正在验证并连接节点...</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="mb-4 rounded-lg bg-white/90 p-2 ring-1 ring-white/20">
                                            <QrCode className="h-32 w-32 text-slate-900" />
                                        </div>
                                        <div className="flex items-center text-xs text-[#00d4aa]/80">
                                            <ShieldCheck className="mr-1 h-4 w-4" />
                                            支付网关已加密
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative z-10 mb-6 flex items-center justify-between">
                                <span className="text-sm text-slate-400">需支付</span>
                                <span className="text-3xl font-black tracking-tight text-[#00d4aa] drop-shadow-[0_0_10px_rgba(0,212,170,0.3)]">
                                    <span className="mr-1 text-xl font-medium">¥</span>
                                    {box.price.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSimulatePayment}
                                disabled={isProcessing}
                                className="relative z-10 w-full rounded-xl border border-[#00d4aa]/30 bg-[#00d4aa]/10 py-4 text-lg font-bold text-[#00d4aa] shadow-[0_0_15px_rgba(0,212,170,0.1)] transition-all hover:scale-[1.02] hover:bg-[#00d4aa]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                            >
                                {isProcessing ? '建立连接中...' : `支付 ${box.price.toFixed(2)} 元解锁内容`}
                            </button>

                            {box.accepts_barter ? (
                                <div className="relative z-10 mt-5 border-t border-[#1e3a5f] pt-5">
                                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">摊主接受以物易物，换取：</p>
                                    <p className="mb-4 rounded-lg border border-white/5 bg-white/5 p-3 text-sm font-medium text-[#00d4aa]/90">
                                        &ldquo;{box.barter_demand}&rdquo;
                                    </p>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => alert('交换请求已记录！请在群里@摊主进行后续交流。')}
                                        className="w-full rounded-xl border border-[#00d4aa]/20 bg-[#0d1220] py-3 text-sm font-bold text-[#00d4aa]/80 transition-all hover:border-[#00d4aa]/50 hover:bg-white/5"
                                    >
                                        🤝 我有这个，我想换！
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    );
}
