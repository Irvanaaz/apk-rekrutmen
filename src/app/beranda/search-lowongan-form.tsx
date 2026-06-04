"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type JobSuggestion = {
  id: string;
  title: string;
};

export default function SearchLowonganForm({
  defaultQuery,
  suggestions,
}: {
  defaultQuery: string;
  suggestions: JobSuggestion[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState(defaultQuery);
  const [focused, setFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return [];

    return suggestions
      .filter((job) => job.title.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [query, suggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const keyword = query.trim();

    if (!keyword) {
      router.push("/beranda");
      return;
    }

    router.push(`/beranda?q=${encodeURIComponent(keyword)}`);
  };

  const handleSelectSuggestion = (title: string) => {
    setQuery(title);
    setFocused(false);
    router.push(`/beranda?q=${encodeURIComponent(title)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 max-w-2xl">
      <div className="flex items-center rounded-2xl bg-white p-2 shadow-2xl">
        <Search className="ml-4 h-5 w-5 text-slate-400" />

        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 150);
          }}
          onChange={(e) => {
            setQuery(e.target.value);

            if (!focused) {
              setFocused(true);
            }
          }}
          placeholder="Cari judul posisi..."
          className="w-full px-4 py-3 text-sm text-slate-900 outline-none"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Cari
        </button>
      </div>

      {focused && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Rekomendasi Lowongan
          </div>

          {filteredSuggestions.map((job) => (
            <button
              key={job.id}
              type="button"
              onMouseDown={() => handleSelectSuggestion(job.title)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-600"
            >
              <Search className="h-4 w-4 text-slate-400" />
              {job.title}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
