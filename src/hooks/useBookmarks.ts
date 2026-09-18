import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Bookmark = {
  id: string;
  user_id: string;
  reference: string;
  translation: string;
  created_at: string;
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const isBookmarked = useCallback(
    (reference: string, translation: string) => {
      return bookmarks.some(
        (bookmark) =>
          bookmark.reference === reference &&
          bookmark.translation === translation,
      );
    },
    [bookmarks],
  );

  const addBookmark = useCallback(
    async (reference: string, translation: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to bookmark a passage.");
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: user.id,
          reference,
          translation,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding bookmark:", error);
        throw error;
      }

      setBookmarks((current) => [data, ...current]);
    },
    [],
  );

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }

    setBookmarks((current) =>
      current.filter((bookmark) => bookmark.id !== bookmarkId),
    );
  }, []);

  const toggleBookmark = useCallback(
    async (reference: string, translation: string) => {
      const existingBookmark = bookmarks.find(
        (bookmark) =>
          bookmark.reference === reference &&
          bookmark.translation === translation,
      );

      if (existingBookmark) {
        await removeBookmark(existingBookmark.id);
        return false;
      }

      await addBookmark(reference, translation);
      return true;
    },
    [bookmarks, addBookmark, removeBookmark],
  );

  const refreshBookmarks = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      setBookmarks([]);
    } else {
      setBookmarks(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBookmarks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setBookmarks([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching bookmarks:", error);
        setBookmarks([]);
      } else {
        setBookmarks(data ?? []);
      }

      setLoading(false);
    };

    void loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    bookmarks,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks,
  };
};
