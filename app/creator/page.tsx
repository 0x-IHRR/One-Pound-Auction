"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

import type { CreateBoxInput } from '@/features/marketplace/types/box';
import type { ApiFailure, ApiSuccess } from '@/shared/http';
import { getApiErrorMessage } from '@/shared/utils/get-api-error-message';

type CreatorFormData = Omit<CreateBoxInput, 'price' | 'barter_demand'> & {
    barter_demand: string;
};

export default function CreatorPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreatorFormData>({
        itemType: 'OFFER', // 'OFFER' or 'WISH'
        title: '',
        hook_description: '',
        hidden_content: '',
        accepts_barter: false,
        barter_demand: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/boxes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const payload = await res.json() as ApiSuccess<unknown> | ApiFailure;

            if (res.ok && payload.success) {
                router.push('/');
                router.refresh();
            } else {
                alert(getApiErrorMessage(payload, '发布失败'));
            }
        } catch (error) {
            console.error(error);
            alert("发布发生错误");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center text-muted-foreground hover:text-[#00d4aa] mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回广场
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#111827] border border-[#1e3a5f] shadow-[0_0_30px_rgba(0,212,170,0.1)] rounded-2xl p-8 md:p-10 overflow-hidden"
            >
                {/* Decorative ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[100px] bg-[#00d4aa]/5 blur-[50px] pointer-events-none" />

                <h1 className="text-3xl font-bold mb-2">发布新盲盒 / 许愿</h1>
                <p className="text-slate-400 mb-6">
                    挂个小卖铺，或者向全宇宙发个高悬赏的愿望。
                </p>

                {/* Animated Segmented Control */}
                <div className="flex bg-[#0d1220]/80 p-1 rounded-xl mb-8 relative border border-[#1e3a5f] backdrop-blur-md">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, itemType: 'OFFER' })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${formData.itemType === 'OFFER' ? 'text-[#00d4aa] drop-shadow-[0_0_8px_rgba(0,212,170,0.8)]' : 'text-slate-400 hover:text-[#00d4aa]/70'}`}
                    >
                        🛍️ 我要摆摊 (出售/换物)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, itemType: 'WISH' })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${formData.itemType === 'WISH' ? 'text-[#00d4aa] drop-shadow-[0_0_8px_rgba(0,212,170,0.8)]' : 'text-slate-400 hover:text-[#00d4aa]/70'}`}
                    >
                        ⛲️ 我要许愿 (悬赏/求助)
                    </button>
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-lg shadow-[0_0_15px_rgba(0,212,170,0.15)]"
                        initial={false}
                        animate={{
                            left: formData.itemType === 'OFFER' ? '4px' : 'calc(50%)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ zIndex: 0 }}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            盲盒标题 (最吸引眼球的名字)
                        </label>
                        <input
                            required
                            type="text"
                            maxLength={50}
                            placeholder="例如：一个让我上周赚出饭钱的副业点子"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-[#0d1220] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa]/50 transition-all placeholder:text-slate-600 relative z-10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            外包装描述 (Hook，最多 100 字)
                        </label>
                        <textarea
                            required
                            maxLength={150}
                            rows={2}
                            placeholder="用来勾起大家好奇心的一两句话..."
                            value={formData.hook_description}
                            onChange={e => setFormData({ ...formData, hook_description: e.target.value })}
                            className="w-full bg-[#0d1220] border border-[#1e3a5f] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa]/50 transition-all placeholder:text-slate-600 relative z-10"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#1e3a5f] relative z-10">
                        <label className="block text-sm font-medium text-[#00d4aa] mb-2 drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]">
                            🔒 隐藏内容 (支付 1 元后可见)
                        </label>
                        <textarea
                            required
                            rows={6}
                            placeholder="在这里输入你的干货内容、网盘链接、或者微信号二维码链接。买家付款后将真实看到这段内容！"
                            value={formData.hidden_content}
                            onChange={e => setFormData({ ...formData, hidden_content: e.target.value })}
                            className="w-full bg-[#0d1220] border border-[#00d4aa]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#1e3a5f] relative z-10">
                        <label className="flex items-center space-x-3 text-sm font-medium text-[#00d4aa]/80 mb-3 cursor-pointer hover:text-[#00d4aa] transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.accepts_barter}
                                onChange={e => setFormData({ ...formData, accepts_barter: e.target.checked })}
                                className="w-5 h-5 rounded border-[#00d4aa]/50 text-[#00d4aa] focus:ring-[#00d4aa]/50 bg-[#0d1220] accent-[#00d4aa]"
                            />
                            <span>开启「以物易物」/ 悬赏交换</span>
                        </label>

                        {formData.accepts_barter && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3"
                            >
                                <input
                                    type="text"
                                    placeholder="输入你想换到的东西，例如：求一份运营资料、帮我P两张图等..."
                                    value={formData.barter_demand}
                                    onChange={e => setFormData({ ...formData, barter_demand: e.target.value })}
                                    className="w-full bg-[#0d1220] border border-[#00d4aa]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] transition-all text-sm placeholder:text-slate-600"
                                />
                            </motion.div>
                        )}
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="relative z-10 w-full flex justify-center items-center py-4 rounded-xl bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 font-bold text-lg shadow-[0_0_15px_rgba(0,212,170,0.1)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? '正在传输数据到节点...' : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                立即上架 (基础标价 1 元)
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
