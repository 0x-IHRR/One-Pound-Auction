"use client";

import Link from "next/link";
import { LogIn, ShieldCheck, UserCircle2 } from "lucide-react";

import { useCurrentSession } from "@/app/lib/auth/use-current-session";

export default function AuthNav() {
  const { status, user } = useCurrentSession();

  if (status === "loading") {
    return (
      <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-2 text-xs text-muted-foreground">
        账户加载中...
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-[#00d4aa]/40 hover:text-[#00d4aa]"
      >
        <LogIn className="h-4 w-4" />
        登录
      </Link>
    );
  }

  const destination = user.role === "ADMIN" ? "/admin" : "/me";
  const label = user.role === "ADMIN" ? "管理台" : "我的";

  return (
    <Link
      href={destination}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-3 py-2 text-xs font-medium text-[#00d4aa] transition-colors hover:bg-[#00d4aa]/20"
    >
      {user.role === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <UserCircle2 className="h-4 w-4" />}
      {label}
    </Link>
  );
}
