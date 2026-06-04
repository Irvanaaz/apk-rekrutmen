import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/server";

type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "skill_test"
  | "accepted"
  | "rejected";

type JobItem = {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  work_type: string | null;
  status: string;
  created_at: string | null;
  applications: {
    id: string;
    status: ApplicationStatus;
  }[];
};

type PageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function formatJobType(value?: string | null) {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    internship: "Internship",
    contract: "Contract",
    freelance: "Freelance",
  };

  if (!value) return "Tipe belum diisi";
  return map[value] || value;
}

function formatWorkType(value?: string | null) {
  const map: Record<string, string> = {
    onsite: "Onsite",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  if (!value) return "Sistem kerja belum diisi";
  return map[value] || value;
}

function getApplicationCount(
  applications: JobItem["applications"],
  status: ApplicationStatus,
) {
  return applications.filter((application) => application.status === status)
    .length;
}

function getProcessCount(applications: JobItem["applications"]) {
  return applications.filter((application) =>
    ["screening", "interview", "skill_test"].includes(application.status),
  ).length;
}

export default async function HRDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterStatus = params?.status || "all";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/hr/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "hr") {
    redirect("/beranda");
  }

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company_name,
      location,
      job_type,
      work_type,
      status,
      created_at,
      applications (
        id,
        status
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;

  const jobs = (data || []) as unknown as JobItem[];

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const closedJobs = jobs.filter((job) => job.status !== "active").length;

  const totalApplicants = jobs.reduce(
    (total, job) => total + (job.applications?.length || 0),
    0,
  );

  const totalInProcess = jobs.reduce(
    (total, job) => total + getProcessCount(job.applications || []),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Dashboard HR Recruitment
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Kelola lowongan dan pelamar.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Pantau setiap lowongan yang dibuka perusahaan, lihat jumlah
              pelamar, dan masuk ke daftar kandidat berdasarkan lowongan.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Total Lowongan"
                value={totalJobs}
                icon={<BriefcaseBusiness className="h-5 w-5" />}
              />

              <StatCard
                title="Lowongan Aktif"
                value={activeJobs}
                icon={<CheckCircle2 className="h-5 w-5" />}
              />

              <StatCard
                title="Lowongan Ditutup"
                value={closedJobs}
                icon={<XCircle className="h-5 w-5" />}
              />

              <StatCard
                title="Total Pelamar"
                value={totalApplicants}
                icon={<Users className="h-5 w-5" />}
              />

              <StatCard
                title="Dalam Proses"
                value={totalInProcess}
                icon={<Clock3 className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Daftar Lowongan
            </h2>
            <p className="mt-2 text-slate-500">
              Pilih lowongan untuk melihat kandidat yang melamar posisi
              tersebut.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/hr/jobs/new"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              + Tambah Lowongan
            </Link>

            <div className="flex flex-wrap gap-2">
              <FilterLink label="Semua" value="all" active={filterStatus} />
              <FilterLink label="Aktif" value="active" active={filterStatus} />
              <FilterLink
                label="Ditutup"
                value="closed"
                active={filterStatus}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Gagal mengambil data lowongan</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        )}

        {!error && jobs.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Belum ada lowongan
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Data lowongan akan muncul di sini setelah HR membuat atau
              mengaktifkan lowongan.
            </p>
          </div>
        )}

        {!error && jobs.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
        {icon}
      </div>

      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{title}</p>
    </div>
  );
}

function FilterLink({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: string;
}) {
  const isActive = active === value;

  return (
    <Link
      href={value === "all" ? "/hr/dashboard" : `/hr/dashboard?status=${value}`}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
      }`}
    >
      {label}
    </Link>
  );
}

function JobCard({ job }: { job: JobItem }) {
  const applications = job.applications || [];

  const totalApplicants = applications.length;
  const submitted = getApplicationCount(applications, "submitted");
  const screening = getApplicationCount(applications, "screening");
  const interview = getApplicationCount(applications, "interview");
  const skillTest = getApplicationCount(applications, "skill_test");
  const accepted = getApplicationCount(applications, "accepted");
  const rejected = getApplicationCount(applications, "rejected");

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="p-6 md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {job.company_name || "Perusahaan"}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              job.status === "active"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {job.status === "active" ? "Aktif" : "Ditutup"}
          </span>
        </div>

        <div className="mb-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            {job.location || "Lokasi belum diisi"} •{" "}
            {formatWorkType(job.work_type)}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
            <FileText className="h-4 w-4 text-slate-400" />
            {formatJobType(job.job_type)}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Total Pelamar" value={totalApplicants} />
          <MiniStat label="Baru Masuk" value={submitted} />
          <MiniStat label="Screening" value={screening} />
          <MiniStat label="Interview" value={interview} />
          <MiniStat label="Tes Skill" value={skillTest} />
          <MiniStat label="Diterima" value={accepted} />
        </div>

        {rejected > 0 && (
          <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {rejected} kandidat ditolak
          </div>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Link
            href={`/hr/jobs/${job.id}/applications`}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Lihat Pelamar
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href={`/hr/jobs/${job.id}/edit`}
            className="flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Edit
          </Link>

          <Link
            href={`/lowongan/${job.id}`}
            className="flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Lihat Lowongan
          </Link>
        </div>
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
