type StatusBadgeProps = {
  isComplete: boolean;
};

export const StatusBadge = ({ isComplete }: StatusBadgeProps) => {
  return (
    <div>
      {isComplete ? (
        <p className="text-green-700">Completed</p>
      ) : (
        <p className="text-gray-500">Not yet</p>
      )}
    </div>
  );
};
