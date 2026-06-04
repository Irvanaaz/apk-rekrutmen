import Link from "next/link";
import { cookies } from "next/headers";
import SearchLowonganForm from "./search-lowongan-form";
import {
  ArrowRight,
  Building2,
  Clock,
  Filter,
  MapPin,
  Sparkles,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/server";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  description: string;
  location: string | null;
  job_type: string;
  work_type: string;
  required_skills: string[] | null;
  status: string;
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function formatJobType(value: string) {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    internship: "Internship",
    contract: "Contract",
    freelance: "Freelance",
  };

  return map[value] || value;
}

function formatWorkType(value: string) {
  const map: Record<string, string> = {
    onsite: "Onsite",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return map[value] || value;
}

export default async function BerandaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params?.q?.trim() || "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, description, location, job_type, work_type, required_skills, status",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const allActiveJobs = (jobs || []) as Job[];

  const activeJobs = searchQuery
    ? allActiveJobs.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allActiveJobs;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Daftar lowongan aktif perusahaan
            </div>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              Temukan lowongan yang sesuai dengan potensimu.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Pilih posisi yang paling sesuai dengan kemampuan, pengalaman, dan
              minat kariermu. Setiap lamaran akan diproses secara terstruktur
              oleh tim HR.
            </p>

            <SearchLowonganForm
              defaultQuery={searchQuery}
              suggestions={allActiveJobs.map((job) => ({
                id: job.id,
                title: job.title,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {searchQuery ? "Hasil Pencarian" : "Lowongan Tersedia"}
            </h3>
            <p className="mt-2 text-slate-500">
              {searchQuery
                ? `Menampilkan lowongan dengan judul posisi "${searchQuery}".`
                : "Klik salah satu lowongan untuk melihat detail dan mulai melamar."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {searchQuery && (
              <Link
                href="/beranda"
                className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-blue-600"
              >
                Reset Pencarian
              </Link>
            )}

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <Filter className="h-4 w-4" />
              {activeJobs.length} lowongan aktif
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Gagal mengambil data lowongan</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        )}

        {!error && activeJobs.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">
              {searchQuery
                ? "Lowongan tidak ditemukan"
                : "Belum ada lowongan aktif"}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-slate-500">
              {searchQuery
                ? "Coba gunakan judul posisi lain atau lihat semua lowongan aktif."
                : "Silakan cek kembali nanti untuk melihat lowongan terbaru."}
            </p>

            {searchQuery && (
              <Link
                href="/beranda"
                className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Lihat Semua Lowongan
              </Link>
            )}
          </div>
        )}

        {!error && activeJobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/lowongan/${job.id}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Building2 className="h-7 w-7" />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Aktif
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900 transition group-hover:text-blue-600">
                  {job.title}
                </h4>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {job.company_name || "Perusahaan"}
                </p>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                  {job.description}
                </p>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {job.location || "Lokasi belum diisi"} •{" "}
                    {formatWorkType(job.work_type)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {formatJobType(job.job_type)}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(job.required_skills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600">
                  Lihat Detail
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
