type StatusBadgeProps = {
  isComplete: boolean;
};

export const StatusBadge = ({ isComplete }: StatusBadgeProps) => {
  return (
    <div>
      {isComplete ? (
        <p className="text-green-600 dark:text-green-400 font-medium">
          Completed
        </p>
      ) : (
        <p className="text-(--muted) font-medium">Not yet</p>
      )}
    </div>
  );
};
