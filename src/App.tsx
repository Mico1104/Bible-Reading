import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { router } from "./router";
import { useEffect } from "react";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
