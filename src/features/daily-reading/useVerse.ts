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

const fetchVerse = async (reference: string): Promise<BibleApiResponse> => {
  const encodedRef = encodeURIComponent(reference);
  const response = await fetch(`https://bible-api.com/${encodedRef}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${reference}`);
  }

  return response.json();
};

export const useVerse = (reference: string | undefined) => {
  return useQuery({
    queryKey: ["verse", reference],
    queryFn: () => fetchVerse(reference as string),
    enabled: !!reference,
  });
};

export const useVerses = (references: string[]) => {
  return useQuery({
    queryKey: ["verses", references.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        references.map((ref) => fetchVerse(ref)),
      );
      return results;
    },

    enabled: references.length > 0,
  });
};
