'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface ContentRevealProps {
    content: string | null;
    onReset: () => void;
}

export default function ContentReveal({ content, onReset }: ContentRevealProps) {
    if (!content) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-8 w-full max-w-2xl"
        >
            <div className="glass-panel relative overflow-hidden border-green-500/20 p-8 shadow-green-500/5">
                <div className="mb-8 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="mr-4 rounded-full bg-green-500/20 p-3 text-green-400"
                    >
                        <CheckCircle2 className="h-8 w-8" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">支付成功！</h2>
                        <p className="text-sm text-green-400">盲盒已为您开启</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -left-2 -top-4 select-none font-serif text-6xl leading-none text-slate-800">
                        &ldquo;
                    </div>

                    <div className="prose prose-invert relative z-10 max-w-none rounded-xl border border-slate-700/50 bg-slate-800/50 p-8">
                        {content.split('\n').map((line, index) => {
                            if (line.startsWith('http')) {
                                return (
                                    <p key={index}>
                                        <a
                                            href={line}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-blue-400 underline hover:text-blue-300"
                                        >
                                            点击访问内容链接
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </a>
                                    </p>
                                );
                            }

                            return (
                                <p key={index} className="text-lg leading-relaxed text-slate-200">
                                    {line}
                                </p>
                            );
                        })}
                    </div>

                    <div className="absolute -bottom-10 -right-2 rotate-180 select-none font-serif text-6xl leading-none text-slate-800">
                        &rdquo;
                    </div>
                </div>

                <div className="relative z-10 mt-10 text-center">
                    <button
                        onClick={onReset}
                        className="text-slate-400 underline decoration-slate-600 underline-offset-4 transition-colors hover:text-white"
                    >
                        返回广场，看看其他盲盒
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
