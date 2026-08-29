import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { router } from "./router";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import {Toaster} from "sonner"
import { useThemeStore } from "./stores/themeStore";

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const initializeTheme = useThemeStore((state) => state.initializeTheme)

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12">
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors/>
      </div>
    </QueryClientProvider>
  );
}

export default App;
