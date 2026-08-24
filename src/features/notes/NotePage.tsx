import z from "zod";
import { useNotes } from "./useNotes";
import { useCreateNote } from "./useCreateNote";
import { useDeleteNotes } from "./useDeleteNote";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
      <p className="p-6 text-red-600">
        Something went wrong loading your notes
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Notes</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <div>
          <input
            type="text"
            {...register("reference")}
            placeholder="Reference (e.g Matthew 1:21)"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
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
            className="w-full  rounded-md border border-gray-300 px-3 py-2"
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
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Add note"}
        </button>
      </form>

      {notes?.length === 0 && (
        <p className="text-sm text-gray-500">No notes yet - add one above</p>
      )}

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-gray-500">Loading...</p>}
        {notes?.map((note) => (
          <div key={note.id} className="rounded-md border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {note.reference}
              </p>
              <button
                onClick={() => deleteNote.mutate(note.id)}
                className="text-xs text-red-600"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-800">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
