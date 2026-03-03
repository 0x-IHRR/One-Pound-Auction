"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
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

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert("发布失败");
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
                className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回广场
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 md:p-10"
            >
                <h1 className="text-3xl font-bold mb-2">发布新盲盒 / 许愿</h1>
                <p className="text-slate-400 mb-6">
                    挂个小卖铺，或者向全宇宙发个高悬赏的愿望。
                </p>

                {/* Animated Segmented Control */}
                <div className="flex bg-slate-800/80 p-1 rounded-xl mb-8 relative border border-slate-700/50 backdrop-blur-md">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, itemType: 'OFFER' })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${formData.itemType === 'OFFER' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        🛍️ 我要摆摊 (出售/换物)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, itemType: 'WISH' })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${formData.itemType === 'WISH' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        ⛲️ 我要许愿 (悬赏/求助)
                    </button>
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg shadow-sm"
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
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-amber-400 mb-2">
                            🔒 隐藏内容 (支付 1 元后可见)
                        </label>
                        <textarea
                            required
                            rows={6}
                            placeholder="在这里输入你的干货内容、网盘链接、或者微信号二维码链接。买家付款后将真实看到这段内容！"
                            value={formData.hidden_content}
                            onChange={e => setFormData({ ...formData, hidden_content: e.target.value })}
                            className="w-full bg-slate-900/80 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <label className="flex items-center space-x-3 text-sm font-medium text-blue-400 mb-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.accepts_barter}
                                onChange={e => setFormData({ ...formData, accepts_barter: e.target.checked })}
                                className="w-5 h-5 rounded border-blue-500 text-blue-600 focus:ring-blue-500/50 bg-slate-800"
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
                                    className="w-full bg-slate-800/50 border border-blue-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                />
                            </motion.div>
                        )}
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full flex justify-center items-center py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? '正在上架...' : (
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
