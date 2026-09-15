import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toUsfmChapterId } from "@/lib/usfmCodes";
import {
  getBibleChapter,
  saveBibleChapter,
  type BibleApiResponse,
} from "@/lib/bibleCache";

const fetchFromBibleApiCom = async (
  reference: string,
  translation: string,
): Promise<BibleApiResponse> => {
  const cached = await getBibleChapter(
    reference,
    translation,
    "bible-api-com",
  );

  try {
    const encodedRef = encodeURIComponent(reference);

    const response = await fetch(
      `https://bible-api.com/${encodedRef}?translation=${translation}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${reference}`);
    }

    const data = await response.json();

    const result: BibleApiResponse = {
      reference: data.reference,
      verses: data.verses,
    };

    await saveBibleChapter(
      reference,
      translation,
      "bible-api-com",
      result,
    );

    return result;
  } catch (error) {
    if (cached) {
      console.log(`Offline Bible cache used for ${reference}`);
      return cached;
    }

    throw error;
  }
};

const fetchFromApiBible = async (
  reference: string,
  bibleId: string,
): Promise<BibleApiResponse> => {
  const cached = await getBibleChapter(
    reference,
    bibleId,
    "api-bible",
  );

  try {
    const chapterId = toUsfmChapterId(reference);

    const { data, error } = await supabase.functions.invoke(
      "fetch-bible-chapter",
      {
        body: { bibleId, chapterId },
      },
    );

    if (error) {
      throw new Error(`Failed to fetch ${reference}`);
    }

    const result = data as BibleApiResponse;

    await saveBibleChapter(
      reference,
      bibleId,
      "api-bible",
      result,
    );

    return result;
  } catch (error) {
    if (cached) {
      console.log(`Offline Bible cache used for ${reference}`);
      return cached;
    }

    throw error;
  }
};

const fetchVerse = async (
  reference: string,
  translation: string,
  provider: string,
): Promise<BibleApiResponse> => {
  return provider === "api-bible"
    ? fetchFromApiBible(reference, translation)
    : fetchFromBibleApiCom(reference, translation);
};

export const useVerse = (
  reference: string | undefined,
  translation: string,
  provider: string,
) => {
  return useQuery({
    queryKey: ["verse", reference, translation, provider],
    queryFn: () =>
      fetchVerse(reference as string, translation, provider),
    enabled: !!reference,
  });
};

export const useVerses = (
  references: string[],
  translation: string,
  provider: string,
) => {
  return useQuery({
    queryKey: [
      "verses",
      references.join(","),
      translation,
      provider,
    ],
    queryFn: async () => {
      const results: BibleApiResponse[] = [];

      for (const ref of references) {
        const result = await fetchVerse(
          ref,
          translation,
          provider,
        );

        results.push(result);

        if (provider === "bible-api-com") {
          await new Promise((resolve) =>
            setTimeout(resolve, 200),
          );
        }
      }

      return results;
    },
    enabled: references.length > 0,
  });
};