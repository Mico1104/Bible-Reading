import { MailCheck } from "lucide-react";

export const ConfirmationPrompt = () => {
  return (
    <div className="mx-auto max-w-md px-2 text-center sm:px-0">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-(--border) bg-(--surface-muted) text-(--primary) shadow-sm">
        <MailCheck size={28} strokeWidth={2.2} />
      </div>

      <h1 className="mt-6 font-display text-3xl leading-tight text-(--text) sm:text-4xl">
        Check your email.
      </h1>

      <p className="mt-3 text-base leading-7 text-(--muted-strong) sm:text-lg">
        We&apos;ve sent a confirmation link to your inbox. Click it to activate
        your account — you can close this tab once you&apos;re done.
      </p>
    </div>
  );
};
