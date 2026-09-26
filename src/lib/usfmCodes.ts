export const USFM_CODES: Record<string, string> = {
  Genesis: "GEN",
  Exodus: "EXO",
  Leviticus: "LEV",
  Numbers: "NUM",
  Deuteronomy: "DEU",
  Joshua: "JOS",
  Judges: "JDG",
  Ruth: "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  "Song of Solomon": "SNG",
  Isaiah: "ISA",
  Jeremiah: "JER",
  Lamentations: "LAM",
  Ezekiel: "EZK",
  Daniel: "DAN",
  Hosea: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obadiah: "OBA",
  Jonah: "JON",
  Micah: "MIC",
  Nahum: "NAM",
  Habakkuk: "HAB",
  Zephaniah: "ZEP",
  Haggai: "HAG",
  Zechariah: "ZEC",
  Malachi: "MAL",
  Matthew: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Romans: "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  Jude: "JUD",
  Revelation: "REV",
};

export type BibleReferenceParts = {
  bookName: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
};

export const parseBibleReference = (
  reference: string,
): BibleReferenceParts => {
  const normalizedReference = reference.trim().replace(/\s+/g, " ");

  const match = normalizedReference.match(
    /^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/,
  );

  if (!match) {
    throw new Error(`Can't parse reference: ${reference}`);
  }

  const [, bookName, chapterText, startVerseText, endVerseText] = match;

  const chapter = Number(chapterText);

  const startVerse = startVerseText
    ? Number(startVerseText)
    : undefined;

  const endVerse = endVerseText
    ? Number(endVerseText)
    : startVerse;

  if (!Number.isFinite(chapter)) {
    throw new Error(`Invalid chapter in reference: ${reference}`);
  }

  if (
    startVerse !== undefined &&
    !Number.isFinite(startVerse)
  ) {
    throw new Error(`Invalid verse in reference: ${reference}`);
  }

  if (
    endVerse !== undefined &&
    !Number.isFinite(endVerse)
  ) {
    throw new Error(`Invalid verse range in reference: ${reference}`);
  }

  return {
    bookName,
    chapter,
    startVerse,
    endVerse,
  };
};

export const toUsfmChapterId = (
  reference: string,
): string => {
  const { bookName, chapter } = parseBibleReference(reference);

  const code = USFM_CODES[bookName];

  if (!code) {
    throw new Error(`Unknown book: ${bookName}`);
  }

  return `${code}.${chapter}`;
};