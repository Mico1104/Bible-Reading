import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { motion } from "motion/react";

const forgotSchema = z.object({
  email: z.email("Enter a valid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }: ForgotFormValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Unable to send the reset link");
      return;
    }
    setSent(true);
    toast.success("Check your email for a reset link");
  };

  if (sent) {
    return (
      <motion.div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-4 py-10 sm:px-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-full rounded-3xl border border-(--border) bg-(--surface) p-6 text-center shadow-sm sm:p-8">
        <CheckCircle2 className="mx-auto text-(--success)" size={42} />
        <h1 className="mt-4 text-2xl font-semibold text-(--text)">Check your email</h1>
        <p className="mt-3 text-(--muted-strong)">
          We sent a password reset link to your inbox.
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--primary) underline underline-offset-4">
          <ArrowLeft size={16} /> Back to login
        </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-4 py-10 sm:px-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-full rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold text-(--text)">Forgot your password?</h1>
      <p className="mt-2 text-sm text-(--muted-strong)">Enter your email and we&apos;ll send a secure reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-(--text)">
            Email
          </label>
          <div className="relative mt-2">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" size={18} />
          <input
            type="email"
            id="email"
            {...register("email")}
            className="w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 pl-10 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
          />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-(--danger)">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-(--primary) px-4 py-3 font-semibold text-white hover:bg-(--primary-strong) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--primary) underline underline-offset-4">
        <ArrowLeft size={16} /> Back to login
      </Link>
      </div>
    </motion.div>
  );
};
