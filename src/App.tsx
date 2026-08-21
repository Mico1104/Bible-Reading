import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { router } from "./router";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
