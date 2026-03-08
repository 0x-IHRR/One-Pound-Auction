"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, QrCode, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import type { BlindBoxData } from '@/features/marketplace/components/BlindBoxCard';
import type { PurchaseBoxResult } from '@/features/marketplace/types/box';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (content: string) => void;
    box: BlindBoxData | null;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, box }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!box) return null;

    const handleSimulatePayment = async () => {
        setIsProcessing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await fetch(`/api/boxes/${box.id}/purchase`, {
                method: 'POST',
            });
            const payload = await res.json() as ApiSuccess<PurchaseBoxResult> | ApiFailure;

            if (res.ok && payload.success) {
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
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isProcessing ? onClose : undefined}
                        className="fixed inset-0 bg-[#0d1220]/80 backdrop-blur-md z-40"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-6"
                    >
                        <div className="relative bg-[#111827] border border-[#1e3a5f] shadow-[0_0_30px_rgba(0,212,170,0.1)] rounded-2xl p-6 overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[100px] bg-[#00d4aa]/5 blur-[50px] pointer-events-none" />

                            {!isProcessing && (
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-slate-400 hover:text-[#00d4aa] transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            <div className="text-center mb-6 relative z-10">
                                <h2 className="text-2xl font-bold mb-1 text-slate-100">支付解锁</h2>
                                <p className="text-sm text-slate-400 max-w-[250px] mx-auto truncate">
                                    {box.title}
                                </p>
                            </div>

                            <div className="bg-[#0d1220]/50 rounded-xl p-6 flex flex-col items-center justify-center border border-white/5 mb-6 relative z-10">
                                {isProcessing ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Loader2 className="w-16 h-16 text-[#00d4aa] animate-spin mb-4" />
                                        <p className="text-sm text-[#00d4aa]/80 font-medium">正在验证并连接节点...</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="bg-white/90 p-2 rounded-lg mb-4 ring-1 ring-white/20">
                                            <QrCode className="w-32 h-32 text-slate-900" />
                                        </div>
                                        <div className="flex items-center text-xs text-[#00d4aa]/80">
                                            <ShieldCheck className="w-4 h-4 mr-1" />
                                            支付网关已加密
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <span className="text-slate-400 text-sm">需支付</span>
                                <span className="text-3xl font-black text-[#00d4aa] tracking-tight drop-shadow-[0_0_10px_rgba(0,212,170,0.3)]">
                                    <span className="text-xl mr-1 font-medium">¥</span>{box.price.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSimulatePayment}
                                disabled={isProcessing}
                                className="relative z-10 w-full py-4 rounded-xl bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 font-bold text-lg shadow-[0_0_15px_rgba(0,212,170,0.1)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isProcessing ? '建立连接中...' : '支付 1 元解锁内容'}
                            </button>

                            {box.accepts_barter && (
                                <div className="mt-5 pt-5 border-t border-[#1e3a5f] relative z-10">
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">摊主接受以物易物，换取：</p>
                                    <p className="text-sm text-[#00d4aa]/90 font-medium mb-4 bg-white/5 p-3 rounded-lg border border-white/5">&ldquo;{box.barter_demand}&rdquo;</p>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => alert('交换请求已记录！请在群里@摊主进行后续交流。')}
                                        className="w-full py-3 rounded-xl bg-[#0d1220] hover:bg-white/5 text-[#00d4aa]/80 font-bold text-sm border border-[#00d4aa]/20 transition-all hover:border-[#00d4aa]/50"
                                    >
                                        🤝 我有这个，我想换！
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
