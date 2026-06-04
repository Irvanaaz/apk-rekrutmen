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
} from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/client";

export default function JobForm({ hrUserId }: { hrUserId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [qualification, setQualification] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("full_time");
  const [workType, setWorkType] = useState("hybrid");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");
  const [minEducation, setMinEducation] = useState("");
  const [minExperienceYears, setMinExperienceYears] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

    const { error: insertError } = await supabase.from("jobs").insert({
      created_by: hrUserId,
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
      min_experience_years: minExperienceYears ? Number(minExperienceYears) : 0,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setMessage("Lowongan berhasil dibuat. Kamu akan diarahkan ke dashboard.");

    setTimeout(() => {
      router.push("/hr/dashboard");
      router.refresh();
    }, 800);
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
              Buat Lowongan Baru
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Tambahkan lowongan perusahaan.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Lowongan yang dibuat akan tampil di halaman kandidat dan dapat
              langsung menerima lamaran.
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
                Lengkapi informasi lowongan agar kandidat memahami posisi yang
                dibuka.
              </p>
            </div>

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
                  Simpan Lowongan
                </>
              )}
            </button>
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tipe Pekerjaan
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sistem Kerja
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
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
                Skill dan Benefit
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
