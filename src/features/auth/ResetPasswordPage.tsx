import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PasswordInput } from "@/components/PasswordInput";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "motion/react";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }: ResetFormValues) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message || "Unable to update your password");
      return;
    }
    toast.success("Password updated!");
    navigate("/dashboard");
  };

  return (
    <motion.div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-4 py-10 sm:px-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-full rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-sm sm:p-8">
      <KeyRound className="text-(--primary)" size={30} />
      <h1 className="mt-4 text-2xl font-semibold text-(--text)">Set a new password</h1>
      <p className="mt-2 text-sm text-(--muted-strong)">Choose a strong password to keep your account secure.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-(--text)">
            New Password
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
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            {...register("confirmPassword")}
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
          {isSubmitting ? "Updating" : "Update password"}
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--primary) underline underline-offset-4">
        <ArrowLeft size={16} /> Back to login
      </Link>
      </div>
    </motion.div>
  );
};
