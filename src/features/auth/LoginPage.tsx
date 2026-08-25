import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { toast} from "sonner"

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
toast.error("Incorrect email/username or password")
      return;
    }

toast.success("Welcome back!");
    navigate("/dashboard");
  };
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="identifier" className="block text-sm text-gray-700">
            Username or email
          </label>
          <input
            type="text"
            id="identifier"
            {...register("identifier")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600">
              {errors.identifier.message}
            </p>
          )}
        </div>
        <label htmlFor="password" className="block text-sm text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register("password")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-sm text-[#9b8d88]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#75493c] underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};
