import { useReadingBadge } from "./useReadingBadge";

type ReadingBadgeProps = {
  showName?: boolean;
  size?: "sm" | "md" | "lg";
};

export const ReadingBadge = ({
  showName = true,
  size = "md",
}: ReadingBadgeProps) => {
  const { badge, points, isLoading, isError } = useReadingBadge();

  if (isLoading || isError) {
    return null;
  }

  const Icon = badge.icon;

  const sizeClasses = {
    sm: {
      wrapper: "gap-2",
      icon: "h-8 w-8",
      iconSize: 15,
      name: "text-xs",
      points: "text-[10px]",
    },
    md: {
      wrapper: "gap-2.5",
      icon: "h-9 w-9",
      iconSize: 17,
      name: "text-xs",
      points: "text-[10px]",
    },
    lg: {
      wrapper: "gap-3",
      icon: "h-11 w-11",
      iconSize: 20,
      name: "text-sm",
      points: "text-[11px]",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center ${currentSize.wrapper}`}
      title={`${badge.name} — ${points.toLocaleString()} reading points`}
    >
      <div
        className={`flex ${currentSize.icon} shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong) text-(--primary)`}
        aria-label={badge.name}
      >
        <Icon size={currentSize.iconSize} strokeWidth={2} />
      </div>

      {showName && (
        <div className="min-w-0">
          <p
            className={`font-semibold ${currentSize.name} leading-tight text-(--text)`}
          >
            {badge.name}
          </p>

          <p className={`${currentSize.points} mt-0.5 text-(--muted)`}>
            {points.toLocaleString()} points
          </p>
        </div>
      )}
    </div>
  );
};
