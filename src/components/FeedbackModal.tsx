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
      <h2 className="font-display text-2xl">Got feedback?</h2>
      <p>Bugs, ideas, anything - goes straight to the developer.</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="What's on your mind?"
        className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5"
        >
          Cancel
        </button>
        <button
          onClick={() => submitFeedback.mutate(message)}
          disabled={!message.trim() || submitFeedback.isPending}
          className="flex-1 rounded-lg bg-[#75493c] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {submitFeedback.isPending ? "Sending..." : "Send"}
        </button>
      </div>
    </Modal>
  );
};
