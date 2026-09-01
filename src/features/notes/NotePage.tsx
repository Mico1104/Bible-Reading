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
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--muted)">
        Your reflections
      </p>
      <h1 className="font-display mt-2 text-4xl text-(--text)">Notes</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <input
            type="text"
            {...register("reference")}
            placeholder="Reference (e.g Matthew 1:21)"
            className="w-full rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-2.5 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary) placeholder:text-(--muted)"
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
            className="w-full rounded-xl border border-(--border) bg-(--surface-strong) px-3 py-2.5 text-(--text) outline-none ring-0 transition-colors duration-200 focus:border-(--primary) placeholder:text-(--muted)"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-3 font-semibold text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
        >
          <Bookmark size={17} />
          {isSubmitting ? "Saving..." : "Add note"}
        </button>
      </form>

      {notes?.length === 0 && (
        <p className="mt-8 text-sm text-(--muted)">
          No notes yet - add one above
        </p>
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
      <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none focus:border-(--primary)"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none focus:border-(--primary)"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--muted-strong) transition hover:bg-(--surface)"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateNote.isPending}
            className="flex-1 rounded-lg bg-(--primary) px-3 py-2 text-sm font-medium text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
          >
            {updateNote.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-(--text) break-words">
            {note.reference}
          </p>
          <p className="mt-2 text-sm text-(--muted-strong) break-words">
            {note.content}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
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
