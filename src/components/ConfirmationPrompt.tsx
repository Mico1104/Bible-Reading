import { MailCheck } from "lucide-react";

export const ConfirmationPrompt = () => {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 items-center justify-center rounded-full bg-[#eadbd5] text-[#75493c]">
        <MailCheck size={26} />
      </div>
      <h1 className="mt-6 font-display text-3xl">Check your email.</h1>
      <p>
        We've sent a confirmation link to your inbox. Click it to activate your
        account - you can close this tab once you're done.
      </p>
    </div>
  );
};
