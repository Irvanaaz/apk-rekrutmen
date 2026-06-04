import { Suspense } from "react";
import ProfilForm from "./profil-form";

function ProfilLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 shadow-sm backdrop-blur">
        <p className="font-semibold">Memuat halaman profil...</p>
      </div>
    </main>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<ProfilLoading />}>
      <ProfilForm />
    </Suspense>
  );
}