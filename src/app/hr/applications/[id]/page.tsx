import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/server";
import StatusUpdate from "../../dashboard/status-update";
import CvActions from "../../dashboard/cv-actions";

type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "skill_test"
  | "accepted"
  | "rejected";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string | null;
  jobs: {
    id: string;
    title: string;
    company_name: string | null;
    location: string | null;
    work_type: string | null;
    job_type: string | null;
    required_skills: string[] | null;
    min_education: string | null;
    min_experience_years: number | null;
  } | null;
  candidate_profiles: {
    id: string;
    full_name: string;
    phone: string | null;
    birth_date: string | null;
    province_name: string | null;
    city_name: string | null;
    address_detail: string | null;
    education_level: string | null;
    major: string | null;
    experience_months: number | null;
    skills: string[] | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    cv_url: string | null;
    cv_file_name: string | null;
    avatar_url: string | null;
  } | null;
  application_answers: {
    motivation: string | null;
    professional_level: string | null;
    ready_to_work: string | null;
    expected_salary: number | null;
    additional_note: string | null;
  } | null;
};

const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "Lamaran Dikirim",
  screening: "Screening",
  interview: "Interview",
  skill_test: "Tes Skill",
  accepted: "Diterima",
  rejected: "Ditolak",
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatSalary(value?: number | null) {
  if (!value) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatExperience(months?: number | null) {
  if (!months || months <= 0) return "Fresh Graduate";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} tahun ${remainingMonths} bulan`;
  }

  if (years > 0) {
    return `${years} tahun`;
  }

  return `${remainingMonths} bulan`;
}

function formatJobType(value?: string | null) {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    internship: "Internship",
    contract: "Contract",
    freelance: "Freelance",
  };

  if (!value) return "-";
  return map[value] || value;
}

function formatWorkType(value?: string | null) {
  const map: Record<string, string> = {
    onsite: "Onsite",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  if (!value) return "-";
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

export default async function HRApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

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
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "hr") {
    redirect("/beranda");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      jobs (
        id,
        title,
        company_name,
        location,
        work_type,
        job_type,
        required_skills,
        min_education,
        min_experience_years
      ),
      candidate_profiles (
        id,
        full_name,
        phone,
        birth_date,
        province_name,
        city_name,
        address_detail,
        education_level,
        major,
        experience_months,
        skills,
        linkedin_url,
        github_url,
        portfolio_url,
        cv_url,
        cv_file_name,
        avatar_url
      ),
      application_answers (
        motivation,
        professional_level,
        ready_to_work,
        expected_salary,
        additional_note
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Data pelamar tidak ditemukan
          </h1>
          <p className="mt-3 text-slate-500">
            Lamaran yang kamu cari tidak tersedia atau sudah dihapus.
          </p>
          <Link
            href="/hr/dashboard"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const application = data as unknown as ApplicationDetail;
  const candidate = application.candidate_profiles;
  const job = application.jobs;
  const answers = application.application_answers;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-8">
          <Link
            href="/hr/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard HR
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <UserRound className="h-4 w-4" />
                Detail Pelamar
              </div>

              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                {candidate?.full_name || "Nama Kandidat"}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Melamar posisi{" "}
                <span className="font-bold text-white">
                  {job?.title || "Lowongan tidak ditemukan"}
                </span>{" "}
                pada {formatDate(application.created_at)}.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="mb-3 text-sm font-semibold text-slate-300">
                Status Lamaran Saat Ini
              </p>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                  application.status,
                )}`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {statusLabel[application.status]}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4 text-slate-900">
                <StatusUpdate
                  applicationId={application.id}
                  currentStatus={application.status}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-8">
          <div className="bg-slate-950 p-7 text-white">
            <div className="flex flex-col items-center text-center">
              {candidate?.avatar_url ? (
                <img
                  src={candidate.avatar_url}
                  alt="Foto kandidat"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-blue-200 ring-4 ring-white/10">
                  <UserRound className="h-11 w-11" />
                </div>
              )}

              <h2 className="mt-5 text-xl font-bold">
                {candidate?.full_name || "-"}
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {candidate?.city_name || "-"}, {candidate?.province_name || "-"}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <InfoBlock
              icon={<Phone className="h-4 w-4" />}
              label="Nomor HP"
              value={candidate?.phone || "-"}
            />

            <InfoBlock
              icon={<CalendarDays className="h-4 w-4" />}
              label="Tanggal Lahir"
              value={formatDate(candidate?.birth_date)}
            />

            <InfoBlock
              icon={<MapPin className="h-4 w-4" />}
              label="Alamat"
              value={candidate?.address_detail || "-"}
            />

            <InfoBlock
              icon={<GraduationCap className="h-4 w-4" />}
              label="Pendidikan"
              value={`${candidate?.education_level || "-"} • ${
                candidate?.major || "-"
              }`}
            />

            <InfoBlock
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Pengalaman"
              value={formatExperience(candidate?.experience_months)}
            />

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="mb-3 text-sm font-bold text-slate-900">
                CV Kandidat
              </p>

              <CvActions
                cvPath={candidate?.cv_url || null}
                fileName={candidate?.cv_file_name || null}
              />
            </div>

            <div className="grid gap-3">
              {candidate?.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  LinkedIn
                </a>
              )}

              {candidate?.github_url && (
                <a
                  href={candidate.github_url}
                  target="_blank"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  GitHub
                </a>
              )}

              {candidate?.portfolio_url && (
                <a
                  href={candidate.portfolio_url}
                  target="_blank"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lowongan yang Dilamar
                </h2>
                <p className="text-sm text-slate-500">
                  Informasi posisi yang dipilih kandidat.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Posisi" value={job?.title || "-"} />
              <DetailItem
                label="Perusahaan"
                value={job?.company_name || "Perusahaan"}
              />
              <DetailItem label="Lokasi" value={job?.location || "-"} />
              <DetailItem
                label="Tipe"
                value={`${formatJobType(job?.job_type)} • ${formatWorkType(
                  job?.work_type,
                )}`}
              />
              <DetailItem
                label="Pendidikan Minimal"
                value={job?.min_education || "-"}
              />
              <DetailItem
                label="Pengalaman Minimal"
                value={
                  job?.min_experience_years !== null &&
                  job?.min_experience_years !== undefined
                    ? `${job.min_experience_years} tahun`
                    : "-"
                }
              />
            </div>

            {job?.required_skills && job.required_skills.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold text-slate-900">
                  Skill yang Dibutuhkan
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Jawaban Lamaran
                </h2>
                <p className="text-sm text-slate-500">
                  Jawaban kandidat saat mengirim lamaran.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <AnswerBlock
                title="Motivasi Melamar"
                value={answers?.motivation || "-"}
              />

              <div className="grid gap-5 md:grid-cols-3">
                <AnswerBlock
                  title="Tingkat Profesional"
                  value={answers?.professional_level || "-"}
                />

                <AnswerBlock
                  title="Kesiapan Bekerja"
                  value={answers?.ready_to_work || "-"}
                />

                <AnswerBlock
                  title="Ekspektasi Gaji"
                  value={formatSalary(answers?.expected_salary)}
                />
              </div>

              <AnswerBlock
                title="Catatan Tambahan"
                value={answers?.additional_note || "-"}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Skill Kandidat
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Skill yang diisi kandidat pada halaman profil.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {candidate?.skills && candidate.skills.length > 0 ? (
                candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Skill belum tersedia.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function AnswerBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="mb-2 text-sm font-bold text-slate-900">{title}</p>
      <p className="leading-7 text-slate-600">{value}</p>
    </div>
  );
}
