import { Download } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const PWAInstallPrompt = () => {
  const { canInstall, installApp } = usePWA();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border bg-background p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">Install Daily Word</h3>
          <p className="text-sm text-muted-foreground">
            Install the app for a faster, app-like experience.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={installApp}
        className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground"
      >
        Install App
      </button>
    </div>
  );
};

export default PWAInstallPrompt;