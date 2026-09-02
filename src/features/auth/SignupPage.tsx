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

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Password did not match",
  path: ["confirmPassword"]
});

type SignFormValues = z.infer<typeof signUpSchema>;

export const SignupPage = () => {
  const [signupComplete, setSignupComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignFormValues>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (values: SignFormValues) => {
    const { error } = await supabase.auth.signUp({
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
      <h1 className="text-2xl font-semibold text-(--text)">Create your account</h1>
      <p className="mt-2 text-sm text-(--muted-strong)">Start a flexible reading rhythm that works for you.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-(--text)">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-(--danger)">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-(--text)">
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
          <label htmlFor="email" className="block text-sm font-semibold text-(--text)">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-(--danger)">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-(--text)">
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
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-(--text)">
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
