import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/server";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  description: string;
  qualification: string | null;
  responsibilities: string | null;
  location: string | null;
  job_type: string;
  work_type: string;
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  min_education: string | null;
  min_experience_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    status?: string;
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

function formatSalary(min: number | null, max: number | null) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min) {
    return `Mulai dari ${formatter.format(min)}`;
  }

  if (max) {
    return `Sampai ${formatter.format(max)}`;
  }

  return "Tidak dicantumkan";
}

function splitTextToList(text: string | null) {
  if (!text) return [];

  return text
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function DetailLowonganPage({
  params,
  searchParams,
}: PageProps) {
  const queryParams = await searchParams;
  const isClosedRedirect = queryParams?.status === "closed";

  const { id } = await params;

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

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_name,
      description,
      qualification,
      responsibilities,
      location,
      job_type,
      work_type,
      required_skills,
      preferred_skills,
      min_education,
      min_experience_years,
      salary_min,
      salary_max,
      status
    `,
    )
    .eq("id", id)
    .single();

  const job = data as Job | null;

  if (error || !job || (job.status !== "active" && !isHr)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Lowongan tidak ditemukan
          </h1>
          <p className="mt-3 text-slate-500">
            Lowongan yang kamu cari tidak tersedia atau sudah ditutup.
          </p>
          <Link
            href="/beranda"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const responsibilities = splitTextToList(job.responsibilities);
  const qualifications = splitTextToList(job.qualification);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-10">
          <Link
            href={isHr ? "/hr/dashboard" : "/beranda"}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isHr ? "Kembali ke Dashboard HR" : "Kembali ke Lowongan"}
          </Link>

          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Detail lowongan pekerjaan
            </div>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              {job.title}
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              {job.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <Building2 className="h-4 w-4 text-blue-300" />
                {job.company_name || "Perusahaan"}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <MapPin className="h-4 w-4 text-blue-300" />
                {job.location || "Lokasi belum diisi"} •{" "}
                {formatWorkType(job.work_type)}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <Clock className="h-4 w-4 text-blue-300" />
                {formatJobType(job.job_type)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        {isClosedRedirect && !isHr && (
          <div className="lg:col-span-2 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <p className="font-bold">Lowongan sudah ditutup</p>
            <p className="mt-1 text-sm leading-6">
              Maaf, lowongan ini sudah tidak menerima lamaran baru. Kamu masih
              bisa melihat lowongan aktif lainnya di halaman beranda.
            </p>
          </div>
        )}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">
              Deskripsi Pekerjaan
            </h3>
            <p className="mt-4 leading-8 text-slate-600">{job.description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Tanggung Jawab</h3>

            <div className="mt-5 space-y-4">
              {responsibilities.length > 0 ? (
                responsibilities.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="leading-7 text-slate-600">{item}.</p>
                  </div>
                ))
              ) : (
                <p className="leading-7 text-slate-600">
                  Tanggung jawab belum dicantumkan.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Kualifikasi</h3>

            <div className="mt-5 space-y-4">
              {qualifications.length > 0 ? (
                qualifications.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="leading-7 text-slate-600">{item}.</p>
                  </div>
                ))
              ) : (
                <p className="leading-7 text-slate-600">
                  Kualifikasi belum dicantumkan.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-8">
          <h3 className="text-xl font-bold text-slate-900">Ringkasan</h3>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-slate-400">Posisi</p>
              <p className="mt-1 font-semibold text-slate-900">{job.title}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Lokasi</p>
              <p className="mt-1 font-semibold text-slate-900">
                {job.location || "Belum diisi"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Tipe Kerja</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatJobType(job.job_type)} • {formatWorkType(job.work_type)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Estimasi Gaji</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatSalary(job.salary_min, job.salary_max)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Pendidikan Minimal</p>
              <p className="mt-1 font-semibold text-slate-900">
                {job.min_education || "Tidak dicantumkan"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Pengalaman Minimal</p>
              <p className="mt-1 font-semibold text-slate-900">
                {job.min_experience_years || 0} tahun
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Skill yang dibutuhkan
            </p>

            <div className="flex flex-wrap gap-2">
              {(job.required_skills || []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {!isHr && job.status === "active" && (
            <Link
              href={`/lamar/${job.id}`}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Lamar Sekarang
              <Send className="h-4 w-4" />
            </Link>
          )}

          {!isHr && job.status !== "active" && (
            <div className="mt-8 rounded-2xl bg-slate-100 px-6 py-4 text-center text-sm font-bold text-slate-500">
              Lowongan Sudah Ditutup
            </div>
          )}

          {isHr && (
            <Link
              href={`/hr/jobs/${job.id}/applications`}
              className="mt-8 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Lihat Pelamar Lowongan Ini
            </Link>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            {isHr
              ? "HR dapat melihat daftar kandidat yang melamar lowongan ini."
              : job.status === "active"
                ? "Kamu akan diminta login atau melengkapi profil sebelum mengirim lamaran."
                : "Lowongan ini sudah tidak menerima lamaran baru."}
          </p>
        </aside>
      </section>
    </main>
  );
}
