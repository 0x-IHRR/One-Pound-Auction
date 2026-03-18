import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { signInWithDemoAction, signInWithGoogleAction } from "@/app/lib/auth/actions";
import { getDemoAccounts, isDemoAuthEnabled, isGoogleAuthEnabled } from "@/app/lib/auth/demo-auth";
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

  const demoAuthEnabled = isDemoAuthEnabled();
  const googleAuthEnabled = isGoogleAuthEnabled();
  const demoAccounts = getDemoAccounts();

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
            公开 MVP 默认建议走 Google 登录；Demo 登录只保留给本地开发和演示环境。登录后会保留会话，并根据邮箱白名单或演示身份决定是否拥有 ADMIN 权限。
          </p>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
            登录成功后将跳转到：
            <span className="ml-2 rounded-full bg-[#00d4aa]/10 px-2 py-1 text-xs text-[#00d4aa]">{nextPath}</span>
          </div>

          {googleAuthEnabled ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-[#00d4aa]/15 bg-[#00d4aa]/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#00d4aa]/80">Google 登录</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  这是面向公网 MVP 的默认入口。用户使用自己的 Google 账号登录，系统再根据邮箱白名单决定是否展示管理员权限。
                </p>
              </div>

              <form action={signInWithGoogleAction}>
                <input type="hidden" name="next" value={nextPath} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-4 py-4 text-sm font-semibold text-[#00d4aa] transition-all hover:bg-[#00d4aa]/20"
                >
                  <LogIn className="h-4 w-4" />
                  使用 Google 登录
                </button>
              </form>
            </div>
          ) : null}

          {demoAuthEnabled ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Demo 登录</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  用演示身份直接体验发布、购买和后台，不依赖第三方 OAuth 配置。建议只在本地开发或演示环境打开。
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <form action={signInWithDemoAction}>
                  <input type="hidden" name="next" value={nextPath} />
                  <input type="hidden" name="mode" value="USER" />
                  <button
                    type="submit"
                    className="flex w-full flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-[#00d4aa]/40 hover:bg-[#00d4aa]/10"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      <LogIn className="h-4 w-4 text-[#00d4aa]" />
                      以普通用户身份进入
                    </span>
                    <span className="mt-2 text-xs text-slate-400">{demoAccounts.USER.email}</span>
                  </button>
                </form>

                <form action={signInWithDemoAction}>
                  <input type="hidden" name="next" value={nextPath} />
                  <input type="hidden" name="mode" value="ADMIN" />
                  <button
                    type="submit"
                    className="flex w-full flex-col rounded-2xl border border-[#00d4aa]/20 bg-[#00d4aa]/5 px-4 py-4 text-left transition hover:border-[#00d4aa]/40 hover:bg-[#00d4aa]/10"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      <LogIn className="h-4 w-4 text-[#00d4aa]" />
                      以管理员身份进入
                    </span>
                    <span className="mt-2 text-xs text-slate-400">{demoAccounts.ADMIN.email}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {!demoAuthEnabled && !googleAuthEnabled ? (
            <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
              当前没有可用的登录方式，请先补齐 `.env` 中的 Google OAuth 配置，或在本地把 `AUTH_DEMO_ENABLED=true` 打开。
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
