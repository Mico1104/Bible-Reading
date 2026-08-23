import { useQuery } from "@tanstack/react-query";

type BibleApiResponse = {
  reference: string;
  text: string;
  translation_name: string;
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
