import PlazaClient from './components/PlazaClient';
import { Radio, Video, Diamond } from 'lucide-react';
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
        {/* ═══ TopBar — Full width spread layout ═══ */}
        <header className="grid grid-cols-2 md:grid-cols-3 items-center px-6 md:px-12 py-3 bg-[#0d1220]/80 border-b border-border backdrop-blur-md w-full">
          {/* Left: Logo */}
          <div className="flex justify-start items-center">
            <img src="/logo/logo.png" alt="一元破壁集市 Logo" className="h-10 md:h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          </div>

          {/* Center: Live Indicator (hidden on small screens) */}
          <div className="hidden md:flex justify-center items-center gap-2.5 text-sm">
            <span className="flex items-center gap-1.5 text-red-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-medium">正在直播：</span>
            </span>
            <span className="text-muted-foreground whitespace-nowrap">周末线上破壁集市大乱斗...</span>
          </div>

          {/* Right: Meeting Button */}
          <div className="flex justify-end">
            <a href="#" className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1a2744] text-[#00d4aa] text-sm font-medium hover:bg-[#1e3050] transition-colors border border-[#1e3a5f]">
              <Video className="w-4 h-4" />
              进入拍卖场
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
