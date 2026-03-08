import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";

import { signOutAction } from "@/app/lib/auth/actions";
import { isAuthGuardError, requireUser } from "@/app/lib/auth/guards";
import { buildSignInPath } from "@/app/lib/auth/redirects";

type MePageProps = {
  searchParams: Promise<{
    denied?: string;
  }>;
};

export default async function MePage({ searchParams }: MePageProps) {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    if (isAuthGuardError(error)) {
      redirect(buildSignInPath("/me"));
    }

    throw error;
  }

  const { denied } = await searchParams;

  return (
    <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">PROFILE</p>
            <h1 className="mt-2 text-3xl font-black">个人中心</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
          >
            返回广场
          </Link>
        </div>

        {denied === "admin" ? (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            当前账号不是管理员，后台入口已拦截。
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" ? (
              <ShieldCheck className="h-8 w-8 text-[#00d4aa]" />
            ) : (
              <UserCircle2 className="h-8 w-8 text-[#00d4aa]" />
            )}
            <div>
              <h2 className="text-xl font-semibold">{user.name ?? "未命名用户"}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">角色</p>
              <p className="mt-3 text-lg font-semibold text-[#00d4aa]">{user.role}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">创作权限</p>
              <p className="mt-3 text-lg font-semibold text-white">已解锁 /creator</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/creator"
              className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-2 text-sm font-medium text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/20"
            >
              去发布内容
            </Link>
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
              >
                进入管理后台
              </Link>
            ) : null}
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-rose-400/40 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
