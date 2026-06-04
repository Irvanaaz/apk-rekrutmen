"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workType: string;
  skills: string[];
};

type ApplicationFormProps = {
  job: Job;
  candidateProfileId: string;
  candidateName: string;
};

export default function ApplicationForm({
  job,
  candidateProfileId,
  candidateName,
}: ApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [motivation, setMotivation] = useState("");
  const [professionalLevel, setProfessionalLevel] = useState("");
  const [readyToWork, setReadyToWork] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_id: job.id,
        candidate_profile_id: candidateProfileId,
        status: "submitted",
      })
      .select("id")
      .single();

    if (applicationError) {
      if (applicationError.message.includes("duplicate")) {
        setError("Kamu sudah pernah melamar lowongan ini.");
      } else {
        setError(applicationError.message);
      }

      setLoading(false);
      return;
    }

    const { error: answerError } = await supabase
      .from("application_answers")
      .insert({
        application_id: application.id,
        motivation,
        professional_level: professionalLevel,
        ready_to_work: readyToWork,
        expected_salary: expectedSalary ? Number(expectedSalary) : null,
        additional_note: additionalNote,
      });

    if (answerError) {
      setError(answerError.message);
      setLoading(false);
      return;
    }

    router.push(`/lamar/${job.id}/success`);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-10">
          <Link
            href={`/lowongan/${job.id}`}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail Lowongan
          </Link>

          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Form lamaran kandidat
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Lamar posisi {job.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Halo, {candidateName}. Lengkapi pertanyaan berikut agar HR dapat
              memahami motivasi, kesiapan, dan pengalamanmu untuk posisi ini.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Pertanyaan Lamaran
            </h2>
            <p className="mt-2 text-slate-500">
              Jawabanmu akan dikirim ke HR bersama biodata dan CV yang sudah
              kamu upload.
            </p>
          </div>

          <div className="space-y-6">
            <TextArea
              label="Apa motivasi Anda melamar di perusahaan ini?"
              value={motivation}
              onChange={setMotivation}
              placeholder="Ceritakan alasan Anda tertarik melamar di perusahaan ini..."
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Seberapa profesional Anda dalam bidang ini?
              </label>
              <select
                value={professionalLevel}
                onChange={(e) => setProfessionalLevel(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Pilih tingkat pengalaman</option>
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Profesional">Profesional</option>
                <option value="Sangat Profesional">Sangat Profesional</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Apakah Anda dapat bekerja dalam waktu dekat?
              </label>
              <select
                value={readyToWork}
                onChange={(e) => setReadyToWork(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Pilih kesiapan</option>
                <option value="Bisa segera">Bisa segera</option>
                <option value="Dalam 1 minggu">Dalam 1 minggu</option>
                <option value="Dalam 2 minggu">Dalam 2 minggu</option>
                <option value="Dalam 1 bulan">Dalam 1 bulan</option>
              </select>
            </div>

            <Input
              label="Ekspektasi Gaji"
              type="number"
              value={expectedSalary}
              onChange={setExpectedSalary}
              placeholder="Contoh: 5000000"
            />

            <TextArea
              label="Catatan Tambahan"
              value={additionalNote}
              onChange={setAdditionalNote}
              placeholder="Tambahkan informasi lain jika diperlukan..."
            />
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim Lamaran...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Lamaran
              </>
            )}
          </button>
        </form>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Ringkasan Lowongan
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-slate-400">Posisi</p>
              <p className="mt-1 font-semibold text-slate-900">{job.title}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Perusahaan</p>
              <p className="mt-1 font-semibold text-slate-900">{job.company}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Lokasi</p>
              <p className="mt-1 font-semibold text-slate-900">
                {job.location} • {job.workType}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Tipe</p>
              <p className="mt-1 font-semibold text-slate-900">{job.type}</p>
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Skill terkait
            </p>

            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-600">
                Setelah dikirim, data lamaran kamu akan masuk ke dashboard HR
                untuk diproses lebih lanjut.
              </p>
            </div>
          </div>
        </aside>
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
};

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: TextAreaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        required={required}
        placeholder={placeholder}
        rows={5}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
