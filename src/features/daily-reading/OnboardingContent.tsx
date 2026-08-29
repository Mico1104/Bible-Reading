import { useState } from "react";
import { useCreatePlan } from "./useCreatePlan";

export const OnboardingContent = () => {
  const createPlan = useCreatePlan();
  const [chaptersPerDay, setChaptersPerDay] = useState(2);

  return (
    <div>
      <h1>Sep up your Bible reading</h1>
      <p>
        Choose your pace, then pick where to begin - you'll read straight
        through, looping back around once you finish
      </p>

      <div>
        <label>Chapters per day</label>
        <select
          value={chaptersPerDay}
          onChange={(e) => setChaptersPerDay(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          onClick={() => createPlan.mutate({ testament: "OT", chaptersPerDay })}
          disabled={createPlan.isPending}
        >
          Start in the Old Testament
        </button>
        <button
          onClick={() => createPlan.mutate({ testament: "NT", chaptersPerDay })}
          disabled={createPlan.isPending}
        >
          Start in the New Testament
        </button>
      </div>
    </div>
  );
};
