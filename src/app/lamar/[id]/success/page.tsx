import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Home,
  ShieldCheck,
} from "lucide-react";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function ApplicationSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const isAlreadyApplied = params?.status === "already";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb66,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed66,transparent_35%)]" />
      <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-4xl border border-white/10 bg-white shadow-2xl">
          <div className="grid lg:grid-cols-[1fr_340px]">
            <div className="p-7 text-slate-900 md:p-10">
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isAlreadyApplied
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isAlreadyApplied ? (
                  <AlertCircle className="h-8 w-8" />
                ) : (
                  <CheckCircle2 className="h-8 w-8" />
                )}
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
                <BriefcaseBusiness className="h-4 w-4" />
                HireHub Career Portal
              </div>

              <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
                {isAlreadyApplied
                  ? "Kamu sudah melamar lowongan ini"
                  : "Lamaran berhasil dikirim"}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                {isAlreadyApplied
                  ? "Lamaran kamu untuk lowongan ini sudah tercatat di sistem. Untuk menjaga proses rekrutmen tetap rapi, setiap kandidat hanya dapat melamar satu kali pada lowongan yang sama."
                  : "Terima kasih. Lamaran kamu sudah masuk ke sistem HR dan akan ditinjau sesuai tahapan rekrutmen perusahaan."}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard
                  icon={<ClipboardCheck className="h-5 w-5" />}
                  title="Data tercatat"
                  description="Lamaran tersimpan di sistem HR."
                  color="blue"
                />

                <InfoCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Data aman"
                  description="Biodata dan CV dikelola terstruktur."
                  color="emerald"
                />

                <InfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Menunggu review"
                  description="HR akan meninjau lamaran kamu."
                  color="purple"
                />
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/beranda"
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Lihat Lowongan Lain
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Home className="h-4 w-4" />
                  Halaman Utama
                </Link>
              </div>
            </div>

            <aside className="hidden bg-slate-950 p-9 text-white lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <BriefcaseBusiness className="h-6 w-6 text-blue-300" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">HireHub</h2>
                  <p className="text-sm text-slate-300">Recruitment Tracking</p>
                </div>
              </div>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6">
                <p className="text-sm font-semibold text-blue-200">
                  Status Lamaran
                </p>

                <div className="mt-6 space-y-5">
                  <Step active title="Lamaran dikirim" />
                  <Step active={isAlreadyApplied} title="Sudah tercatat" />
                  <Step title="Menunggu review HR" />
                  <Step title="Tahap berikutnya" />
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6">
                <p className="text-sm leading-7 text-slate-300">
                  Pastikan email dan nomor HP kamu aktif agar tim HR dapat
                  menghubungi kamu jika lolos ke tahap berikutnya.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "emerald" | "purple";
}) {
  const colorClass = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass[color]}`}
      >
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Step({ title, active = false }: { title: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-blue-400 bg-blue-500 text-white"
            : "border-white/15 bg-white/5 text-slate-400"
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <p className={active ? "font-semibold text-white" : "text-slate-400"}>
        {title}
      </p>
    </div>
  );
}
