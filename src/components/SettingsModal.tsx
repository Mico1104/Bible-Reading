import { useProfile } from "@/features/auth/useProfile";
import { useUpdateSettings } from "@/features/settings/useUpdateSettings";
import { useState } from "react";
import { Modal } from "./Modal";

export const SettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: profile } = useProfile();
  const updateSettings = useUpdateSettings();
  const [chaptersPerDay, setChaptersPerDay] = useState(
    profile?.chapters_per_day ?? 2,
  );

  const handleSave = () => {
    updateSettings.mutate(chaptersPerDay, {
      onSuccess: onClose,
    });
  };

  return (
    <Modal isOpen={isOpen}>
      <h2 className="font-display text-2xl">Reading settings</h2>
      <label className="mt-6 block text-sm text-[#7e6862]">
        Chapters per day
      </label>
      <select
        value={chaptersPerDay}
        onChange={(e) => setChaptersPerDay(Number(e.target.value))}
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <div>
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-[#75493c] px-4 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {updateSettings.isPending ? 'Saving...' : }
        </button>
      </div>
    </Modal>
  );
};
