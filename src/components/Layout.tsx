import { useAuthStore } from "@/stores/authStore";
import { Link, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { BookOpen, LogOut, Menu, Settings, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { useThemeStore } from "@/stores/themeStore";
import { MessageCircle } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export const Layout = () => {
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--text)">
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--surface)/90 px-4 py-3 backdrop-blur-sm sm:px-8">
        <nav className="content-width flex items-center justify-between gap-3">
          {user ? (
            <>
              <Link
                to={user ? "/dashboard" : "/"}
                className="flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-2.5 py-2 font-semibold text-(--primary) shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--surface) text-(--primary)">
                  <BookOpen size={18} strokeWidth={2.5} />
                </span>
                <span className="font-display text-base sm:text-lg">
                  Daily Bible Reading
                </span>
              </Link>

              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-(--border) bg-(--surface-strong) text-(--primary) md:hidden"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div
                className={`${
                  menuOpen ? "flex" : "hidden"
                } absolute left-4 right-4 top-[calc(100%+0.5rem)] z-20 flex-col gap-1 rounded-2xl border border-(--border) bg-(--surface) p-2.5 shadow-[0_18px_40px_var(--shadow)] md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
              >
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/progress"
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong) md:px-3 md:py-2"
                >
                  Progress
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/notes"
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong) md:px-3 md:py-2"
                >
                  Notes
                </Link>
                <button
                  type="button"
                  onClick={handleSignout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong) md:hidden"
                >
                  <LogOut size={16} /> Sign out
                </button>

                <div className="border-t border-(--border) pt-2 md:hidden">
                  <button
                    type="button"
                    aria-label="Open reading settings"
                    onClick={() => {
                      setSettingsOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong)"
                  >
                    <Settings size={18} /> Settings
                  </button>

                  <button
                    type="button"
                    aria-label="Toggle theme"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--muted-strong) hover:bg-(--surface-strong)"
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    {isDark ? "Light mode" : "Dark mode"}
                  </button>
                </div>

                <div className="hidden md:flex md:items-center md:gap-1 md:border-l md:border-(--border) md:pl-2">
                  <button
                    type="button"
                    aria-label="Open reading settings"
                    onClick={() => setSettingsOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-(--muted-strong) transition hover:bg-(--surface-strong) hover:text-(--primary)"
                  >
                    <Settings size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Toggle theme"
                    onClick={toggleTheme}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-(--muted-strong) transition hover:bg-(--surface-strong) hover:text-(--primary)"
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleSignout}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-(--muted-strong) transition hover:bg-(--surface-strong) hover:text-red-600"
                    aria-label="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-(--primary)"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--surface-strong)">
                  <BookOpen size={18} />
                </span>
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
      {user && (
        <button
          onClick={() => setFeedbackOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary) text-white shadow-[0_10px_25px_rgba(117,73,60,0.25)] transition hover:bg-(--primary-strong)"
        >
          <MessageCircle size={20} />
        </button>
      )}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
};
