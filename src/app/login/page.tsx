import { Suspense } from "react";
import LoginForm from "./login-form";

function LoginLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed55,transparent_35%)]" />
      <div className="relative z-10 rounded-3xl border border-white/10 bg-white/10 px-8 py-6 text-center backdrop-blur">
        <p className="text-sm font-semibold text-slate-200">
          Memuat halaman login...
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
