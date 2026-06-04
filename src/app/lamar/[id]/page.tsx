import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import ApplicationForm from "./application-form";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  job_type: string;
  work_type: string;
  required_skills: string[] | null;
};

type PageProps = {
  params: Promise<{
    id: string;
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

export default async function LamarPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: jobData, error: jobError } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, location, job_type, work_type, required_skills, status",
    )
    .eq("id", id)
    .single();

  if (jobError || !jobData) {
    redirect("/beranda");
  }

  if (jobData.status !== "active") {
    redirect(`/lowongan/${id}?status=closed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/lowongan/${id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "hr") {
    redirect(`/lowongan/${id}`);
  }

  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select(
      `
    id,
    is_complete,
    full_name,
    phone,
    birth_date,
    education_level,
    major,
    experience_months,
    province_id,
    city_id,
    address_detail,
    skills,
    cv_url,
    cv_file_name
  `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const isProfileComplete =
    candidateProfile &&
    candidateProfile.full_name &&
    candidateProfile.phone &&
    candidateProfile.birth_date &&
    candidateProfile.education_level &&
    candidateProfile.major &&
    candidateProfile.experience_months !== null &&
    candidateProfile.experience_months !== undefined &&
    candidateProfile.province_id &&
    candidateProfile.city_id &&
    candidateProfile.address_detail &&
    candidateProfile.skills &&
    candidateProfile.skills.length > 0 &&
    candidateProfile.cv_url &&
    candidateProfile.cv_file_name;

  if (!isProfileComplete) {
    redirect(`/profil?redirectTo=/lamar/${id}`);
  }

  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", id)
    .eq("candidate_profile_id", candidateProfile.id)
    .maybeSingle();

  if (existingApplication) {
    redirect(`/lamar/${id}/success?status=already`);
  }

  const job: Job = jobData;

  return (
    <ApplicationForm
      job={{
        id: job.id,
        title: job.title,
        company: job.company_name || "Perusahaan",
        location: job.location || "Lokasi belum diisi",
        type: formatJobType(job.job_type),
        workType: formatWorkType(job.work_type),
        skills: job.required_skills || [],
      }}
      candidateProfileId={candidateProfile.id}
      candidateName={candidateProfile.full_name}
    />
  );
}
