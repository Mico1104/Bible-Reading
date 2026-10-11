export type PointMilestone = {
  name: string;
  minPoints: number;
  description: string;
};

export const POINT_MILESTONES: PointMilestone[] = [
  {
    name: "Growing in the Word",
    minPoints: 25,
    description: "You have earned your first meaningful reading milestone.",
  },
  {
    name: "Rooted in the Word",
    minPoints: 50,
    description: "Your commitment to reading the Word is growing.",
  },
  {
    name: "Steadfast Reader",
    minPoints: 100,
    description: "You are building a steady habit of reading Scripture.",
  },
  {
    name: "Faithful Student",
    minPoints: 250,
    description: "You have continued investing in your time in the Word.",
  },
  {
    name: "Devoted Reader",
    minPoints: 500,
    description: "Your reading journey reflects continued commitment.",
  },
  {
    name: "Lifelong Learner",
    minPoints: 1000,
    description: "You have reached an important milestone in your reading journey.",
  },
];

export const getCurrentPointMilestone = (
  totalPoints: number,
): PointMilestone | null =>
  [...POINT_MILESTONES]
    .reverse()
    .find((milestone) => totalPoints >= milestone.minPoints) ?? null;

export const getNextPointMilestone = (
  totalPoints: number,
): PointMilestone | null =>
  POINT_MILESTONES.find(
    (milestone) => milestone.minPoints > totalPoints,
  ) ?? null;
