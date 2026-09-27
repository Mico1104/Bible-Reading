
export type ReadingGrowthInterest =
  | "faith"
  | "prayer"
  | "courage"
  | "forgiveness"
  | "leadership"
  | "hope"
  | "following-jesus";

export type ReadingPlanSuggestion = {
  interest: ReadingGrowthInterest;
  label: string;
  description: string;
  planSlugs: string[];
};

export const readingPlanSuggestions: ReadingPlanSuggestion[] = [
  {
    interest: "faith",
    label: "Faith",
    description: "Grow in trusting God and standing firm in faith.",
    planSlugs: [
      "faith-trusting-god",
      "abraham-faith-and-promises",
      "daniel-faith-under-pressure",
    ],
  },

  {
    interest: "prayer",
    label: "Prayer",
    description: "Deepen your prayer life and draw closer to God.",
    planSlugs: [
      "prayer-drawing-near-to-god",
      "nehemiah-prayer-leadership-perseverance",
    ],
  },

  {
    interest: "courage",
    label: "Courage",
    description: "Learn to follow God with courage in difficult situations.",
    planSlugs: [
      "joshua-courage-to-follow-god",
      "esther-courage-for-a-purpose",
      "daniel-faith-under-pressure",
    ],
  },

  {
    interest: "forgiveness",
    label: "Forgiveness",
    description: "Explore forgiveness, grace, and letting go of hurt.",
    planSlugs: [
      "forgiveness-letting-go-and-healing",
      "joseph-faith-through-the-journey",
    ],
  },

  {
    interest: "leadership",
    label: "Leadership",
    description: "Learn from people who led with faith, prayer, and perseverance.",
    planSlugs: [
      "moses-called-to-lead",
      "nehemiah-prayer-leadership-perseverance",
    ],
  },

  {
    interest: "hope",
    label: "Hope",
    description: "Find encouragement and learn to remain anchored in God.",
    planSlugs: [
      "hope-anchored-in-god",
      "joseph-faith-through-the-journey",
    ],
  },

  {
    interest: "following-jesus",
    label: "Following Jesus",
    description: "Grow in knowing Jesus and learning what it means to follow Him.",
    planSlugs: [
      "knowing-jesus",
      "peter-learning-to-follow-jesus",
      "paul-transformed-for-the-gospel",
    ],
  },
];

export const getReadingPlanSuggestion = (
  interest: ReadingGrowthInterest,
): ReadingPlanSuggestion | undefined => {
  return readingPlanSuggestions.find(
    (suggestion) => suggestion.interest === interest,
  );
};

