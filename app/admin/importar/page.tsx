import Link from "next/link";
import { ImportExcelForm } from "@/components/import-excel-form";

export default function ImportarExtintoresPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl p-4 sm:p-6">
      <section className="rounded-2xl border-2 border-slate-900 bg-white p-4 sm:p-6">
        <h1 className="text-center text-2xl font-black sm:text-3xl">IMPORTAR EXTINTORES</h1>
        <p className="mb-4 mt-1 text-center text-sm text-slate-500">
          Tela administrativa protegida por chave
        </p>

        <ImportExcelForm />

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Voltar
        </Link>
      </section>
    </main>
  );
}
