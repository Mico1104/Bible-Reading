import { useAuthStore } from "@/stores/authStore";
import { Link, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#f7f4f1]">
      <header className="relative border-b border-[#e9e0db] bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
        <nav className="content-width flex items-center justify-between">
          {user ? (
            <>
              <Link
                to={user ? "/dashboard" : "/"}
                className="flex items-center gap-2 font-semibold text-[#75493c]"
              >
                <BookOpen size={20} strokeWidth={2.5} />
                <span className="font-display text-lg">
                  Daily Bible Reading
                </span>
              </Link>
              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMenuOpen((open) => !open)}
                className="rounded-lg p-2 text-[#75493c] md:hidden"
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
              <div
                className={`${menuOpen ? "flex" : "hidden"} absolute left-4 right-4 top-17.5 z-10 flex-col gap-1 rounded-xl border border-[#e9e0db] bg-white p-3 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:p-0 md:shadow-none`}
              >
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/progress"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#7e6862] hover:bg-[#f7f4f1]"
                >
                  Progress
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/notes"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#7e6862] hover:bg-[#f7f4f1]"
                >
                  Notes
                </Link>
                <button
                  onClick={handleSignout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#7e6862] hover:bg-[#f7f4f1]"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-[#75493c]"
              >
                <BookOpen size={20} />
                <span className="font-display text-lg">The Daily Word</span>
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
