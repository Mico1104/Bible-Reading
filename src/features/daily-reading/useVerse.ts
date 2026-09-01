import { useQuery } from "@tanstack/react-query";

type BibleVerse = {
  verse: number;
  text: string;
};

type BibleApiResponse = {
  reference: string;
  text: string;
  translation_name: string;
  verses: BibleVerse[];
};

const fetchVerse = async (reference: string, translation: string): Promise<BibleApiResponse> => {
  const encodedRef = encodeURIComponent(reference);
  const response = await fetch(`https://bible-api.com/${encodedRef}?translation=${translation}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${reference}`);
  }

  return response.json();
};

export const useVerse = (reference: string | undefined, translation: string) => {
  return useQuery({
    queryKey: ["verse", reference, translation],
    queryFn: () => fetchVerse(reference as string, translation),
    enabled: !!reference,
  });
};

export const useVerses = (references: string[], translation: string) => {
  return useQuery({
    queryKey: ["verses", references.join(","), translation],
    queryFn: async () => {
      const results = await Promise.all(
        references.map((ref) => fetchVerse(ref, translation)),
      );
      return results;
    },

    enabled: references.length > 0,
  });
};
