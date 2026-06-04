"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "skill_test"
  | "accepted"
  | "rejected";

const statusOptions: {
  value: ApplicationStatus;
  label: string;
}[] = [
  { value: "submitted", label: "Lamaran Dikirim" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "skill_test", label: "Tes Skill" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

export default function StatusUpdate({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const supabase = createClient();

  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = async (value: ApplicationStatus) => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("applications")
      .update({
        status: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setStatus(value);
    setMessage("Status diperbarui");
    setSaving(false);

    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
        Ubah Status
      </label>

      <div className="relative">
        <select
          value={status}
          disabled={saving}
          onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {saving && (
          <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-blue-600" />
        )}
      </div>

      {message && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}
    </div>
  );
}
