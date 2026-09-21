import z from "zod";
import { useNotes } from "./useNotes";
import { useCreateNote } from "./useCreateNote";
import { useDeleteNotes } from "./useDeleteNote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Bookmark,
  LoaderCircle,
  Edit,
  NotebookText,
  Trash2,
} from "lucide-react";
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
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
          <NotebookText size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Your reflections
          </p>
          <h1 className="font-display mt-2 text-3xl text-(--text) sm:text-4xl">
            Notes
          </h1>
          <p className="mt-2 text-sm text-(--muted-strong)">
            Capture lessons, promises, and prayers from today’s reading.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5"
      >
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Reference
          </label>
          <input
            type="text"
            {...register("reference")}
            placeholder="Matthew 1:21"
            className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-3 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary) placeholder:text-(--muted)"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reference.message}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Reflection
          </label>
          <textarea
            placeholder="Write your note..."
            rows={4}
            {...register("content")}
            className="mt-2 min-h-28 w-full rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-3 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary) placeholder:text-(--muted)"
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3.5 font-semibold text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
        >
          <Bookmark size={17} />
          {isSubmitting ? "Saving..." : "Add note"}
        </button>
      </form>

      {notes?.length === 0 && (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-(--border) bg-(--surface) px-5 py-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)/10 text-(--primary)">
            <NotebookText size={24} />
          </div>
          <h2 className="mt-4 font-display text-xl text-(--text)">
            No notes yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-strong)">
            Capture a lesson, promise, or prayer here while you reflect on the
            passage.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-(--muted)">
            <LoaderCircle className="animate-spin text-(--primary)" size={16} />{" "}
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
      <div className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4 shadow-sm sm:p-5">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none transition focus:border-(--primary)"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-3 min-h-28 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none transition focus:border-(--primary)"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-(--border) px-3 py-2.5 text-sm font-medium text-(--muted-strong) transition hover:bg-(--surface)"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateNote.isPending}
            className="flex-1 rounded-lg bg-(--primary) px-3 py-2.5 text-sm font-medium text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
          >
            {updateNote.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-(--border) bg-(--surface-strong) p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--text) wrap-break-word">
            {note.reference}
          </p>
          <p className="mt-2 text-sm leading-6 text-(--muted-strong) wrap-break-word">
            {note.content}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-2 text-(--muted-strong) transition hover:bg-(--surface) hover:text-(--primary)"
            aria-label="Edit note"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => deleteNote.mutate(note.id)}
            className="rounded-lg p-2 text-(--muted-strong) transition hover:bg-(--surface) hover:text-red-600"
            aria-label="Delete note"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
