export const getTranslationName = (
  translation: string,
  provider: string,
): string => {
  if (provider === "api-bible") {
    switch (translation) {
      case "b8d1feac6e94bd74-01":
        return "Yoruba";

      case "a36fc06b086699f1-02":
        return "Igbo";

      case "0ab0c764d56a715d-02":
        return "Hausa";

      default:
        return "Bible";
    }
  }

  switch (translation.toLowerCase()) {
    case "web":
      return "World English Bible";

    case "kjv":
      return "King James Version";

    case "bbe":
      return "Bible in Basic English";

    case "asv":
      return "American Standard Version";

    case "darby":
      return "Darby Bible";

    default:
      return translation.toUpperCase();
  }
};

export const getTranslationProvider = (
  translation: string,
): string => {
  const apiBibleTranslations = [
    "b8d1feac6e94bd74-01",
    "a36fc06b086699f1-02",
    "0ab0c764d56a715d-02",
  ];

  return apiBibleTranslations.includes(translation)
    ? "api-bible"
    : "bible-api-com";
};