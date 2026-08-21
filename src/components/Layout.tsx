import { useAuthStore } from "@/stores/authStore";
import { Link, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const Layout = () => {
  const user = useAuthStore((state) => state.user);

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-2xl items-center gap-6">
          {user ? (
            <>
              <Link to="/" className="font-semibold">
                Daily Bile Reading
              </Link>
              <Link to="/progress" className="text-gray-600">
                Progress
              </Link>
              <Link to="/notes" className="text-gray-600">
                Notes
              </Link>
              <button onClick={handleSignout} className="ml-auto text-gray-600">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600">
                Login
              </Link>
              <Link to="/signup" className="text-gray-600">
                Sign up
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
