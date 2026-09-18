import { useState } from "react";
import { motion } from "motion/react";
import { UserRound, AtSign, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "../auth/useProfile";
import { toast } from "sonner";

type ProfileSetupContentProps = {
  onComplete: () => void;
};

export const ProfileSetUpContent = ({
  onComplete,
}: ProfileSetupContentProps) => {
  const userId = useAuthStore((state) => state.user?.id);
  const { data: profile, isLoading } = useProfile();

  const [editedName, setEditedName] = useState<string | null>(null);
  const [editedUsername, setEditedUsername] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const name = editedName ?? profile?.name ?? "";
  const username = editedUsername ?? profile?.username ?? "";

  const handleContinue = async () => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!trimmedUsername) {
      toast.error("Please choose a username.");
      return;
    }

    if (!/^[A-Za-z0-9_]+$/.test(trimmedUsername)) {
      toast.error(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    if (!userId) {
      toast.error("You must be signed in.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: trimmedName,
        username: trimmedUsername,
      })
      .eq("id", userId);

    if (error) {
      setIsSaving(false);

      if (error.code === "23505") {
        toast.error("That username is already taken.");
        return;
      }

      toast.error(error.message || "Unable to save your profile.");
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: trimmedName,
        username: trimmedUsername,
      },
    });

    if (authError) {
      console.warn("Unable to update auth metadata:", authError);
    }

    setIsSaving(false);

    toast.success("Profile saved!");
    onComplete();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-sm text-(--muted-strong)">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
          <UserRound size={12} />
          Your profile
        </div>

        <div>
          <h1 className="font-display text-3xl leading-tight text-(--text) sm:text-4xl">
            Make your profile yours
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-(--muted-strong) sm:text-base">
            Choose the name and username you&apos;d like to use in Daily Word.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-sm font-medium text-(--muted-strong)"
          >
            Name
          </label>

          <div className="mt-2 flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5">
            <UserRound
              size={18}
              className="shrink-0 text-(--primary)"
            />

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent text-sm font-medium text-(--text) outline-none placeholder:text-(--muted)"
              autoComplete="name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-username"
            className="block text-sm font-medium text-(--muted-strong)"
          >
            Username
          </label>

          <div className="mt-2 flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5">
            <AtSign
              size={18}
              className="shrink-0 text-(--primary)"
            />

            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setEditedUsername(e.target.value)}
              placeholder="your_username"
              className="w-full bg-transparent text-sm font-medium text-(--text) outline-none placeholder:text-(--muted)"
              autoComplete="username"
            />
          </div>

          <p className="mt-2 text-xs text-(--muted)">
            Letters, numbers, and underscores only.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={isSaving}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Continue"}

        {!isSaving && (
          <ArrowRight
            size={18}
            className="transition group-hover:translate-x-0.5"
          />
        )}
      </button>
    </motion.div>
  );
};

