"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  LinkIcon,
  Loader2,
  Mail,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { createClient } from "@/lib/supabase/client";

type CandidateProfile = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  address_detail: string | null;
  province_id: string | null;
  province_name: string | null;
  city_id: string | null;
  city_name: string | null;
  birth_date: string | null;
  education_level: string | null;
  major: string | null;
  experience_years: number | null;
  experience_months: number | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  cv_file_name: string | null;
  avatar_url: string | null;
};

type RegionItem = {
  id: string;
  name: string;
};

export default function ProfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/beranda";

  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [email, setEmail] = useState("");
  const [profileId, setProfileId] = useState("");
  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [cityId, setCityId] = useState("");
  const [cityName, setCityName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [major, setMajor] = useState("");
  const [experienceMonths, setExperienceMonths] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const getProvinces = async () => {
      try {
        const response = await fetch(
          "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
        );

        const data = (await response.json()) as RegionItem[];
        setProvinces(data);
      } catch {
        setError("Gagal memuat daftar provinsi. Coba refresh halaman.");
      }
    };

    getProvinces();
  }, []);

  useEffect(() => {
    const getCities = async () => {
      if (!provinceId) {
        setCities([]);
        return;
      }

      setLoadingCities(true);

      try {
        const response = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
        );

        const data = (await response.json()) as RegionItem[];
        setCities(data);
      } catch {
        setError("Gagal memuat daftar kota/kabupaten.");
      } finally {
        setLoadingCities(false);
      }
    };

    getCities();
  }, [provinceId]);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirectTo=/profil");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("email rate limit exceeded")) {
          setError("Server sedang sibuk. Silakan coba beberapa saat lagi.");
        } else if (errorMessage.includes("user already registered")) {
          setError(
            "Email ini sudah terdaftar. Silakan login atau gunakan email lain.",
          );
        } else if (errorMessage.includes("invalid email")) {
          setError("Format email tidak valid.");
        } else if (errorMessage.includes("password")) {
          setError(
            "Password belum memenuhi ketentuan. Gunakan minimal 6 karakter.",
          );
        } else {
          setError("Gagal memuat profil kandidat. Silakan coba refresh halaman.");
        }

        setLoading(false);
        return;
      }

      if (!data) {
        const fullNameFromMetadata =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";

        setProfileId("");
        setFullName(fullNameFromMetadata);
        setPhone("");
        setProvinceId("");
        setProvinceName("");
        setCityId("");
        setCityName("");
        setAddressDetail("");
        setBirthDate("");
        setEducationLevel("");
        setMajor("");
        setExperienceMonths("0");
        setSkills("");
        setLinkedinUrl("");
        setGithubUrl("");
        setPortfolioUrl("");
        setCvFileName("");
        setAvatarUrl("");

        setLoading(false);
        return;
      }

      const candidate = data as CandidateProfile;

      setProfileId(candidate.id);
      setFullName(candidate.full_name || "");
      setPhone(candidate.phone || "");
      setProvinceId(candidate.province_id || "");
      setProvinceName(candidate.province_name || "");
      setCityId(candidate.city_id || "");
      setCityName(candidate.city_name || "");
      setAddressDetail(candidate.address_detail || candidate.address || "");
      setBirthDate(candidate.birth_date || "");
      setEducationLevel(candidate.education_level || "");
      setMajor(candidate.major || "");

      const oldExperienceMonths =
        candidate.experience_months ??
        (candidate.experience_years ? candidate.experience_years * 12 : 0);

      setExperienceMonths(String(oldExperienceMonths));
      setSkills((candidate.skills || []).join(", "));
      setLinkedinUrl(candidate.linkedin_url || "");
      setGithubUrl(candidate.github_url || "");
      setPortfolioUrl(candidate.portfolio_url || "");
      setCvFileName(candidate.cv_file_name || "");
      setAvatarUrl(candidate.avatar_url || "");

      setLoading(false);
    };

    getProfile();
  }, [router, supabase]);

  const skillList = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const avatarImage = previewAvatar || avatarUrl;

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    setPreviewAvatar(file ? URL.createObjectURL(file) : "");
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(
      (province) => province.id === value,
    );

    setProvinceId(value);
    setProvinceName(selectedProvince?.name || "");
    setCityId("");
    setCityName("");
  };

  const handleCityChange = (value: string) => {
    const selectedCity = cities.find((city) => city.id === value);

    setCityId(value);
    setCityName(selectedCity?.name || "");
  };

  const validateProfile = () => {
    if (!fullName.trim()) return "Nama lengkap wajib diisi.";
    if (!phone.trim()) return "Nomor HP wajib diisi.";
    if (!birthDate) return "Tanggal lahir wajib diisi.";
    if (!educationLevel.trim()) return "Pendidikan terakhir wajib diisi.";
    if (!major.trim()) return "Jurusan wajib diisi.";
    if (!provinceId) return "Provinsi wajib dipilih.";
    if (!cityId) return "Kota/Kabupaten wajib dipilih.";
    if (!addressDetail.trim()) return "Alamat lengkap wajib diisi.";
    if (skillList.length === 0) return "Daftar skill wajib diisi.";
    if (!cvFileName && !cvFile) return "CV wajib diupload.";

    if (experienceMonths === "") {
      return "Pengalaman kerja wajib diisi. Isi 0 jika belum memiliki pengalaman.";
    }

    if (Number(experienceMonths) < 0) {
      return "Pengalaman kerja tidak boleh kurang dari 0 bulan.";
    }

    return "";
  };

  const handleViewCv = async () => {
    if (!cvFileName) {
      setError("CV belum tersedia.");
      return;
    }

    const { data } = await supabase
      .from("candidate_profiles")
      .select("cv_url")
      .eq("id", profileId)
      .single();

    if (!data?.cv_url) {
      setError("File CV tidak ditemukan.");
      return;
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from("cvs").createSignedUrl(data.cv_url, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      setError("Gagal membuka CV.");
      return;
    }

    window.open(signedUrlData.signedUrl, "_blank");
  };

  const handleDeleteCv = async () => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus CV? Kamu tidak bisa melamar sebelum upload CV lagi.",
    );

    if (!confirmDelete) return;

    setSaving(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("candidate_profiles")
      .update({
        cv_url: null,
        cv_file_name: null,
        is_complete: false,
      })
      .eq("id", profileId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setCvFileName("");
    setCvFile(null);
    setMessage("CV berhasil dihapus. Upload CV baru sebelum melamar.");
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const validationError = validateProfile();

    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    let finalAvatarUrl = avatarUrl;
    let finalCvFileName = cvFileName;
    let finalCvUrl: string | null = null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${Date.now()}-avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
        });

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      finalAvatarUrl = publicUrlData.publicUrl;
    }

    if (cvFile) {
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${Date.now()}-cv.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: cvUploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, cvFile, {
          upsert: true,
        });

      if (cvUploadError) {
        setError(cvUploadError.message);
        setSaving(false);
        return;
      }

      finalCvUrl = filePath;
      finalCvFileName = cvFile.name;
    }

    const monthsValue = experienceMonths ? Number(experienceMonths) : 0;

    const updatePayload: Record<string, unknown> = {
      full_name: fullName,
      phone,
      province_id: provinceId,
      province_name: provinceName,
      city_id: cityId,
      city_name: cityName,
      address_detail: addressDetail,
      address: addressDetail,
      birth_date: birthDate || null,
      education_level: educationLevel,
      major,
      experience_months: monthsValue,
      experience_years: Math.floor(monthsValue / 12),
      skills: skillList,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      avatar_url: finalAvatarUrl,
      cv_file_name: finalCvFileName,
      is_complete: true,
    };

    if (finalCvUrl) {
      updatePayload.cv_url = finalCvUrl;
    }

    let saveError: { message: string } | null = null;
    let savedProfileId = profileId;

    if (profileId) {
      const { error: updateError } = await supabase
        .from("candidate_profiles")
        .update(updatePayload)
        .eq("id", profileId);

      saveError = updateError;
    } else {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: userId,
          ...updatePayload,
        })
        .select("id")
        .single();

      saveError = insertError;
      savedProfileId = insertedProfile?.id || "";
    }

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    if (savedProfileId) {
      setProfileId(savedProfileId);
    }

    setAvatarUrl(finalAvatarUrl);
    setCvFileName(finalCvFileName);
    setAvatarFile(null);
    setPreviewAvatar("");
    setCvFile(null);

    setMessage("Profil berhasil diperbarui. Kamu akan diarahkan ke halaman berikutnya.");
    setSaving(false);

    setTimeout(() => {
      router.push(redirectTo);
      router.refresh();
    }, 800);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 shadow-sm backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
          <p className="font-semibold">Memuat profil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />

        <PublicNavbar />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <User className="h-4 w-4" />
              Profil Kandidat
            </div>

            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Kelola profil kandidat.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Perbarui informasi diri, lokasi, pengalaman, CV, dan skill agar HR
              dapat menilai profil kamu dengan lebih baik.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-[300px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-950 p-6 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-24 w-24">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Foto profil"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-blue-200 ring-4 ring-white/10">
                      <User className="h-10 w-10" />
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleAvatarChange(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>

                <h2 className="mt-5 text-lg font-bold">
                  {fullName || "Nama Kandidat"}
                </h2>

                <div className="mt-2 flex max-w-full items-center justify-center gap-2 text-xs text-slate-300">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">CV Saat Ini</p>

                  {cvFileName && (
                    <button
                      type="button"
                      onClick={handleDeleteCv}
                      className="rounded-full bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                      title="Hapus CV"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                  <FileText className="h-5 w-5 shrink-0 text-blue-300" />
                  <p className="truncate text-sm text-slate-200">
                    {cvFile ? cvFile.name : cvFileName || "CV belum tersedia"}
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  {cvFileName && !cvFile && (
                    <button
                      type="button"
                      onClick={handleViewCv}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat CV
                    </button>
                  )}

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    <Upload className="h-4 w-4" />
                    {cvFile || cvFileName ? "Ganti CV" : "Upload CV"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {cvFile && (
                  <p className="mt-3 rounded-xl bg-blue-500/10 px-3 py-2 text-center text-xs text-blue-100">
                    CV baru dipilih. Klik Simpan Profil untuk menyimpan.
                  </p>
                )}
              </div>

              <div className="mt-5 grid gap-3">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    <LinkIcon className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}

                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                )}

                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
              </div>

              <NextLink
                href="/riwayat-lamaran"
                className="mt-5 flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Lihat Riwayat Lamaran
              </NextLink>
            </aside>

            <form onSubmit={handleSave} className="p-6 md:p-8">
              <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Informasi Profil
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Data ini digunakan HR untuk menilai profil kandidat.
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
                      Simpan Profil
                    </>
                  )}
                </button>
              </div>

              {message && (
                <AlertBox type="success" title="Berhasil" message={message} />
              )}

              {error && (
                <AlertBox
                  type="error"
                  title="Gagal menyimpan"
                  message={error}
                />
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                    Data Pribadi
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Nama Lengkap"
                      value={fullName}
                      onChange={setFullName}
                      required
                    />

                    <Input
                      label="Nomor HP"
                      value={phone}
                      onChange={setPhone}
                      required
                    />

                    <Input
                      label="Tanggal Lahir"
                      type="date"
                      value={birthDate}
                      onChange={setBirthDate}
                    />

                    <Input
                      label="Pendidikan Terakhir"
                      value={educationLevel}
                      onChange={setEducationLevel}
                      required
                    />

                    <Input label="Jurusan" value={major} onChange={setMajor} />

                    <Input
                      label="Pengalaman Kerja"
                      type="number"
                      value={experienceMonths}
                      onChange={setExperienceMonths}
                      placeholder="Contoh: 18"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Pengalaman kerja diisi dalam bulan.
                  </p>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                    Lokasi
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Provinsi
                      </label>

                      <select
                        value={provinceId}
                        required
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">Pilih provinsi</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kota/Kabupaten
                      </label>

                      <select
                        value={cityId}
                        required
                        disabled={!provinceId || loadingCities}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {loadingCities
                            ? "Memuat kota..."
                            : "Pilih kota/kabupaten"}
                        </option>

                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <TextArea
                        label="Alamat Lengkap"
                        value={addressDetail}
                        onChange={setAddressDetail}
                        placeholder="Contoh: Jl. Meruya Selatan No. 10, RT/RW, Kecamatan..."
                        required
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                    Link Profesional
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="LinkedIn URL"
                      value={linkedinUrl}
                      onChange={setLinkedinUrl}
                    />

                    <Input
                      label="GitHub URL"
                      value={githubUrl}
                      onChange={setGithubUrl}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Portfolio URL"
                        value={portfolioUrl}
                        onChange={setPortfolioUrl}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
                    Skill Kandidat
                  </h3>

                  <TextArea
                    label="Daftar Skill"
                    value={skills}
                    onChange={setSkills}
                    placeholder="Contoh: React, Next.js, Python, FastAPI, Supabase, Figma"
                    required
                    rows={5}
                  />
                </div>
              </div>
            </form>
          </div>
        </motion.div>
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
        wrap="soft"
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
