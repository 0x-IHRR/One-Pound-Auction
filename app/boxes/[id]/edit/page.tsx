import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarketplaceEditorForm from '../../../components/MarketplaceEditorForm';
import SessionControls from '../../../components/SessionControls';
import { getCurrentUser } from '../../../lib/current-user';
import { isMarketplaceError } from '../../../../features/marketplace/errors';
import { marketplaceService } from '../../../../features/marketplace/service';

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
        return (
            <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-8">
                <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d1220]/80 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
                            返回广场
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-white">编辑内容</h1>
                    </div>
                    <SessionControls currentUser={currentUser} />
                </div>
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                    <p className="text-xl font-semibold text-white">请先登录再编辑内容</p>
                </div>
            </main>
        );
    }

    try {
        content = await marketplaceService.getContentDetail(id, currentUser);

        if (!content.isOwner || !content.hidden_content) {
            notFound();
        }
    } catch (error) {
        if (isMarketplaceError(error) && error.statusCode === 404) {
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
                <SessionControls currentUser={currentUser} />
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
                }}
            />
        </main>
    );
}
