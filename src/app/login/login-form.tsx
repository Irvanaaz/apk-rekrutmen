"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function getAuthErrorMessage(message: string) {
  const errorMessage = message.toLowerCase();

  if (errorMessage.includes("email rate limit exceeded")) {
    return "Server sedang sibuk. Silakan coba beberapa saat lagi.";
  }

  if (errorMessage.includes("user already registered")) {
    return "Email ini sudah terdaftar. Silakan login menggunakan akun tersebut.";
  }

  if (errorMessage.includes("invalid login credentials")) {
    return "Email belum terdaftar atau password yang Anda masukkan salah.";
  }

  if (errorMessage.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Silakan cek inbox atau spam email Anda untuk melakukan verifikasi akun.";
  }

  if (errorMessage.includes("invalid email")) {
    return "Format email tidak valid.";
  }

  if (errorMessage.includes("password")) {
    return "Password belum memenuhi ketentuan. Gunakan minimal 6 karakter.";
  }

  return "Gagal memproses. Silakan coba beberapa saat lagi.";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo");

  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(getAuthErrorMessage(loginError.message));
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError("Gagal membaca data akun. Silakan coba login ulang.");
      setLoading(false);
      return;
    }

    if (!profile) {
      const fullNameFromMetadata =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : user.email?.split("@")[0] || "Kandidat";

      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullNameFromMetadata,
          role: "candidate",
        })
        .select("role")
        .single();

      if (createProfileError || !newProfile) {
        setError(
          "Akun berhasil login, tetapi profil akun belum siap. Silakan hubungi admin.",
        );
        setLoading(false);
        return;
      }

      profile = newProfile;
    }

    if (profile.role === "hr") {
      router.push("/hr/dashboard");
    } else {
      router.push(redirectTo || "/beranda");
    }

    router.refresh();
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const { error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/login`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (registerError) {
      setError(getAuthErrorMessage(registerError.message));
      setLoading(false);
      return;
    }

    setMessage(
      "Register berhasil. Silakan cek email untuk konfirmasi akun, lalu login kembali.",
    );
    setMode("login");
    setPassword("");
    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-10 text-white">
      <Link
        href="/beranda"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Beranda
      </Link>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

      <section className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <BriefcaseBusiness className="h-7 w-7 text-blue-300" />
          </div>

          <h1 className="text-2xl font-black tracking-tight">HireHub</h1>
          <p className="mt-1 text-sm text-slate-300">
            Sistem rekrutmen dan seleksi kandidat
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Selamat Datang" : "Buat Akun Kandidat"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {mode === "login"
                ? "Login untuk masuk ke sistem rekrutmen."
                : "Daftar untuk mulai melamar pekerjaan."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setMessage(null);
              }}
              className={`rounded-xl py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setMessage(null);
              }}
              className={`rounded-xl py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
            {mode === "register" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Lengkap
                </label>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <User className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  placeholder="Minimal 6 karakter"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <AlertBox type="error" title="Gagal memproses" message={error} />
            )}

            {message && (
              <AlertBox type="success" title="Berhasil" message={message} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : mode === "login"
                  ? "Masuk Sekarang"
                  : "Daftar Akun"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Kandidat dapat mendaftar melalui menu register.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

type AlertBoxProps = {
  type: "success" | "error";
  title: string;
  message: string;
};

function AlertBox({ type, title, message }: AlertBoxProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`mb-4 flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
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
    </div>
  );
}
