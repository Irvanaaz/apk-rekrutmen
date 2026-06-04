import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/server";
import StatusUpdate from "../../../dashboard/status-update";
import CvActions from "../../../dashboard/cv-actions";
import AssessmentModal from "./assessment-modal";

type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "skill_test"
  | "accepted"
  | "rejected";

type JobDetail = {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  work_type: string | null;
  status: string;
  required_skills: string[] | null;
};

type AssessmentData = {
  id: string | null;
  cv_score: number | null;
  interview_score: number | null;
  skill_test_score: number | null;
  total_score: number | null;
  note: string | null;
};

type ApplicationItem = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string | null;
  candidate_profiles: {
    id: string;
    full_name: string;
    phone: string | null;
    province_name: string | null;
    city_name: string | null;
    education_level: string | null;
    major: string | null;
    experience_months: number | null;
    skills: string[] | null;
    cv_url: string | null;
    cv_file_name: string | null;
    avatar_url: string | null;
  } | null;
  application_assessments: AssessmentData[] | AssessmentData | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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

function countByStatus(
  applications: ApplicationItem[],
  status: ApplicationStatus,
) {
  return applications.filter((application) => application.status === status)
    .length;
}

function getAssessment(application: ApplicationItem) {
  const assessment = application.application_assessments;

  if (Array.isArray(assessment)) {
    return assessment[0] || null;
  }

  return assessment || null;
}

function getTotalScore(application: ApplicationItem) {
  const assessment = getAssessment(application);

  if (
    !assessment ||
    assessment.total_score === null ||
    assessment.total_score === undefined
  ) {
    return null;
  }

  return Number(assessment.total_score);
}

function buildRankMap(applications: ApplicationItem[]) {
  const assessedApplications = applications
    .map((application) => ({
      applicationId: application.id,
      totalScore: getTotalScore(application),
    }))
    .filter(
      (item): item is { applicationId: string; totalScore: number } =>
        item.totalScore !== null && !Number.isNaN(item.totalScore),
    )
    .sort((a, b) => b.totalScore - a.totalScore);

  return new Map(
    assessedApplications.map((item, index) => [item.applicationId, index + 1]),
  );
}

function sortApplicationsByRank(
  applications: ApplicationItem[],
  rankMap: Map<string, number>,
) {
  return [...applications].sort((a, b) => {
    const rankA = rankMap.get(a.id);
    const rankB = rankMap.get(b.id);

    if (rankA && rankB) return rankA - rankB;
    if (rankA) return -1;
    if (rankB) return 1;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default async function JobApplicationsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const filterStatus = queryParams?.status || "all";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/hr/jobs/${id}/applications`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "hr") {
    redirect("/beranda");
  }

  const { data: jobData, error: jobError } = await supabase
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
      required_skills
    `,
    )
    .eq("id", id)
    .single();

  if (jobError || !jobData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Lowongan tidak ditemukan
          </h1>
          <p className="mt-3 text-slate-500">
            Lowongan yang kamu cari tidak tersedia.
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

  const job = jobData as JobDetail;

  const { data: applicationsData, error: applicationsError } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      candidate_profiles (
        id,
        full_name,
        phone,
        province_name,
        city_name,
        education_level,
        major,
        experience_months,
        skills,
        cv_url,
        cv_file_name,
        avatar_url
      ),
      application_assessments (
        id,
        cv_score,
        interview_score,
        skill_test_score,
        total_score,
        note
      )
    `,
    )
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  const allApplications = (applicationsData ||
    []) as unknown as ApplicationItem[];

  const rankMap = buildRankMap(allApplications);

  const filteredApplications =
    filterStatus === "all"
      ? allApplications
      : allApplications.filter(
          (application) => application.status === filterStatus,
        );

  const applications = sortApplicationsByRank(filteredApplications, rankMap);

  const totalApplicants = allApplications.length;
  const totalSubmitted = countByStatus(allApplications, "submitted");
  const totalScreening = countByStatus(allApplications, "screening");
  const totalInterview = countByStatus(allApplications, "interview");
  const totalSkillTest = countByStatus(allApplications, "skill_test");
  const totalAccepted = countByStatus(allApplications, "accepted");
  const totalRejected = countByStatus(allApplications, "rejected");

  const assessedCount = allApplications.filter(
    (application) => getAssessment(application) !== null,
  ).length;

  const topRankedApplications = sortApplicationsByRank(
    allApplications.filter((application) => rankMap.has(application.id)),
    rankMap,
  ).slice(0, 3);

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
            Kembali ke Dashboard
          </Link>

          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <BriefcaseBusiness className="h-4 w-4" />
              Pelamar Berdasarkan Lowongan
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              {job.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Kelola kandidat yang melamar untuk posisi ini. HR dapat melihat
              profil kandidat, CV, memperbarui status, dan memberi penilaian
              untuk menentukan ranking kandidat.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <MapPin className="h-4 w-4 text-blue-300" />
                {job.location || "Lokasi belum diisi"} •{" "}
                {formatWorkType(job.work_type)}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <FileText className="h-4 w-4 text-blue-300" />
                {formatJobType(job.job_type)}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-blue-300" />
                {job.status === "active"
                  ? "Lowongan Aktif"
                  : "Lowongan Ditutup"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Kandidat Pelamar
          </h2>
          <p className="mt-2 text-slate-500">
            Daftar kandidat yang melamar khusus untuk lowongan ini.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          <StatBox
            jobId={id}
            label="Total"
            value={totalApplicants}
            status="all"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Dikirim"
            value={totalSubmitted}
            status="submitted"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Screening"
            value={totalScreening}
            status="screening"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Interview"
            value={totalInterview}
            status="interview"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Tes Skill"
            value={totalSkillTest}
            status="skill_test"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Diterima"
            value={totalAccepted}
            status="accepted"
            active={filterStatus}
          />
          <StatBox
            jobId={id}
            label="Ditolak"
            value={totalRejected}
            status="rejected"
            active={filterStatus}
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Award className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Penilaian HRD
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {assessedCount}/{totalApplicants} Dinilai
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Ranking dihitung dari nilai CV 30%, Interview 30%, dan Tes Skill
              40%. Kandidat dengan total nilai tertinggi akan menjadi Rank 1.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Trophy className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Ranking Sementara
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  Top Kandidat
                </h3>
              </div>
            </div>

            {topRankedApplications.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {topRankedApplications.map((application) => {
                  const assessment = getAssessment(application);
                  const rank = rankMap.get(application.id);
                  const candidate = application.candidate_profiles;

                  return (
                    <div
                      key={application.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                        Rank {rank}
                      </p>
                      <p className="mt-2 line-clamp-1 font-bold text-slate-900">
                        {candidate?.full_name || "Nama kandidat"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        Total {Number(assessment?.total_score || 0).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                Belum ada kandidat yang dinilai. Klik tombol Nilai Kandidat pada
                card pelamar untuk mulai membuat ranking.
              </p>
            )}
          </div>
        </div>

        {applicationsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Gagal mengambil data pelamar</p>
            <p className="mt-1 text-sm">{applicationsError.message}</p>
          </div>
        )}

        {!applicationsError && applications.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Search className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Belum ada kandidat
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
              {filterStatus === "all"
                ? "Kandidat yang melamar lowongan ini akan muncul di halaman ini."
                : "Belum ada kandidat pada status ini."}
            </p>
          </div>
        )}

        {!applicationsError && applications.length > 0 && (
          <div className="grid gap-6">
            {applications.map((application) => (
              <ApplicantCard
                key={application.id}
                application={application}
                jobId={job.id}
                rank={rankMap.get(application.id) || null}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ApplicantCard({
  application,
  jobId,
  rank,
}: {
  application: ApplicationItem;
  jobId: string;
  rank: number | null;
}) {
  const candidate = application.candidate_profiles;
  const assessment = getAssessment(application);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid gap-0 xl:grid-cols-[1fr_340px]">
        <div className="p-6 md:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              {candidate?.avatar_url ? (
                <img
                  src={candidate.avatar_url}
                  alt="Foto kandidat"
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserRound className="h-7 w-7" />
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {candidate?.full_name || "Nama kandidat belum tersedia"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Melamar pada {formatDate(application.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {rank && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                  <Trophy className="h-4 w-4" />
                  Rank {rank}
                </div>
              )}

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusStyle(
                  application.status,
                )}`}
              >
                {application.status === "rejected" ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {statusLabel[application.status]}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Domisili"
              value={`${candidate?.city_name || "-"}, ${
                candidate?.province_name || "-"
              }`}
            />

            <InfoItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Pengalaman"
              value={formatExperience(candidate?.experience_months)}
            />

            <InfoItem
              icon={<FileText className="h-4 w-4" />}
              label="Pendidikan"
              value={`${candidate?.education_level || "-"} • ${
                candidate?.major || "-"
              }`}
            />

            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Tanggal Lamar"
              value={formatDate(application.created_at)}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-900">
              Skill Kandidat
            </p>

            {candidate?.skills && candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 10).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Skill belum tersedia.</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-900">CV Kandidat</p>

            <CvActions
              cvPath={candidate?.cv_url || null}
              fileName={candidate?.cv_file_name || null}
            />
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-6 md:p-7 xl:border-l xl:border-t-0">
          <StatusUpdate
            applicationId={application.id}
            currentStatus={application.status}
          />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-bold text-slate-900">
                Penilaian Kandidat
              </p>
            </div>

            {assessment ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-blue-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                    Total Nilai
                  </p>
                  <p className="mt-1 text-3xl font-black text-blue-700">
                    {Number(assessment.total_score || 0).toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <ScoreMini label="CV" value={assessment.cv_score || 0} />
                  <ScoreMini
                    label="Interview"
                    value={assessment.interview_score || 0}
                  />
                  <ScoreMini
                    label="Tes Skill"
                    value={assessment.skill_test_score || 0}
                  />
                </div>

                {rank && (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
                    Rank {rank}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Kandidat belum dinilai. Isi nilai CV, Interview, dan Tes Skill
                untuk menghasilkan ranking.
              </p>
            )}

            {candidate?.id && (
              <AssessmentModal
                applicationId={application.id}
                jobId={jobId}
                candidateProfileId={candidate.id}
                candidateName={candidate.full_name || "Kandidat"}
                assessment={assessment}
              />
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-900">Catatan Sistem</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Perubahan status akan langsung terlihat oleh kandidat pada halaman
              Riwayat Lamaran.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Link
              href={`/hr/applications/${application.id}`}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Lihat Detail Pelamar
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}

function StatBox({
  jobId,
  label,
  value,
  status,
  active,
}: {
  jobId: string;
  label: string;
  value: number;
  status: ApplicationStatus | "all";
  active: string;
}) {
  const isActive = active === status;

  return (
    <Link
      href={
        status === "all"
          ? `/hr/jobs/${jobId}/applications`
          : `/hr/jobs/${jobId}/applications?status=${status}`
      }
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isActive
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p
        className={`mt-1 text-xs font-semibold ${
          isActive ? "text-blue-100" : "text-slate-500"
        }`}
      >
        {label}
      </p>
    </Link>
  );
}

function InfoItem({
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
      <div className="mb-2 flex items-center gap-2 text-slate-400">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ScoreMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-900">
        {Number(value).toFixed(0)}
      </p>
    </div>
  );
}
