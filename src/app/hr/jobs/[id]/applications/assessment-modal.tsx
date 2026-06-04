"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ClipboardCheck,
  Loader2,
  Save,
  Star,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AssessmentData = {
  id: string | null;
  cv_score: number | null;
  interview_score: number | null;
  skill_test_score: number | null;
  total_score: number | null;
  note: string | null;
};

export default function AssessmentModal({
  applicationId,
  jobId,
  candidateProfileId,
  candidateName,
  assessment,
}: {
  applicationId: string;
  jobId: string;
  candidateProfileId: string;
  candidateName: string;
  assessment: AssessmentData | null;
}) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [cvScore, setCvScore] = useState(
    assessment?.cv_score !== null && assessment?.cv_score !== undefined
      ? String(assessment.cv_score)
      : "",
  );
  const [interviewScore, setInterviewScore] = useState(
    assessment?.interview_score !== null &&
      assessment?.interview_score !== undefined
      ? String(assessment.interview_score)
      : "",
  );
  const [skillTestScore, setSkillTestScore] = useState(
    assessment?.skill_test_score !== null &&
      assessment?.skill_test_score !== undefined
      ? String(assessment.skill_test_score)
      : "",
  );
  const [note, setNote] = useState(assessment?.note || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalScore =
    Number(cvScore || 0) * 0.3 +
    Number(interviewScore || 0) * 0.3 +
    Number(skillTestScore || 0) * 0.4;

  const validateScore = (value: string, label: string) => {
    if (value === "") return `${label} wajib diisi.`;
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return `${label} harus berupa angka.`;
    if (numberValue < 0 || numberValue > 100) {
      return `${label} harus berada di antara 0 sampai 100.`;
    }

    return "";
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const cvError = validateScore(cvScore, "Nilai CV");
    const interviewError = validateScore(interviewScore, "Nilai Interview");
    const skillError = validateScore(skillTestScore, "Nilai Tes Skill");

    if (cvError || interviewError || skillError) {
      setError(cvError || interviewError || skillError);
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      setSaving(false);
      return;
    }

    const payload = {
      application_id: applicationId,
      job_id: jobId,
      candidate_profile_id: candidateProfileId,
      cv_score: Number(cvScore),
      interview_score: Number(interviewScore),
      skill_test_score: Number(skillTestScore),
      note: note.trim() || null,
      assessed_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("application_assessments")
      .upsert(payload, {
        onConflict: "application_id",
      });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
          assessment
            ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        }`}
      >
        <ClipboardCheck className="h-4 w-4" />
        {assessment ? "Edit Penilaian" : "Nilai Kandidat"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Star className="h-6 w-6" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  Penilaian Kandidat
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Berikan nilai untuk kandidat{" "}
                  <span className="font-bold text-slate-700">
                    {candidateName}
                  </span>
                  . Total nilai dihitung otomatis menggunakan metode SAW.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold">Gagal menyimpan penilaian</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <ScoreInput
                  label="Nilai CV"
                  weight="30%"
                  value={cvScore}
                  onChange={setCvScore}
                />

                <ScoreInput
                  label="Nilai Interview"
                  weight="30%"
                  value={interviewScore}
                  onChange={setInterviewScore}
                />

                <ScoreInput
                  label="Nilai Tes Skill"
                  weight="40%"
                  value={skillTestScore}
                  onChange={setSkillTestScore}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Total Nilai
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Rumus: CV 30% + Interview 30% + Tes Skill 40%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-5 py-3 text-2xl font-black text-blue-600">
                    {totalScore.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Catatan HRD
                </label>

                <textarea
                  value={note}
                  rows={4}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Kandidat memiliki pengalaman yang sesuai dan komunikasi cukup baik."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Penilaian
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function ScoreInput({
  label,
  weight,
  value,
  onChange,
}: {
  label: string;
  weight: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 - 100"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />

      <p className="mt-2 text-xs font-semibold text-slate-400">
        Bobot {weight}
      </p>
    </div>
  );
}
