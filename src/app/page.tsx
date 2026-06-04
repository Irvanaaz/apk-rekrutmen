import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role || null;
  }

  const isHr = userRole === "hr";

  const heroBadge = isHr
    ? "Portal pengelolaan rekrutmen perusahaan"
    : "Selamat datang di portal karier resmi perusahaan";

  const heroTitle = isHr
    ? "Kelola proses rekrutmen dengan lebih terstruktur."
    : "Mulai langkah terbaik untuk karier masa depanmu.";

  const heroDescription = isHr
    ? "Pantau lowongan, lihat kandidat yang melamar, perbarui status seleksi, dan kelola proses rekrutmen perusahaan dalam satu sistem yang rapi."
    : "Kami membuka kesempatan bagi kandidat terbaik untuk bergabung dan berkembang bersama perusahaan. Melalui sistem ini, proses lamaran menjadi lebih mudah, transparan, dan terdata dengan baik.";

  const buttonHref = isHr ? "/hr/dashboard" : "/beranda";
  const buttonLabel = isHr ? "Masuk Dashboard HR" : "Yuk Lamar";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb66,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed66,transparent_35%)]" />
      <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-center px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <BriefcaseBusiness className="h-6 w-6 text-blue-300" />
          </div>

          <div>
            <h1 className="text-lg font-bold">HireHub</h1>
            <p className="text-xs text-slate-300">
              {isHr ? "HR Management Portal" : "Career Recruitment Portal"}
            </p>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-7xl items-center px-6 py-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {heroBadge}
            </div>

            <h2 className="max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
              {heroTitle}
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {heroDescription}
            </p>

            <div className="mt-9">
              <Link
                href={buttonHref}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-9 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                {buttonLabel}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="mb-3 h-6 w-6 text-blue-300" />
                <p className="text-lg font-bold">
                  {isHr ? "Terkontrol" : "Aman"}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {isHr
                    ? "Data pelamar tersusun rapi"
                    : "Data kandidat tersimpan rapi"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <FileSearch className="mb-3 h-6 w-6 text-purple-300" />
                <p className="text-lg font-bold">Terstruktur</p>
                <p className="mt-1 text-sm text-slate-300">
                  {isHr
                    ? "Status seleksi mudah dipantau"
                    : "Proses lamaran lebih jelas"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-300" />
                <p className="text-lg font-bold">Profesional</p>
                <p className="mt-1 text-sm text-slate-300">
                  {isHr
                    ? "Rekrutmen dikelola lebih efisien"
                    : "Seleksi dilakukan lebih objektif"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-blue-500/30 blur-2xl" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-purple-500/30 blur-2xl" />

            <div className="relative rounded-4xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-white p-6 text-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {isHr ? "Manajemen HR" : "Proses Rekrutmen"}
                    </p>
                    <h3 className="text-2xl font-bold">
                      {isHr ? "Rapi & Terkelola" : "Mudah & Terpercaya"}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    {isHr ? (
                      <LayoutDashboard className="h-6 w-6" />
                    ) : (
                      <BriefcaseBusiness className="h-6 w-6" />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <UsersRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">
                          {isHr ? "Kelola Lowongan" : "Lengkapi Profil"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {isHr
                            ? "Buat, edit, tutup, dan aktifkan lowongan dengan mudah."
                            : "Isi biodata agar HR dapat mengenalmu lebih baik."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <FileSearch className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">
                          {isHr ? "Lihat Kandidat" : "Upload CV"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {isHr
                            ? "Pantau kandidat berdasarkan lowongan yang dilamar."
                            : "Kirim CV terbaikmu secara online dengan mudah."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">
                          {isHr ? "Update Status" : "Kirim Lamaran"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {isHr
                            ? "Perbarui status seleksi dan kandidat dapat tracking prosesnya."
                            : "Pilih lowongan yang sesuai dan kirim lamaranmu."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-300">
                    {isHr ? "Kinerja Rekrutmen" : "Komitmen Perusahaan"}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{isHr ? "Data Pelamar" : "Keamanan Data"}</span>
                        <span>{isHr ? "Terpusat" : "Terjaga"}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[90%] rounded-full bg-blue-500" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>
                          {isHr ? "Proses Seleksi" : "Proses Seleksi"}
                        </span>
                        <span>{isHr ? "Terkontrol" : "Transparan"}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[82%] rounded-full bg-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
