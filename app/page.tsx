import BlindBoxCard, { BlindBoxData } from './components/BlindBoxCard';
import PlazaClient from './components/PlazaClient';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import prisma from '@/app/lib/prisma'; // Call DB directly in RSC

export const dynamic = 'force-dynamic'; // Ensures this page always fetches latest boxes

export default async function Home() {
  // Fetch boxes directly via Prisma in the server component for speed/simplicity
  const boxes = await prisma.auctionItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            一元破壁集市
          </h1>
          <p className="text-slate-400">仅需 1 元，抽取一个能让你“卧槽”的灵感或认知，用一元钱买张交朋友的车票。</p>
        </div>

        <Link
          href="/creator"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          上架我的闲置Idea
        </Link>
      </header>

      {boxes.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>当前夜市空空如也，快去发第一个摊位吧！</p>
        </div>
      ) : (
        <PlazaClient initialBoxes={boxes} />
      )}
    </main>
  );
}
