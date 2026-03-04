import PlazaClient from './components/PlazaClient';
import { Radio, Video, Diamond, Search } from 'lucide-react';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const activities = [
  { user: "游历", action: "的赏赐" },
  { user: "西单男孩", action: "刚刚上架了 闲置技能【即兴表演赛博朋克风头像】" },
  { user: "User_39x", action: "刚刚用 1 元买下了【小红书爆款标题生成器】" },
  { user: "大佬_Null", action: "刚刚在许愿池发布了【求前腾讯PM帮看简历】" },
  { user: "小赵同学", action: "刚刚上架了【一键生成商业计划书模板】" },
  { user: "Alex_Design", action: "刚刚用 1 元买下了【UI设计灵感资源包】" },
];

export default async function Home() {
  const boxes = await prisma.auctionItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00d4aa]/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-[200px] right-0 w-[400px] h-[400px] bg-[#0077b6]/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-[#8b5cf6]/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ═══ TopBar — Fixed Height Layout ═══ */}
        <header className="relative h-[64px] flex items-center justify-between px-4 md:px-8 bg-[#0d1220]/80 border-b border-white/5 backdrop-blur-md w-full shrink-0 gap-4">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0 z-20">
            <img src="/logo/logo_cropped.png" alt="一元破壁集市 Logo" className="h-10 md:h-[42px] w-auto object-contain opacity-90 hover:opacity-100 transition-all hover:scale-105 origin-left" />
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md z-10 px-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-[#00d4aa] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-12 py-2 border border-white/5 rounded-full leading-5 bg-white/5 text-slate-200 placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/50 focus:border-[#00d4aa]/50 focus:bg-[#0a0f1c]/80 sm:text-sm transition-all shadow-inner"
                placeholder="搜索创意、资源、服务或者悬赏..."
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <kbd className="hidden lg:inline-flex items-center border border-white/10 rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-white/5 uppercase">⌘ K</kbd>
              </div>
            </div>
          </div>

          {/* Right: Live Indicator + Meeting Button */}
          <div className="flex items-center justify-end shrink-0 gap-3 md:gap-5 z-20">
            <div className="hidden lg:flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-red-500 shrink-0">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-medium text-[13px]">正在直播</span>
              </span>
              <span className="text-muted-foreground/80 truncate text-[13px] max-w-[140px]" title="周末线上破壁集市大乱斗...">周末集市大乱斗...</span>
            </div>

            <a href="#" className="flex items-center justify-center p-2 rounded-full bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-all border border-[#00d4aa]/30 shadow-[0_0_15px_rgba(0,212,170,0.1)] shrink-0" title="进入拍卖场">
              <Video className="w-[18px] h-[18px] shrink-0" />
            </a>
          </div>
        </header>

        <main>
          {/* ═══ Hero ═══ */}
          <section className="flex flex-col items-center pt-10 pb-4 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center leading-tight">
              <span className="bg-gradient-to-r from-[#00d4aa] via-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                一元破壁集市
              </span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground text-center max-w-2xl leading-relaxed">
              一块钱，在这儿你可以买到惊艳的点子、或是悬赏你最缺的资源
            </p>
          </section>

          {/* ═══ Activity Ticker ═══ */}
          <div className="relative overflow-hidden py-3 mx-4 my-1">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10" />
            <div className="flex animate-ticker whitespace-nowrap">
              {[...activities, ...activities].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mx-6 text-sm">
                  <Diamond className="w-3 h-3 text-[#00d4aa] shrink-0" />
                  <span className="text-[#00d4aa] font-medium">{item.user}</span>
                  <span className="text-muted-foreground">{item.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ PlazaClient (tabs + cards) ═══ */}
          <PlazaClient initialBoxes={boxes} />
        </main>
      </div>

      {/* Decorative star */}
      <div className="fixed right-20 bottom-8 z-40 pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M16 0L20 12L32 16L20 20L16 32L12 20L0 16L12 12L16 0Z" fill="#f59e0b" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
