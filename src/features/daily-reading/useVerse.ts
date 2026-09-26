import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  parseBibleReference,
  toUsfmChapterId,
} from "@/lib/usfmCodes";
import {
  getBibleChapter,
  saveBibleChapter,
  type BibleApiResponse,
} from "@/lib/bibleCache";

const cleanVerseText = (text: string): string => {
  return text
    // Remove duplicated/leading verse numbers such as:
    // "1 1Ó sì ṣe..." → "Ó sì ṣe..."
    .replace(/^\s*\d+\s+\d+\s*/, "")
    // Remove a single leading verse number such as:
    // "1 Ó sì ṣe..." → "Ó sì ṣe..."
    .replace(/^\s*\d+\s*/, "")
    // Replace repeated whitespace with a single space
    .replace(/\s+/g, " ")
    // Remove unnecessary spaces before punctuation
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
};

const filterVerseRange = (
  chapter: BibleApiResponse,
  reference: string,
): BibleApiResponse => {
  const {
    startVerse,
    endVerse,
  } = parseBibleReference(reference);

  if (startVerse === undefined) {
    return {
      reference: chapter.reference,
      verses: chapter.verses.map((verse) => ({
        ...verse,
        text: cleanVerseText(verse.text),
      })),
    };
  }

  const lastVerse = endVerse ?? startVerse;

  return {
    reference,
    verses: chapter.verses
      .filter(
        (verse) =>
          verse.verse >= startVerse &&
          verse.verse <= lastVerse,
      )
      .map((verse) => ({
        ...verse,
        text: cleanVerseText(verse.text),
      })),
  };
};

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
      verses: data.verses.map(
        (verse: BibleApiResponse["verses"][number]) => ({
          ...verse,
          text: cleanVerseText(verse.text),
        }),
      ),
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
      console.log(
        `Offline Bible cache used for ${reference}`,
      );

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
    /*
     * API.Bible fetches chapters, not arbitrary verse ranges.
     *
     * Example:
     *   John 1:1-14
     *
     * becomes:
     *   JHN.1
     *
     * We then filter the returned chapter to verses 1-14.
     */
    const chapterId = toUsfmChapterId(reference);

    const { data, error } = await supabase.functions.invoke(
      "fetch-bible-chapter",
      {
        body: {
          bibleId,
          chapterId,
        },
      },
    );

    if (error) {
      throw new Error(
        `Failed to fetch ${reference}: ${error.message}`,
      );
    }

    if (!data || !Array.isArray(data.verses)) {
      throw new Error(
        `Invalid Bible response for ${reference}`,
      );
    }

    const chapter = data as BibleApiResponse;

    const result = filterVerseRange(
      chapter,
      reference,
    );

    if (result.verses.length === 0) {
      throw new Error(
        `No verses found for ${reference}`,
      );
    }

    await saveBibleChapter(
      reference,
      bibleId,
      "api-bible",
      result,
    );

    return result;
  } catch (error) {
    if (cached) {
      console.log(
        `Offline Bible cache used for ${reference}`,
      );

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
    queryKey: [
      "verse",
      reference,
      translation,
      provider,
    ],
    queryFn: () =>
      fetchVerse(
        reference as string,
        translation,
        provider,
      ),
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