import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { isAuthGuardError, requireAdmin } from "@/app/lib/auth/guards";
import { buildSignInPath } from "@/app/lib/auth/redirects";

export default async function AdminPage() {
  let user;

  try {
    user = await requireAdmin();
  } catch (error) {
    if (isAuthGuardError(error)) {
      if (error.code === "UNAUTHENTICATED") {
        redirect(buildSignInPath("/admin"));
      }

      redirect("/me?denied=admin");
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[#00d4aa]" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">管理后台占位页</h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-400">
          当前分支只验证 ADMIN 角色拦截链路，不绑定具体后台业务。已登录管理员：
          <span className="ml-2 text-[#00d4aa]">{user.email}</span>
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
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
    </main>
  );
}
