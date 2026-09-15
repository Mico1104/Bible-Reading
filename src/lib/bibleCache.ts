import { openDB, type DBSchema } from "idb";

type BibleVerse = {
  verse: number;
  text: string;
};

export type BibleApiResponse = {
  reference: string;
  verses: BibleVerse[];
};

interface BibleCacheDB extends DBSchema {
  chapters: {
    key: string;
    value: BibleApiResponse;
  };
}

const dbPromise = openDB<BibleCacheDB>("bible-reading-cache", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("chapters")) {
      db.createObjectStore("chapters");
    }
  },
});

const createCacheKey = (
  reference: string,
  translation: string,
  provider: string,
) => {
  return `${provider}:${translation}:${reference}`;
};

export const saveBibleChapter = async (
  reference: string,
  translation: string,
  provider: string,
  data: BibleApiResponse,
) => {
  const db = await dbPromise;

  const key = createCacheKey(reference, translation, provider);

  await db.put("chapters", data, key);
};

export const getBibleChapter = async (
  reference: string,
  translation: string,
  provider: string,
): Promise<BibleApiResponse | undefined> => {
  const db = await dbPromise;

  const key = createCacheKey(reference, translation, provider);

  return db.get("chapters", key);
};