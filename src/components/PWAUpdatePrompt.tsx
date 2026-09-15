import { RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";

const PWAUpdatePrompt = () => {
  const { updateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!updateAvailable || dismissed) return null;

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await updateApp();
    } catch (error) {
      console.error("Failed to update app:", error);
      setUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-(--border) bg-(--background) p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">Update available</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                A new version of Daily Word is ready.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss update prompt"
              className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="mt-3 w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updating ? "Updating..." : "Update Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;