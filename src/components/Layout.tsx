import { Link, Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-2xl items-center gap-6">
          <Link to="/" className="font-semibold">
            Daily Bile Reading
          </Link>
          <Link to="/progress" className="text-gray-600">
            Progress
          </Link>
          <Link to="/notes" className="text-gray-600">
            Notes
          </Link>
          <Link to="/login" className="ml-auto text-gray-600">
            Login
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
