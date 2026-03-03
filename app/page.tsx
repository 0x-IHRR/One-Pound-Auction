import BlindBoxCard, { BlindBoxData } from './components/BlindBoxCard';
import PlazaClient from './components/PlazaClient';
import Link from 'next/link';
import { Plus, Radio, Zap } from 'lucide-react';
import prisma from '@/app/lib/prisma'; // Call DB directly in RSC

export const dynamic = 'force-dynamic'; // Ensures this page always fetches latest boxes

export default async function Home() {
  // Fetch boxes directly via Prisma in the server component for speed/simplicity
  const boxes = await prisma.auctionItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="h-screen overflow-hidden bg-transparent flex flex-col">
      {/* 🔴 Global Live Event & Timeline Banner (Apple UI style: dark, soft borders, glowing) */}
      <div className="sticky top-0 z-50 w-full bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 px-4 flex flex-col md:flex-row shadow-lg">
        {/* Left Section: Live Call to Action */}
        <div className="flex items-center justify-between md:justify-start gap-4 py-3 md:border-r border-white/10 md:pr-6 md:w-auto w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </div>
            <span className="text-white text-xs font-semibold whitespace-nowrap">
              周末线上破壁集市大乱斗...
            </span>
          </div>
          <a href="#" onClick={undefined} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-full border border-blue-500/30 transition-all font-medium flex items-center gap-1 shadow-inner backdrop-blur-md">
            <Radio className="w-3 h-3 text-red-400" />
            进入会议室
          </a>
        </div>

        {/* Middle Section: Event Calendar Horizontal Scroll */}
        <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-3 px-4 py-3">
          {/* Subtle scroll hint arrows using CSS mask or simple icons (omitted for brevity, we assume touch/trackpad) */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="bg-black/20 border border-white/5 rounded-full px-4 py-1.5 text-[11px] flex items-center gap-2 text-slate-300">
              <span className="font-bold text-white">10/26 周六 20:00</span>
              <span className="opacity-50">|</span>
              <span>点子拍卖会 (下一场)</span>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-full px-4 py-1.5 text-[11px] flex items-center gap-2 text-slate-300">
              <span className="font-bold text-slate-400">10/27 周日 15:00</span>
              <span className="opacity-50">|</span>
              <span>资源交换专场</span>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-full px-4 py-1.5 text-[11px] flex items-center gap-2 text-slate-300">
              <span className="font-bold text-slate-400">10/30 下周三 21:00</span>
              <span className="opacity-50">|</span>
              <span>创业沙龙见面会</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ Scrolling Notification Marquee (Mock Realtime) */}
      <div className="w-full bg-slate-900/60 border-b border-white/5 py-2 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee inline-block text-[10px] font-mono text-slate-400 tracking-wider">
          <span className="mx-8"><Zap className="w-3 h-3 text-emerald-400 inline mr-1" />User_39x 刚刚用 1 元买下了【小红书爆款标题生成器】</span>
          <span className="mx-8"><Zap className="w-3 h-3 text-blue-400 inline mr-1" />大佬_Null 刚刚在许愿池发布了【求前腾讯PM帮看简历】的悬赏</span>
          <span className="mx-8"><Zap className="w-3 h-3 text-purple-400 inline mr-1" />西单男孩 刚刚上架了闲置技能【帮P两张赛博朋克风头像】</span>
          {/* Duplicate for seamless looping CSS */}
          <span className="mx-8"><Zap className="w-3 h-3 text-emerald-400 inline mr-1" />User_39x 刚刚用 1 元买下了【小红书爆款标题生成器】</span>
          <span className="mx-8"><Zap className="w-3 h-3 text-blue-400 inline mr-1" />大佬_Null 刚刚在许愿池发布了【求前腾讯PM帮看简历】的悬赏</span>
          <span className="mx-8"><Zap className="w-3 h-3 text-purple-400 inline mr-1" />西单男孩 刚刚上架了闲置技能【帮P两张赛博朋克风头像】</span>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto flex flex-col items-center">
        <header className="flex flex-col items-center w-full mb-8 text-center mt-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-xl leading-tight">
            一元破壁集市<span className="text-blue-500">.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-light max-w-xl">
            一块钱，在这儿你可以买到惊艳的点子、或是悬赏你最缺的资源。
          </p>
        </header>

        {boxes.length === 0 ? (
          <div className="text-center py-20 text-slate-500 w-full mt-20">
            <p className="text-xl font-light">当前还没有任何摊位，快去抢首发吧！</p>
          </div>
        ) : (
          <PlazaClient initialBoxes={boxes} />
        )}
      </main>
    </div>
  );
}
