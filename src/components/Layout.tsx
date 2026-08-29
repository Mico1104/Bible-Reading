import { useAuthStore } from "@/stores/authStore";
import { Link, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { BookOpen, LogOut, Menu, Settings, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { useThemeStore } from "@/stores/themeStore";

export const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--text)">
      <header className="relative border-b border-(--border) bg-(--surface)/90 px-4 py-4 backdrop-blur-sm sm:px-8">
        <nav className="content-width flex items-center justify-between gap-4">
          {user ? (
            <>
              <Link
                to={user ? "/dashboard" : "/"}
                className="flex items-center gap-2 font-semibold text-(--primary)"
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
                className="rounded-lg p-2 text-(--primary) md:hidden"
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>

              <div
                className={`${
                  menuOpen ? "flex" : "hidden"
                } absolute left-4 right-4 top-18 z-20 flex-col gap-1 rounded-2xl border border-(--border) bg-(--surface) p-3 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
              >
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/progress"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong)"
                >
                  Progress
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/notes"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong)"
                >
                  Notes
                </Link>
                <button
                  type="button"
                  onClick={handleSignout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong)"
                >
                  <LogOut size={16} /> Sign out
                </button>

                <button
                  type="button"
                  aria-label="Open reading settings"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-center rounded-lg p-2 text-(--muted-strong) hover:bg-(--surface-strong)"
                >
                  <Settings size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                  className="flex items-center justify-center rounded-lg p-2 text-(--muted-strong) hover:bg-(--surface-strong)"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-(--primary)"
              >
                <BookOpen size={20} />
                <span className="font-display text-lg">The Daily Word</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      <SettingsModal
        key={settingsOpen ? "settings-open" : "settings-closed"}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <main>
        <Outlet />
      </main>
    </div>
  );
};
