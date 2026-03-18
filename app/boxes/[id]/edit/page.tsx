import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AuthNav from '@/app/components/auth/AuthNav';
import MarketplaceEditorForm from '@/app/components/MarketplaceEditorForm';
import { buildSignInPath } from '@/app/lib/auth/redirects';
import { getCurrentUser } from '@/app/lib/auth/session';
import { getMarketplaceBoxDetail } from '@/features/marketplace/server/services/box.service';
import { AppError } from '@/shared/errors';

export const dynamic = 'force-dynamic';

export default async function EditBoxPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    let content;

    if (!currentUser) {
        redirect(buildSignInPath(`/boxes/${id}/edit`));
    }

    try {
        content = await getMarketplaceBoxDetail(id, currentUser);

        if (!content.isOwner || !content.hidden_content) {
            notFound();
        }
    } catch (error) {
        if (error instanceof AppError && error.status === 404) {
            notFound();
        }

        throw error;
    }

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href={`/boxes/${id}`} className="text-sm text-slate-400 transition hover:text-white">
                        返回详情
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold text-white">编辑内容</h1>
                </div>
                <AuthNav />
            </div>

            <MarketplaceEditorForm
                mode="edit"
                endpoint={`/api/boxes/${id}`}
                redirectTo="/me"
                currentStatus={content.status}
                initialValues={{
                    itemType: content.itemType,
                    title: content.title,
                    hook_description: content.hook_description,
                    hidden_content: content.hidden_content,
                    price: content.price,
                    accepts_barter: content.accepts_barter,
                    barter_demand: content.barter_demand,
                    livePlatform: content.livePlatform,
                    liveUrl: content.liveUrl,
                    liveStartsAt: content.liveStartsAt ? content.liveStartsAt.toISOString() : null,
                    liveStatus: content.liveStatus,
                }}
            />
        </main>
    );
}
