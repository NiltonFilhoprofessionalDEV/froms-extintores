import Link from "next/link";
import { Flame, Droplets, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10">
      {/* Logo / Brand bar */}
      <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 shadow-card">
          <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.8} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Sistema de Inspeção
        </h1>
        <p className="text-sm text-slate-500">Selecione o tipo de conferência</p>
      </header>

      {/* Cards */}
      <div className="grid w-full max-w-sm gap-4">
        <Link
          href="/extintores"
          className="group flex min-h-[96px] items-center gap-4 rounded-2xl bg-danger-600 px-6 py-5 text-white shadow-card transition hover:bg-danger-700 active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Flame className="h-7 w-7" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold leading-tight">Extintores</span>
            <span className="text-sm font-normal text-red-100">Inspeção de extintores</span>
          </span>
        </Link>

        <Link
          href="/hidrantes"
          className="group flex min-h-[96px] items-center gap-4 rounded-2xl bg-brand-700 px-6 py-5 text-white shadow-card transition hover:bg-brand-800 active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Droplets className="h-7 w-7" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold leading-tight">Hidrantes</span>
            <span className="text-sm font-normal text-blue-100">Inspeção de hidrantes</span>
          </span>
        </Link>
      </div>

      <footer className="mt-10 text-xs text-slate-400">
        Segurança contra incêndio · Equipe técnica
      </footer>
    </main>
  );
}
