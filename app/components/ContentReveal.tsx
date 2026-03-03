"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface ContentRevealProps {
    content: string | null;
    onReset: () => void;
}

export default function ContentReveal({ content, onReset }: ContentRevealProps) {
    if (!content) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-8 w-full"
        >
            <div className="glass-panel overflow-hidden border-green-500/20 shadow-green-500/5 p-8 relative">
                <div className="flex items-center justify-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="bg-green-500/20 text-green-400 p-3 rounded-full mr-4"
                    >
                        <CheckCircle2 className="w-8 h-8" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">支付成功！</h2>
                        <p className="text-green-400 text-sm">盲盒已为您开启</p>
                    </div>
                </div>

                <div className="relative">
                    {/* Decorative quotes */}
                    <div className="absolute -top-4 -left-2 text-6xl text-slate-800 font-serif leading-none select-none">"</div>

                    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 prose prose-invert max-w-none relative z-10">
                        {/* Extremely simple markdown/link rendering for MVP */}
                        {content.split('\n').map((line, i) => {
                            if (line.startsWith('http')) {
                                return (
                                    <p key={i}>
                                        <a href={line} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline inline-flex items-center">
                                            点击访问内容链接 <ChevronRight className="w-4 h-4 ml-1" />
                                        </a>
                                    </p>
                                );
                            }
                            return <p key={i} className="text-slate-200 leading-relaxed text-lg">{line}</p>;
                        })}
                    </div>

                    <div className="absolute -bottom-10 -right-2 text-6xl text-slate-800 font-serif leading-none select-none rotate-180">"</div>
                </div>

                <div className="mt-10 text-center relative z-10">
                    <button
                        onClick={onReset}
                        className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4 transition-colors"
                    >
                        返回广场，看看其他盲盒
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
