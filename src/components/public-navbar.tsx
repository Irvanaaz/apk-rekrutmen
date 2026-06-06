"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  User,
  UserCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PublicNavbar() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserName(null);
        setUserRole(null);
        setAvatarUrl(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      const name =
        profile?.full_name?.split(" ")[0] ||
        profile?.email?.split("@")[0] ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(name);
      setUserRole(profile?.role || "candidate");

      if (profile?.role === "candidate") {
        const { data: candidateProfile } = await supabase
          .from("candidate_profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        setAvatarUrl(candidateProfile?.avatar_url || null);
      }
    };

    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUserName(null);
    setUserRole(null);
    setAvatarUrl(null);
    setOpenMenu(false);

    router.push("/beranda");
    router.refresh();
  };

  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <BriefcaseBusiness className="h-6 w-6 text-blue-300" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">HireHub</h1>
          <p className="text-xs text-slate-300">Career Portal</p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {userName ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(!openMenu)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 p-1 shadow-lg shadow-black/10 backdrop-blur transition hover:scale-105 hover:bg-white/20"
              title="Menu akun"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto profil"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <UserCircle className="h-6 w-6" />
                </div>
              )}
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Foto profil"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <UserCircle className="h-7 w-7" />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-bold">Halo, {userName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {userRole === "hr" ? "HR Administrator" : "Kandidat"}
                      </p>
                    </div>
                  </div>
                </div>

                {userRole === "hr" ? (
                  <Link
                    href="/hr/dashboard"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    Dashboard HR
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/profil"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profil Saya
                    </Link>

                    <Link
                      href="/riwayat-lamaran"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ClipboardList className="h-4 w-4 text-slate-400" />
                      Riwayat Lamaran
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
