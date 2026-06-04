"use client";

import { useState } from "react";
import { Download, Eye, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CvActions({
  cvPath,
  fileName,
}: {
  cvPath: string | null;
  fileName: string | null;
}) {
  const supabase = createClient();
  const [loadingView, setLoadingView] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const handleView = async () => {
    if (!cvPath) {
      alert("CV kandidat belum tersedia.");
      return;
    }

    setLoadingView(true);

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(cvPath, 60);

    setLoadingView(false);

    if (error || !data?.signedUrl) {
      alert(error?.message || "Gagal membuka CV.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleDownload = async () => {
    if (!cvPath) {
      alert("CV kandidat belum tersedia.");
      return;
    }

    setLoadingDownload(true);

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(cvPath, 60, {
        download: fileName || "cv-kandidat",
      });

    setLoadingDownload(false);

    if (error || !data?.signedUrl) {
      alert(error?.message || "Gagal download CV.");
      return;
    }

    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = fileName || "cv-kandidat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!cvPath || !fileName) {
    return (
      <p className="text-sm leading-6 text-slate-500">CV belum tersedia.</p>
    );
  }

  return (
    <div>
      <p className="line-clamp-1 text-sm font-semibold text-slate-700">
        {fileName}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleView}
          disabled={loadingView}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingView ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          Lihat
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={loadingDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingDownload ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download
        </button>
      </div>
    </div>
  );
}
