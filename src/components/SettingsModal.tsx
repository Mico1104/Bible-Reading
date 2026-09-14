import { useProfile } from "@/features/auth/useProfile";
import { useUpdateSettings } from "@/features/settings/useUpdateSettings";
import { useThemeStore } from "@/stores/themeStore";
import { useState } from "react";
import { Modal } from "./Modal";
import { subscribeToPushNotifications } from "@/lib/pushNotifications";

export const SettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: profile } = useProfile();
  const updateSettings = useUpdateSettings();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const [chaptersPerDay, setChaptersPerDay] = useState(
    profile?.chapters_per_day ?? 2,
  );
  const [translation, setTranslation] = useState(
    profile?.bible_translation ?? "web",
  );

  const [translationProvider, setTranslationProvider] = useState(
    profile?.translation_provider ?? "bible-api-com",
  );
  const [reminderTime, setReminderTime] = useState<string>(
    profile?.reminder_time ?? "",
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      setNotificationLoading(true);
      await subscribeToPushNotifications();
      setNotificationsEnabled(true);
    } catch (error) {
      console.error("Failed enabling notifications:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not enable notifications.",
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  const ENGLISH_VERSIONS = [
    { id: "web", name: "World English Bible" },
    { id: "kjv", name: "King James Version" },
    { id: "bbe", name: "Bible in Basic English" },
    { id: "asv", name: "American Standard Version" },
    { id: "darby", name: "Darby Bible" },
  ];

  const LANGUAGES = [
    { id: "b8d1feac6e94bd74-01", name: "Yoruba" },
    { id: "a36fc06b086699f1-02", name: "Igbo" },
    { id: "0ab0c764d56a715d-02", name: "Hausa" },
  ];

  const handleSave = () => {
    updateSettings.mutate(
      { chaptersPerDay, translation, translationProvider, reminderTime },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--muted)">
            Preferences
          </p>
          <h2 className="mt-2 font-display text-2xl text-(--text) sm:text-3xl">
            Reading settings
          </h2>
        </div>

        <div className="space-y-5 rounded-3xl border border-(--border) bg-(--surface-strong) p-4">
          <div>
            <label className="block text-sm font-medium text-(--muted-strong)">
              Chapters per day
            </label>
            <select
              value={chaptersPerDay}
              onChange={(e) => setChaptersPerDay(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary)"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reminderTime"
              className="block text-sm font-medium text-(--muted-strong)"
            >
              Daily reminder time
            </label>
            <input
              type="time"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text) outline-none focus:border-(--primary)"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4">
          <label className="block text-sm font-medium text-(--muted-strong)">
            Push notifications
          </label>

          <p className="mt-1 text-sm text-(--muted)">
            Get a notification when your daily Bible reading is ready.
          </p>

          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={notificationLoading || notificationsEnabled}
            className="mt-3 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {notificationLoading
              ? "Enabling..."
              : notificationsEnabled
                ? "Notifications Enabled"
                : "Enable Notifications"}
          </button>
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4">
          <p className="text-sm font-medium text-(--muted-strong)">Theme</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setThemeMode(option.value as "system" | "light" | "dark")
                }
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  themeMode === option.value
                    ? "border-(--primary) bg-(--surface-muted) text-(--text) shadow-[0_0_0_1px_var(--primary)]"
                    : "border-(--border) bg-(--surface) text-(--muted-strong) hover:border-(--border-strong)"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-(--border) bg-(--surface-strong) p-4">
          <div>
            <label className="block text-sm font-medium text-(--muted-strong)">
              Bible Version (English)
            </label>
            <select
              value={translationProvider === "bible-api-com" ? translation : ""}
              onChange={(e) => {
                setTranslation(e.target.value);
                setTranslationProvider("bible-api-com");
              }}
              className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text)"
            >
              <option value="">Choose a version</option>
              {ENGLISH_VERSIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-(--muted-strong)">
              Or read in another language
            </label>
            <select
              value={translationProvider === "api-bible" ? translation : ""}
              onChange={(e) => {
                setTranslation(e.target.value);
                setTranslationProvider("api-bible");
              }}
              className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text)"
            >
              <option>None (use English version above)</option>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-(--border) bg-(--surface) px-4 py-2.5 font-medium text-(--muted-strong) transition-colors duration-200 hover:border-(--border-strong)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="flex-1 rounded-xl bg-(--primary) px-4 py-2.5 font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-(--primary-strong)"
          >
            {updateSettings.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
