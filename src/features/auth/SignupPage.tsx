import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmationPrompt } from "@/components/ConfirmationPrompt";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

    if (error) return;

    toast.success("Account created!");
    setSignupComplete(true);
  };

  if (signupComplete) {
    return <ConfirmationPrompt />
  }
  
  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="username" className="block text-sm text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            {...register("username")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
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
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-5 text-sm text-[#9b8d88]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#75493c] underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};
