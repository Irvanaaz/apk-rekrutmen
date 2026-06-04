"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  description: string | null;
  qualification: string | null;
  responsibilities: string | null;
  location: string | null;
  job_type: string | null;
  work_type: string | null;
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  min_education: string | null;
  min_experience_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
};

export default function EditJobForm({ job }: { job: Job }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(job.title || "");
  const [companyName, setCompanyName] = useState(job.company_name || "");
  const [description, setDescription] = useState(job.description || "");
  const [qualification, setQualification] = useState(job.qualification || "");
  const [responsibilities, setResponsibilities] = useState(
    job.responsibilities || "",
  );
  const [location, setLocation] = useState(job.location || "");
  const [jobType, setJobType] = useState(job.job_type || "full_time");
  const [workType, setWorkType] = useState(job.work_type || "hybrid");
  const [requiredSkills, setRequiredSkills] = useState(
    (job.required_skills || []).join(", "),
  );
  const [preferredSkills, setPreferredSkills] = useState(
    (job.preferred_skills || []).join(", "),
  );
  const [minEducation, setMinEducation] = useState(job.min_education || "");
  const [minExperienceYears, setMinExperienceYears] = useState(
    job.min_experience_years !== null && job.min_experience_years !== undefined
      ? String(job.min_experience_years)
      : "",
  );
  const [salaryMin, setSalaryMin] = useState(
    job.salary_min !== null && job.salary_min !== undefined
      ? String(job.salary_min)
      : "",
  );
  const [salaryMax, setSalaryMax] = useState(
    job.salary_max !== null && job.salary_max !== undefined
      ? String(job.salary_max)
      : "",
  );
  const [status, setStatus] = useState(job.status || "active");

  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isActive = status === "active";

  const skillToArray = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const validateForm = () => {
    if (!title.trim()) return "Nama posisi wajib diisi.";
    if (!companyName.trim()) return "Nama perusahaan wajib diisi.";
    if (!description.trim()) return "Deskripsi lowongan wajib diisi.";
    if (!qualification.trim()) return "Kualifikasi wajib diisi.";
    if (!responsibilities.trim()) return "Tanggung jawab wajib diisi.";
    if (!location.trim()) return "Lokasi wajib diisi.";
    if (!minEducation.trim()) return "Pendidikan minimal wajib diisi.";

    if (skillToArray(requiredSkills).length === 0) {
      return "Skill yang dibutuhkan wajib diisi.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        title,
        company_name: companyName,
        description,
        qualification,
        responsibilities,
        location,
        job_type: jobType,
        work_type: workType,
        required_skills: skillToArray(requiredSkills),
        preferred_skills: skillToArray(preferredSkills),
        min_education: minEducation,
        min_experience_years: minExperienceYears
          ? Number(minExperienceYears)
          : 0,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        status,
      })
      .eq("id", job.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Lowongan berhasil diperbarui.");

    setTimeout(() => {
      router.push("/hr/dashboard");
      router.refresh();
    }, 800);

    setSaving(false);
  };

  const handleToggleStatus = async () => {
    const nextStatus = isActive ? "closed" : "active";

    setStatusSaving(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: nextStatus,
      })
      .eq("id", job.id);

    if (updateError) {
      setError(updateError.message);
      setStatusSaving(false);
      setShowConfirmModal(false);
      return;
    }

    setStatus(nextStatus);
    setMessage(
      nextStatus === "active"
        ? "Lowongan berhasil diaktifkan kembali."
        : "Lowongan berhasil ditutup.",
    );

    setStatusSaving(false);
    setShowConfirmModal(false);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-8">
          <Link
            href="/hr/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <BriefcaseBusiness className="h-4 w-4" />
              Edit Lowongan
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Perbarui informasi lowongan.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              HR dapat memperbaiki detail lowongan, menutup lowongan, atau
              mengaktifkannya kembali jika dibutuhkan.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Informasi Lowongan
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Status saat ini:{" "}
                <span
                  className={
                    isActive
                      ? "font-bold text-emerald-600"
                      : "font-bold text-slate-600"
                  }
                >
                  {isActive ? "Aktif" : "Ditutup"}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setShowConfirmModal(true)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700"
                    : "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700"
                }`}
              >
                {statusSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isActive ? (
                  <ToggleLeft className="h-4 w-4" />
                ) : (
                  <ToggleRight className="h-4 w-4" />
                )}

                {isActive ? "Tutup Lowongan" : "Aktifkan Lowongan"}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>

          {message && (
            <AlertBox type="success" title="Berhasil" message={message} />
          )}

          {error && (
            <AlertBox type="error" title="Gagal menyimpan" message={error} />
          )}

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Data Utama
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nama Posisi"
                  value={title}
                  onChange={setTitle}
                  placeholder="Contoh: Frontend Developer"
                  required
                />

                <Input
                  label="Nama Perusahaan"
                  value={companyName}
                  onChange={setCompanyName}
                  required
                />

                <Input
                  label="Lokasi"
                  value={location}
                  onChange={setLocation}
                  placeholder="Contoh: Jakarta"
                  required
                />

                <Input
                  label="Pendidikan Minimal"
                  value={minEducation}
                  onChange={setMinEducation}
                  placeholder="Contoh: D3/S1 Informatika"
                  required
                />

                <Select
                  label="Tipe Pekerjaan"
                  value={jobType}
                  onChange={setJobType}
                  options={[
                    { value: "full_time", label: "Full-time" },
                    { value: "part_time", label: "Part-time" },
                    { value: "internship", label: "Internship" },
                    { value: "contract", label: "Contract" },
                    { value: "freelance", label: "Freelance" },
                  ]}
                />

                <Select
                  label="Sistem Kerja"
                  value={workType}
                  onChange={setWorkType}
                  options={[
                    { value: "onsite", label: "Onsite" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "remote", label: "Remote" },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Deskripsi dan Kualifikasi
              </h3>

              <div className="grid gap-4">
                <TextArea
                  label="Deskripsi Lowongan"
                  value={description}
                  onChange={setDescription}
                  placeholder="Jelaskan secara singkat posisi yang dibuka..."
                  rows={4}
                  required
                />

                <TextArea
                  label="Tanggung Jawab"
                  value={responsibilities}
                  onChange={setResponsibilities}
                  placeholder="Contoh: Mengembangkan tampilan aplikasi. Bekerja sama dengan backend. Membuat UI responsif."
                  rows={4}
                  required
                />

                <TextArea
                  label="Kualifikasi"
                  value={qualification}
                  onChange={setQualification}
                  placeholder="Contoh: Menguasai React. Memahami TypeScript. Memiliki portfolio frontend."
                  rows={4}
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Skill
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <TextArea
                  label="Skill Wajib"
                  value={requiredSkills}
                  onChange={setRequiredSkills}
                  placeholder="Contoh: React, Next.js, Tailwind CSS"
                  rows={4}
                  required
                />

                <TextArea
                  label="Skill Nilai Tambah"
                  value={preferredSkills}
                  onChange={setPreferredSkills}
                  placeholder="Contoh: Supabase, Framer Motion, UI/UX"
                  rows={4}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                Pengalaman dan Gaji
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  label="Pengalaman Minimal (tahun)"
                  type="number"
                  value={minExperienceYears}
                  onChange={setMinExperienceYears}
                  placeholder="Contoh: 1"
                />

                <Input
                  label="Gaji Minimum"
                  type="number"
                  value={salaryMin}
                  onChange={setSalaryMin}
                  placeholder="Contoh: 5000000"
                />

                <Input
                  label="Gaji Maksimum"
                  type="number"
                  value={salaryMax}
                  onChange={setSalaryMax}
                  placeholder="Contoh: 8000000"
                />
              </div>
            </div>
          </div>
        </motion.form>
      </section>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className={`p-6 ${isActive ? "bg-red-50" : "bg-emerald-50"}`}>
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isActive
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {isActive ? (
                  <ToggleLeft className="h-7 w-7" />
                ) : (
                  <ToggleRight className="h-7 w-7" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                {isActive ? "Tutup Lowongan?" : "Aktifkan Lowongan?"}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {isActive
                  ? "Jika lowongan ditutup, kandidat tidak dapat mengirim lamaran baru untuk posisi ini. Data pelamar yang sudah masuk tetap aman."
                  : "Jika lowongan diaktifkan kembali, kandidat dapat melihat dan melamar posisi ini lagi."}
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={statusSaving}
                onClick={handleToggleStatus}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                    : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                }`}
              >
                {statusSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : isActive ? (
                  "Ya, Tutup Lowongan"
                ) : (
                  "Ya, Aktifkan"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
};

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
}: TextAreaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function AlertBox({
  type,
  title,
  message,
}: {
  type: "success" | "error";
  title: string;
  message: string;
}) {
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isSuccess
            ? "bg-emerald-100 text-emerald-600"
            : "bg-red-100 text-red-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
      </div>

      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 leading-5 opacity-90">{message}</p>
      </div>
    </motion.div>
  );
}
