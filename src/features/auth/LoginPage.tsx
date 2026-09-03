import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { PasswordInput } from "@/components/PasswordInput";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter a your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    let email = values.identifier;

    if (!email.includes("@")) {
      const { data, error } = await supabase.rpc("get_email_for_username", {
        lookup_username: values.identifier,
      });

      if (error || !data) {
        setError("identifier", {
          message: "No account found with that username",
        });
        toast.error("No account found with that username");
        return;
      }
      email = data;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    });

    if (signInError) {
      setError("password", { message: "Incorrect email/username or password" });
      toast.error("Incorrect email/username or password");
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
  };
  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-md px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold text-(--text)">Log in</h1>
      <p className="mt-2 text-sm text-(--muted-strong)">Pick up where you left off.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="identifier" className="block text-sm font-semibold text-(--text)">
            Username or email
          </label>
          <input
            type="text"
            id="identifier"
            {...register("identifier")}
            className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
          />
          {errors.identifier && (
            <p className="mt-2 text-sm text-(--danger)">
              {errors.identifier.message}
            </p>
          )}
        </div>
        <label htmlFor="password" className="block text-sm font-semibold text-(--text)">
          Password
        </label>
        <PasswordInput id="password" {...register("password")} />
        {errors.password && (
          <p className="mt-2 text-sm text-(--danger)">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-(--primary) px-4 py-3 font-semibold text-white hover:bg-(--primary-strong) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link to="/forgot-password" className="font-medium text-(--primary) underline underline-offset-4">Forgot password?</Link>
      </p>
      <p className="mt-5 text-center text-sm text-(--muted-strong)">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-(--primary) underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
      </div>
    </div>
  );
};
