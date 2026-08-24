import z from "zod";
import { useNotes } from "./useNotes";
import { useCreateNote } from "./useCreateNote";
import { useDeleteNotes } from "./useDeleteNote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Bookmark, LoaderCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";

const noteSchema = z.object({
  reference: z.string().min(1, "Enter a scripture reference"),
  content: z.string().min(1, "Write something first"),
});

type NoteFormValue = z.infer<typeof noteSchema>;

export const NotePage = () => {
  const { data: notes, isLoading, error } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNotes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValue>({ resolver: zodResolver(noteSchema) });

  const onSubmit = async (value: NoteFormValue) => {
    await createNote.mutateAsync(value);

    reset();
  };

  if (error) {
    return (
      <motion.div
        className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-xl rounded-2xl border border-[#eadbd5] bg-white p-6 text-[#75493c] shadow-sm sm:p-8">
          <AlertCircle size={22} />
          <h1 className="font-display mt-4 text-3xl text-[#0f151f]">
            Your notes are unavailable
          </h1>
          <p className="mt-3 leading-7 text-[#7e6862]">
            We couldn&apos;t load your saved reflections. Please refresh and try
            again.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="content-width page-shell py-8 sm:py-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b8d88]">
        Your reflections
      </p>
      <h1 className="font-display mt-2 text-4xl">Notes</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <input
            type="text"
            {...register("reference")}
            placeholder="Reference (e.g Matthew 1:21)"
            className="w-full rounded-lg border border-[#e9e0db] bg-white px-3 py-3 outline-none focus:border-[#75493c]"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reference.message}
            </p>
          )}
        </div>
        <div>
          <textarea
            placeholder="Write your note..."
            rows={3}
            {...register("content")}
            className="w-full rounded-lg border border-[#e9e0db] bg-white px-3 py-3 outline-none focus:border-[#75493c]"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#75493c] px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          <Bookmark size={17} />
          {isSubmitting ? "Saving..." : "Add note"}
        </button>
      </form>

      {notes?.length === 0 && (
        <p className="text-sm text-gray-500">No notes yet - add one above</p>
      )}

      <div className="mt-8 space-y-3">
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-[#9b8d88]">
            <LoaderCircle className="animate-spin text-[#75493c]" size={16} />{" "}
            Loading your notes...
          </p>
        )}
        {notes?.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-[#e9e0db] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {note.reference}
              </p>
              <button
                onClick={() => deleteNote.mutate(note.id)}
                aria-label={`Delete note ${note.reference}`}
                className="rounded-md p-1 text-[#9b8d88] hover:bg-[#f7f4f1] hover:text-[#75493c]"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-800">{note.content}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
