import { useAuthStore } from "@/stores/authStore";
import { Navigate, Link } from "react-router-dom";

export const LandingPage = () => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="tex-4xl font-semibold">
        Two Chapters, One Verse. A Deeper Walk With God.
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Spend time in God's Word each day - read two chapters, treasure one
        verse in your heart, and grow closer to Him. Build a faithful habit,keep
        your reading streak, and let Scripture shape your daily walk.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/signup"
          className="rounded-md bg-gray-900 px-6 py-3 text-white"
        >
          Get started
        </Link>
        
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-gray-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
};
