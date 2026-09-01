const TOTAL_CHAPTERS = 1189;

export const getCompletionPercentage = (
  daysNumber: number,
  chaptersPerDay: number,
): number => {
  const chaptersRead = daysNumber * chaptersPerDay;
  const timesThrough = Math.floor(chaptersRead / TOTAL_CHAPTERS);
  const chaptersIntoCurrentPass = chaptersRead - timesThrough * TOTAL_CHAPTERS;
  return Math.round((chaptersIntoCurrentPass / TOTAL_CHAPTERS) * 100);
};

export const getCompletedPasses = (
  daysNumber: number,
  chaptersPerDay: number,
): number => {
  return Math.floor((daysNumber * chaptersPerDay) / TOTAL_CHAPTERS);
};

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

export const getNextMilestone = (currentStreak: number): number | null => {
  return STREAK_MILESTONES.find((m) => m > currentStreak) ?? null;
};

export const isMilestoneStreak = (streak: number): boolean => {
    return STREAK_MILESTONES.includes(streak);
}