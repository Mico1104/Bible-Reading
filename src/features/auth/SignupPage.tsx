import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmationPrompt } from "@/components/ConfirmationPrompt";
import { Modal } from "@/components/Modal";
import { PasswordInput } from "@/components/PasswordInput";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password did not match",
    path: ["confirmPassword"],
  });

type SignFormValues = z.infer<typeof signUpSchema>;

export const SignupPage = () => {
  const [signupComplete, setSignupComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignFormValues>({ resolver: zodResolver(signUpSchema) });

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      toast.error(error.message || "Unable to sign in with Google");
    }
  };

  const onSubmit = async (values: SignFormValues) => {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          username: values.username,
        },
      },
    });

    if (error) {
      toast.error(error.message || "Unable to create your account");
      return;
    }

    // Supabase can return a user with no identities when the email
    // is already associated with an existing account.
    if (data.user && data.user.identities?.length === 0) {
      toast.error(
        "This email may already have an account. Try logging in or use a different email address.",
      );
      return;
    }

    toast.success("Account created!");
    setSignupComplete(true);
  };

  if (signupComplete) {
    return (
      <div className="min-h-[70vh]">
        <Modal isOpen={true}>
          <ConfirmationPrompt />
        </Modal>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-md px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-(--text)">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-(--muted-strong)">
          Start a flexible reading rhythm that works for you.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-(--text)"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-(--danger)">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-(--text)"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username")}
              className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
            />
            {errors.username && (
              <p className="mt-2 text-sm text-(--danger)">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-(--text)"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-(--danger)">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-(--text)"
            >
              Password
            </label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && (
              <p className="mt-2 text-sm text-(--danger)">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-(--text)"
            >
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
              className="mt-1"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-(--danger)">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-(--primary) px-4 py-3 font-semibold text-white hover:bg-(--primary-strong) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-(--border)" />
          <span className="text-xs font-medium uppercase tracking-wider text-(--muted)">
            or
          </span>
          <div className="h-px flex-1 bg-(--border)" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-4 py-3 font-semibold text-(--text) hover:bg-(--surface-muted) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
            />
            <path
              fill="#34A853"
              d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.5Z"
            />
            <path
              fill="#FBBC05"
              d="M6.53 13.59A5.86 5.86 0 0 1 6.22 12c0-.55.11-1.09.31-1.59V7.88H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.12l3.25-2.53Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.38l3.25 2.53C7.3 8.1 9.46 6.38 12 6.38Z"
            />
          </svg>
          Continue with Google
        </button>
        <p className="mt-5 text-center text-sm text-(--muted-strong)">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-(--primary) underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
