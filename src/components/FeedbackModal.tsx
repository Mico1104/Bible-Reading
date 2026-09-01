import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Modal } from "./Modal";

export const FeedbackModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const userId = useAuthStore((state) => state.user?.id);
  const [message, setMessage] = useState("");

  const submitFeedback = useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase.from("feedback").insert({
        user_id: userId,
        message,
      });
      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Thanks - feedback sent!");
      setMessage("");
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
            Feedback
          </p>
          <h2 className="mt-2 font-display text-2xl text-(--text) sm:text-3xl">
            Got feedback?
          </h2>
        </div>
        <p className="text-(--muted-strong)">
          Bugs, ideas, anything - goes straight to the developer.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="What's on your mind?"
          className="w-full rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-2.5 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary) placeholder:text-(--muted)"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-(--border) px-4 py-2.5 text-(--muted-strong) font-medium transition hover:bg-(--surface-strong)"
          >
            Cancel
          </button>
          <button
            onClick={() => submitFeedback.mutate(message)}
            disabled={!message.trim() || submitFeedback.isPending}
            className="flex-1 rounded-lg bg-(--primary) px-4 py-2.5 font-semibold text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
          >
            {submitFeedback.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
