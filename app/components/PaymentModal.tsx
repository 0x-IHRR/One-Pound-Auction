"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { BlindBoxData } from "./BlindBoxCard";

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
            // Create a mock artificial delay for payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call our API to increment sales and get the content
            const res = await fetch(`/api/boxes/${box.id}/purchase`, {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                setIsProcessing(false);
                onSuccess(data.hidden_content);
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            alert("支付模拟失败，请重试。");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isProcessing ? onClose : undefined}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-6"
                    >
                        <div className="glass-panel relative bg-slate-900 border border-slate-700/50 shadow-2xl p-6">
                            {!isProcessing && (
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-1">支付解锁</h2>
                                <p className="text-sm text-slate-400 max-w-[250px] mx-auto truncate">
                                    {box.title}
                                </p>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-700/50 mb-6">
                                {isProcessing ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                                        <p className="text-sm text-blue-400 font-medium">正在验证支付...</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="bg-white p-2 rounded-lg mb-4">
                                            {/* Placeholder for real QR Code later */}
                                            <QrCode className="w-32 h-32 text-slate-900" />
                                        </div>
                                        <div className="flex items-center text-xs text-green-400">
                                            <ShieldCheck className="w-4 h-4 mr-1" />
                                            支持微信/支付宝安全支付
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-400 text-sm">需支付</span>
                                <span className="text-3xl font-bold text-amber-400">
                                    <span className="text-xl mr-1">¥</span>{box.price.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleSimulatePayment}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isProcessing ? "处理中..." : "支付 1 元支持一下"}
                            </button>

                            {box.accepts_barter && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <p className="text-sm text-slate-400 mb-2">摊主接受以物易物，换取：</p>
                                    <p className="text-sm text-blue-300 font-medium mb-3 bg-blue-900/20 p-2 rounded border border-blue-500/20">"{box.barter_demand}"</p>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => alert("交换请求已记录！请在群里@摊主进行后续交流。")}
                                        className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-sm border border-blue-500/30 transition-all hover:border-blue-500/50"
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
