import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

import ProblemSubmissionForm from './ProblemSubmissionForm';

export const metadata = {
    title: '免费问题收集器 | 一元破壁集市',
    description: '把你现在卡住的问题发给我，我免费挑真实问题来解决。',
};

const principles = [
    '不用判断它是不是技术问题',
    '不用包装成成熟需求',
    '越真实、越具体、越值得提交',
];

export default function AskPage() {
    return (
        <main className="min-h-screen bg-[#080d16] text-slate-100">
            <section className="relative min-h-screen overflow-hidden px-5 py-6 md:px-10">
                <Image
                    src="/logo/logo_dark_bg.png"
                    alt=""
                    width={520}
                    height={520}
                    priority
                    className="pointer-events-none absolute right-[-120px] top-[-80px] h-[360px] w-[360px] object-contain opacity-20 md:right-[-80px] md:top-[-120px] md:h-[520px] md:w-[520px]"
                />

                <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.78fr)] lg:items-center">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            回到一元破壁集市
                        </Link>

                        <p className="mt-16 text-sm uppercase tracking-[0.28em] text-[#00d4aa]">Problem Collector</p>
                        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-white md:text-7xl">
                            把卡住的问题丢给我
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                            我会免费挑真实、具体、有代表性的问题来解决。你不用先判断它能不能被代码解决，只要把当下最烦的卡点说清楚。
                        </p>

                        <div className="mt-10 grid gap-3">
                            {principles.map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="h-px w-10 bg-[#00d4aa]" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-wrap items-center gap-4">
                            <a
                                href="#submit-problem"
                                className="inline-flex items-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                            >
                                现在提交
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                                <ShieldCheck className="h-4 w-4 text-[#00d4aa]" />
                                联系方式、补充背景和相关链接不会公开展示
                            </div>
                        </div>
                    </div>

                    <div id="submit-problem" className="scroll-mt-6">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Submit</p>
                                <h2 className="mt-2 text-2xl font-bold text-white">问题入口</h2>
                            </div>
                            <p className="hidden max-w-[220px] text-right text-xs leading-5 text-slate-500 md:block">
                                提交后会公开成许愿池卡片，我在后台继续处理。
                            </p>
                        </div>
                        <ProblemSubmissionForm />
                    </div>
                </div>
            </section>
        </main>
    );
}
