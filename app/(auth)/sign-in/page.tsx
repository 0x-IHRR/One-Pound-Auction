import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { signInWithGoogleAction } from "@/app/lib/auth/actions";
import { normalizeRedirectPath } from "@/app/lib/auth/redirects";
import { getCurrentUser } from "@/app/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const nextPath = normalizeRedirectPath(next);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] px-6 py-12 text-slate-100">
      <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-[#00d4aa]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回广场
        </Link>

        <section className="rounded-3xl border border-white/10 bg-[#111827]/90 p-8 shadow-[0_0_40px_rgba(0,212,170,0.08)] backdrop-blur">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#00d4aa]/80">AUTH USER</p>
          <h1 className="text-3xl font-black text-white">先确认你是谁，再进入创作区</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            第一阶段只开放 Google 登录。登录后会保留会话，并按邮箱白名单判断是否拥有 ADMIN 权限。
          </p>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
            登录成功后将跳转到：
            <span className="ml-2 rounded-full bg-[#00d4aa]/10 px-2 py-1 text-xs text-[#00d4aa]">{nextPath}</span>
          </div>

          <form action={signInWithGoogleAction} className="mt-8">
            <input type="hidden" name="next" value={nextPath} />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-4 text-sm font-semibold text-[#00d4aa] transition-all hover:bg-[#00d4aa]/20"
            >
              <LogIn className="h-4 w-4" />
              使用 Google 登录
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
