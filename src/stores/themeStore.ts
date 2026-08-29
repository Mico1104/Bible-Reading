import { create } from "zustand";

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
};


export const useThemeStore = create<ThemeState>((set, get)  => ({
    isDark: false,

    initializeTheme: () => {
        const stored = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = stored ? stored === 'dark' : prefersDark;

        document.documentElement.classList.toggle("dark", isDark);
        set({isDark});
    },

    toggleTheme: () => {
        const newIsDark = !get().isDark;
        document.documentElement.classList.toggle("dark", newIsDark);
        localStorage.setItem("theme", newIsDark ? "dark" : "light");
        set
    }
}))