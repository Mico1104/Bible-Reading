import { useQuery } from "@tanstack/react-query";
import {supabase} from "@/lib/supabase";
import {toUsfmChapterId} from "@/lib/usfmCodes"

type BibleVerse = {
  verse: number;
  text: string;
};

type BibleApiResponse = {
  reference: string;
 verses: BibleVerse[];
};





const fetchFromBibleApiCom = async (reference: string, translation: string): Promise<BibleApiResponse> => {
  const encodedRef = encodeURIComponent(reference);
  const response = await fetch(`https://bible-api.com/${encodedRef}?translation=${translation}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${reference}`);
  }

  const data = await response.json();

  
  return {reference: data.reference, verses: data.verses}
};

const fetchFromApiBible = async (reference: string, bibleId: string): Promise<BibleApiResponse> => {
  const chapterId = toUsfmChapterId(reference);

  const {data, error} = await supabase.functions.invoke("fetch-bible-chapter",
    {
      body: {bibleId, chapterId}
    }
  );

  if(error){
    throw new Error(`Failed to fetch ${reference}`);
  }

  return data as BibleApiResponse
}

const fetchVerse = async (reference: string, translation: string, provider: string): Promise<BibleApiResponse> => {
  return provider === "api-bible" ? fetchFromApiBible(reference, translation) : fetchFromBibleApiCom(reference, translation)
}

export const useVerse = (reference: string | undefined, translation: string, provider: string) => {
  return useQuery({
    queryKey: ["verse", reference, translation, provider],
    queryFn: () => fetchVerse(reference as string, translation, provider),
    enabled: !!reference,
  });
};



export const useVerses = (references: string[], translation: string, provider: string) => {
  return useQuery({
    queryKey: ["verses", references.join(","), translation, provider],
    queryFn: async () => {
      const results = await Promise.all(
        references.map((ref) => fetchVerse(ref, translation, provider)),
      );
      return results;
    },

    enabled: references.length > 0,
    
  });
};
