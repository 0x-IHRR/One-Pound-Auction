import Link from 'next/link';
import { redirect } from 'next/navigation';

import { isAuthGuardError, requireUser } from '@/app/lib/auth/guards';
import { buildSignInPath } from '@/app/lib/auth/redirects';
import { listMyPaidOrders } from '@/features/order-payment/server/services/order.service';

export default async function MyPurchasesPage() {
    let user;

    try {
        user = await requireUser();
    } catch (error) {
        if (isAuthGuardError(error)) {
            redirect(buildSignInPath('/me/purchases'));
        }

        throw error;
    }

    const purchases = await listMyPaidOrders(user);

    return (
        <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">PURCHASES</p>
                        <h1 className="mt-2 text-3xl font-black">我的购买</h1>
                        <p className="mt-2 text-sm text-slate-400">这里展示你已支付并完成解锁的内容。</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/me"
                            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
                        >
                            返回个人中心
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                        >
                            返回广场
                        </Link>
                    </div>
                </div>

                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    {purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map((purchase) => (
                                <article
                                    key={purchase.orderId}
                                    className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">{purchase.item.title}</h2>
                                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                                                {purchase.item.hook_description}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/boxes/${purchase.item.id}`}
                                            className="inline-flex rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition hover:bg-[#00d4aa]/20"
                                        >
                                            查看已解锁内容
                                        </Link>
                                    </div>

                                    <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">订单状态</p>
                                            <p className="mt-2 text-white">{purchase.orderStatus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">支付状态</p>
                                            <p className="mt-2 text-white">{purchase.paymentStatus ?? '无'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">支付金额</p>
                                            <p className="mt-2 text-white">¥{purchase.amount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">解锁时间</p>
                                            <p className="mt-2 text-white">
                                                {purchase.unlockedAt ? new Date(purchase.unlockedAt).toLocaleString('zh-CN') : '未解锁'}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                            <p className="text-lg font-semibold text-white">还没有已完成的购买记录</p>
                            <p className="mt-3 text-sm text-slate-400">先去广场挑一个内容下单，支付成功后会出现在这里。</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
