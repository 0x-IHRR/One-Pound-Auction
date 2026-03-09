import Link from 'next/link';

import MarketplaceEditorForm from '@/app/components/MarketplaceEditorForm';
import AuthNav from '@/app/components/auth/AuthNav';
import { buildSignInPath } from '@/app/lib/auth/redirects';
import { getCurrentUser } from '@/app/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
    const currentUser = await getCurrentUser();

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                        返回广场
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold text-white">内容发布台</h1>
                </div>
                <AuthNav />
            </div>

            {currentUser ? (
                <MarketplaceEditorForm mode="create" endpoint="/api/boxes" redirectTo="/me" />
            ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                    <p className="text-xl font-semibold text-white">先登录，再创建你的内容</p>
                    <p className="mt-3 text-sm text-slate-400">
                        当前内容会直接写入你登录态中的邮箱和昵称作为轻量归属信息。
                    </p>
                    <Link
                        href={buildSignInPath('/creator')}
                        className="mt-6 inline-flex rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-5 py-3 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                    >
                        去登录
                    </Link>
                </div>
            )}
        </main>
    );
}
