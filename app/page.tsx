import PlazaClient from './components/PlazaClient';
import Link from 'next/link';
import { Radio, Video, Diamond } from 'lucide-react';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

// Mock activity data — will be replaced with real ActivityLog queries later
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
      {/* Background subtle ambient blurs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00d4aa]/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-[200px] right-0 w-[400px] h-[400px] bg-[#0077b6]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ═══ Top Bar ═══ */}
        <header className="flex items-center justify-between px-4 py-2.5 bg-[#0d1220] border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#00d4aa]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00d4aa]">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-red-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-medium">正在直播：</span>
              </span>
              <span className="text-muted-foreground">周末线上破壁集市大乱斗...</span>
            </div>
          </div>
          <a href="#" className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1a2744] text-[#00d4aa] text-sm font-medium hover:bg-[#1e3050] transition-colors border border-[#1e3a5f]">
            <Video className="w-4 h-4" />
            进入会议室
          </a>
        </header>

        <main>
          {/* ═══ Hero Section ═══ */}
          <section className="flex flex-col items-center pt-10 pb-6 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center text-balance leading-tight">
              <span className="bg-gradient-to-r from-[#00d4aa] via-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                一元破壁集市
              </span>
              <span className="text-foreground">。</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground text-center max-w-2xl text-balance leading-relaxed">
              一块钱，在这儿你可以买到惊艳的点子、或是悬赏你最缺的资源。
            </p>
          </section>

          {/* ═══ Activity Ticker ═══ */}
          <div className="relative overflow-hidden py-3 mx-4 my-2">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10" />
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

          {/* ═══ Tab Navigation + Product Grid (Client Component) ═══ */}
          {boxes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">当前还没有任何摊位，快去抢首发吧！</p>
            </div>
          ) : (
            <PlazaClient initialBoxes={boxes} />
          )}
        </main>
      </div>

      {/* ═══ Floating Action Button ═══ */}
      <Link href="/creator" className="fixed right-6 bottom-8 z-50 flex flex-col items-center gap-2 group">
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#0077b6] shadow-lg shadow-[#00d4aa]/25 flex items-center justify-center hover:shadow-[#00d4aa]/40 hover:scale-105 transition-all">
          <svg className="w-6 h-6 text-[#0a0e1a]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-xs text-center text-muted-foreground leading-tight whitespace-nowrap">
          去发帖<br />/ 摆个<br />小摊
        </span>
      </Link>

      {/* Bottom decorative star */}
      <div className="fixed right-20 bottom-8 z-40 pointer-events-none">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 0L20 12L32 16L20 20L16 32L12 20L0 16L12 12L16 0Z" fill="#f59e0b" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
