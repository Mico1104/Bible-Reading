import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  isDark: boolean;
  themeMode: ThemeMode;
  initializeTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const getSystemDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (mode: ThemeMode) => {
  const isDark = mode === "system" ? getSystemDark() : mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  return isDark;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  themeMode: "system",

  initializeTheme: () => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    const mode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    const isDark = applyTheme(mode);
    set({ isDark, themeMode: mode });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateFromSystem = () => {
      if (get().themeMode === "system") {
        const nextDark = applyTheme("system");
        set({ isDark: nextDark });
      }
    };

    media.addEventListener?.("change", updateFromSystem);
    window.addEventListener("storage", () => {
      const nextStored = localStorage.getItem("theme") as ThemeMode | null;
      const nextMode =
        nextStored === "light" ||
        nextStored === "dark" ||
        nextStored === "system"
          ? nextStored
          : "system";
      if (nextMode !== get().themeMode) {
        set({ themeMode: nextMode });
        applyTheme(nextMode);
      }
    });
  },

  setThemeMode: (mode) => {
    localStorage.setItem("theme", mode);
    const isDark = applyTheme(mode);
    set({ isDark, themeMode: mode });
  },

  toggleTheme: () => {
    const nextMode = get().isDark ? "light" : "dark";
    localStorage.setItem("theme", nextMode);
    const isDark = applyTheme(nextMode);
    set({ isDark, themeMode: nextMode });
  },
}));
