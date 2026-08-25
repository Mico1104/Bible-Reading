import { motion } from "motion/react";
import { useState } from "react";
import { Zap, BookOpen } from "lucide-react";

export const SetupModal = ({ onClose }: { onClose?: () => void }) => {
  const [chapters, setChapters] = useState(2);
  const [start, setStart] = useState("old");

  const save = () => onClose?.();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:py-8" role="presentation">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 my-auto max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:max-h-[calc(100vh-4rem)] sm:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-[#eadbd5] p-2">
            <Zap className="text-[#75493c]" size={20} />
          </div>
          <h2 id="setup-title" className="text-xl font-semibold text-[#0f151f]">Choose your rhythm</h2>
        </div>
        <p className="text-sm text-[#7e6862] leading-6">
          Pick a daily pace and a starting Testament that feels right for you.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#0f151f] mb-3">
              Chapters per day
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  onClick={() => setChapters(n)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    chapters === n
                      ? "bg-[#75493c] text-white shadow-lg shadow-[#75493c]/30"
                      : "bg-[#f3f2f1] text-[#7e6862] hover:bg-[#ede9e5]"
                  }`}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f151f] mb-3">
              Start your journey
            </label>
            <div className="space-y-2">
              {[
                { key: "old", label: "Old Testament", desc: "Begin with Genesis" },
                { key: "new", label: "New Testament", desc: "Begin with Matthew" },
              ].map((opt) => (
                <motion.button
                  key={opt.key}
                  type="button"
                  onClick={() => setStart(opt.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                    start === opt.key
                      ? "bg-[#4c765d] text-white shadow-lg shadow-[#4c765d]/30"
                      : "bg-[#f3f2f1] text-[#7e6862] hover:bg-[#ede9e5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs opacity-75">{opt.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-[#f7f4f1] rounded-xl p-4 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-xs text-[#7e6862]">
              You'll read {chapters} chapter{chapters > 1 ? "s" : ""} per day, starting in the {start === "old" ? "Old" : "New"} Testament.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClose?.()}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-[#7e6862] hover:bg-[#f3f2f1] transition"
            >
              Skip for now
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={save}
              className="rounded-lg bg-[#75493c] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#603a31] disabled:opacity-50 transition"
            >
              Save & continue
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
