import z from "zod";
import { useNotes } from "./useNotes";
import { useCreateNote } from "./useCreateNote";
import { useDeleteNotes } from "./useDeleteNote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Bookmark, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useUpdateNote } from "./useUpdateNote";

const noteSchema = z.object({
  reference: z.string().min(1, "Enter a scripture reference"),
  content: z.string().min(1, "Write something first"),
});

type NoteFormValue = z.infer<typeof noteSchema>;

export const NotePage = () => {
  const { data: notes, isLoading, error } = useNotes();
  const createNote = useCreateNote();

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
            We couldn't load your saved reflections. Please refresh and try
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
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </motion.div>
  );
};

const NoteItem = ({
  note,
}: {
  note: { id: string; reference: string; content: string };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reference, setReference] = useState(note.reference);
  const [content, setContent] = useState(note.content);

  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNotes();

  const handleSave = () => {
    updateNote.mutate(
      { id: note.id, reference, content },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleCancel = () => {
    setReference(note.reference);
    setContent(note.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateNote.isPending}
            className="flex-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {updateNote.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {note.reference}
        </p>
        <div className="flex gap-3 text-xs">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 dark:text-gray-400"
          >
            Edit
          </button>
          <button
            onClick={() => deleteNote.mutate(note.id)}
            className="text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-800 dark:text-gray-300">
        {note.content}
      </p>
    </div>
  );
};
