import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
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

type ApplicationItem = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    company_name: string | null;
    location: string | null;
    work_type: string | null;
    job_type: string | null;
  } | null;
};

type PageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "Lamaran Dikirim",
  screening: "Screening",
  interview: "Interview",
  skill_test: "Tes Skill",
  accepted: "Diterima",
  rejected: "Ditolak",
};

const statusDescription: Record<ApplicationStatus, string> = {
  submitted: "Lamaran kamu sudah berhasil dikirim ke HR.",
  screening: "HR sedang melakukan proses screening lamaran kamu.",
  interview: "Kamu masuk ke tahap interview.",
  skill_test: "Kamu masuk ke tahap tes skill.",
  accepted: "Selamat, kamu dinyatakan diterima.",
  rejected: "Maaf, kamu belum lolos untuk lowongan ini.",
};

const trackingSteps: {
  key: ApplicationStatus;
  label: string;
}[] = [
  { key: "submitted", label: "Lamaran Dikirim" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "skill_test", label: "Tes Skill" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

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

function getStatusStyle(status: ApplicationStatus) {
  if (status === "accepted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "interview" || status === "skill_test") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (status === "screening") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getCurrentStepIndex(status: ApplicationStatus) {
  if (status === "accepted" || status === "rejected") {
    return trackingSteps.length;
  }

  const index = trackingSteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index + 1;
}

export default async function RiwayatLamaranPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterStatus = params?.status || "all";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/riwayat-lamaran");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "hr") {
    redirect("/hr/dashboard");
  }

  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!candidateProfile) {
    redirect("/profil?redirectTo=/riwayat-lamaran");
  }

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      jobs (
        id,
        title,
        company_name,
        location,
        work_type,
        job_type
      )
    `,
    )
    .eq("candidate_profile_id", candidateProfile.id)
    .order("created_at", { ascending: false });

  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data, error } = await query;

  const applications = (data || []) as unknown as ApplicationItem[];

  const totalApplications = applications.length;
  const activeApplications = applications.filter(
    (item) => item.status !== "accepted" && item.status !== "rejected",
  ).length;
  const finalApplications = applications.filter(
    (item) => item.status === "accepted" || item.status === "rejected",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <FileText className="h-4 w-4" />
              Riwayat Lamaran Kandidat
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Pantau proses lamaran kamu.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Lihat semua lowongan yang pernah kamu lamar dan pantau status
              proses rekrutmen dari HR.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{totalApplications}</p>
                <p className="mt-1 text-sm text-slate-300">Total Lamaran</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{activeApplications}</p>
                <p className="mt-1 text-sm text-slate-300">Dalam Proses</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{finalApplications}</p>
                <p className="mt-1 text-sm text-slate-300">Selesai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Daftar Lamaran
            </h2>
            <p className="mt-2 text-slate-500">
              Status akan berubah ketika HR memperbarui proses lamaran kamu.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterLink label="Semua" value="all" active={filterStatus} />
            <FilterLink
              label="Dikirim"
              value="submitted"
              active={filterStatus}
            />
            <FilterLink
              label="Screening"
              value="screening"
              active={filterStatus}
            />
            <FilterLink
              label="Interview"
              value="interview"
              active={filterStatus}
            />
            <FilterLink
              label="Tes Skill"
              value="skill_test"
              active={filterStatus}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Gagal mengambil riwayat lamaran</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        )}

        {!error && applications.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <BriefcaseBusiness className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Belum ada lamaran
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              Kamu belum mengirim lamaran pada lowongan mana pun. Cari lowongan
              yang sesuai dan mulai kirim lamaran pertamamu.
            </p>

            <Link
              href="/beranda"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Cari Lowongan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!error && applications.length > 0 && (
          <div className="space-y-6">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>
    </main>
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
      href={
        value === "all"
          ? "/riwayat-lamaran"
          : `/riwayat-lamaran?status=${value}`
      }
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

function ApplicationCard({ application }: { application: ApplicationItem }) {
  const job = application.jobs;
  const currentStep = getCurrentStepIndex(application.status);
  const isRejected = application.status === "rejected";
  const isAccepted = application.status === "accepted";

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {job?.title || "Lowongan tidak ditemukan"}
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                {job?.company_name || "Perusahaan"}
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                application.status,
              )}`}
            >
              {isRejected ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {statusLabel[application.status]}
            </div>
          </div>

          <div className="mb-6 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatDate(application.created_at)}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-slate-400" />
              {job?.location || "Lokasi belum diisi"}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {formatJobType(job?.job_type)} • {formatWorkType(job?.work_type)}
            </div>
          </div>

          <p className="leading-7 text-slate-600">
            {statusDescription[application.status]}
          </p>

          {job?.id && (
            <Link
              href={`/lowongan/${job.id}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Lihat Detail Lowongan
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-7 lg:border-l lg:border-t-0">
          <h4 className="mb-5 font-bold text-slate-900">Tracking Lamaran</h4>

          <div className="space-y-4">
            {trackingSteps.map((step, index) => {
              const isDone = index < currentStep;
              const isCurrent =
                index + 1 === currentStep && !isAccepted && !isRejected;

              return (
                <div key={step.key} className="flex gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isDone
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isCurrent
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-300"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p
                      className={`font-semibold ${
                        isDone || isCurrent
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>

                    {isCurrent && (
                      <p className="mt-1 text-xs text-slate-500">
                        Sedang berlangsung
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {(isAccepted || isRejected) && (
              <div className="flex gap-3 pt-2">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isAccepted
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {isAccepted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {isAccepted ? "Diterima" : "Ditolak"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status akhir proses rekrutmen
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
