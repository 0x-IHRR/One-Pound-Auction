import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

import AdminUnlistButton from '@/app/components/AdminUnlistButton';
import StatusBadge from '@/app/components/StatusBadge';
import { isAuthGuardError, requireAdmin } from '@/app/lib/auth/guards';
import { buildSignInPath } from '@/app/lib/auth/redirects';
import { listAdminMarketplaceBoxes } from '@/features/marketplace/server/services/box.service';
import { listAdminAbnormalOrders, listAdminOrders } from '@/features/order-payment/server/services/order.service';

function renderOrderStatus(status: string) {
    const styles: Record<string, string> = {
        PENDING: 'border-white/10 bg-white/5 text-slate-300',
        PAID: 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]',
        FAILED: 'border-red-500/30 bg-red-500/10 text-red-300',
        CANCELLED: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.PENDING}`}>
            {status}
        </span>
    );
}

function renderPaymentStatus(status: string | null) {
    if (!status) {
        return <span className="text-xs text-slate-500">无支付</span>;
    }

    const styles: Record<string, string> = {
        INITIATED: 'border-white/10 bg-white/5 text-slate-300',
        SUCCEEDED: 'border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa]',
        FAILED: 'border-red-500/30 bg-red-500/10 text-red-300',
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.INITIATED}`}>
            {status}
        </span>
    );
}

export default async function AdminPage() {
    let user;

    try {
        user = await requireAdmin();
    } catch (error) {
        if (isAuthGuardError(error)) {
            if (error.code === 'UNAUTHENTICATED') {
                redirect(buildSignInPath('/admin'));
            }

            redirect('/me?denied=admin');
        }

        throw error;
    }

    const [contents, orders, abnormalOrders] = await Promise.all([
        listAdminMarketplaceBoxes(),
        listAdminOrders(),
        listAdminAbnormalOrders(),
    ]);

    return (
        <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8 text-[#00d4aa]" />
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">ADMIN</p>
                                <h1 className="mt-2 text-3xl font-black">最小后台</h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/me"
                                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
                            >
                                返回个人中心
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/20"
                            >
                                查看前台
                            </Link>
                        </div>
                    </div>

                    <p className="mt-6 text-sm leading-6 text-slate-400">
                        当前管理员：
                        <span className="ml-2 text-[#00d4aa]">{user.email}</span>
                    </p>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">CONTENT</p>
                            <h2 className="mt-2 text-2xl font-black">内容列表</h2>
                        </div>
                        <p className="text-sm text-slate-400">查看标题、作者、状态、发布时间，并执行下架。</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        {contents.map((content) => (
                            <article
                                key={content.id}
                                className="grid gap-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto]"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <StatusBadge status={content.status} />
                                        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                            {content.itemType === 'OFFER' ? '夜市' : '许愿池'}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-white">{content.title}</h3>
                                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                        <span>作者 {content.authorName ?? content.authorEmail ?? '匿名历史内容'}</span>
                                        <span>销量 {content.sales_count}</span>
                                        <span>
                                            发布时间 {content.publishedAt ? new Date(content.publishedAt).toLocaleString('zh-CN') : '未发布'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <AdminUnlistButton boxId={content.id} disabled={content.status !== 'PUBLISHED'} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">ORDERS</p>
                            <h2 className="mt-2 text-2xl font-black">订单列表</h2>
                        </div>
                        <p className="text-sm text-slate-400">查看买家、内容、订单状态、支付状态、金额和时间。</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        {orders.map((order) => (
                            <article
                                key={order.orderId}
                                className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    {renderOrderStatus(order.orderStatus)}
                                    {renderPaymentStatus(order.paymentStatus)}
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-white">{order.item.title}</h3>
                                <div className="mt-4 grid gap-4 text-sm text-slate-400 md:grid-cols-5">
                                    <span>买家 {order.buyerName ?? order.buyerEmail}</span>
                                    <span>金额 ¥{order.amount.toFixed(2)}</span>
                                    <span>支付时间 {order.paidAt ? new Date(order.paidAt).toLocaleString('zh-CN') : '未支付'}</span>
                                    <span>解锁时间 {order.unlockedAt ? new Date(order.unlockedAt).toLocaleString('zh-CN') : '未解锁'}</span>
                                    <span>订单号 {order.orderId}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">EXCEPTION</p>
                        <h2 className="mt-2 text-2xl font-black">异常订单</h2>
                        <p className="mt-2 text-sm text-slate-400">当前将 `PENDING / FAILED / CANCELLED` 视为异常订单。</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        {abnormalOrders.length > 0 ? (
                            abnormalOrders.map((order) => (
                                <article
                                    key={order.orderId}
                                    className="rounded-[28px] border border-red-500/15 bg-red-500/5 p-5"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        {renderOrderStatus(order.orderStatus)}
                                        {renderPaymentStatus(order.paymentStatus)}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-white">{order.item.title}</h3>
                                    <p className="mt-3 text-sm text-slate-300">买家：{order.buyerName ?? order.buyerEmail}</p>
                                    <p className="mt-2 text-sm text-slate-300">订单号：{order.orderId}</p>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-slate-400">
                                当前没有异常订单。
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
