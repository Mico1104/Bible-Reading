import { useReadingPoints } from "./useReadingPoints";
import {
  getNextReadingBadge,
  getReadingBadge,
} from "./badgeConfig";

export const useReadingBadge = () => {
  const pointsQuery = useReadingPoints();

  const points = pointsQuery.data?.total ?? 0;

  const badge = getReadingBadge(points);
  const nextBadge = getNextReadingBadge(points);

  const pointsToNextBadge = nextBadge
    ? nextBadge.minPoints - points
    : 0;

  return {
    ...pointsQuery,
    points,
    badge,
    nextBadge,
    pointsToNextBadge,
  };
};