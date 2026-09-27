import { useActiveReadingPlan } from "./useActiveReadingPlan";
import {
  BookOpen,
  Check,
  Clock,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReadingPlans, type ReadingPlan } from "./useReadingPlans";
import { useStartReadingPlan } from "./useStartReadingPlan";

type PlanType = "topic" | "character";

const planTypes: {
  value: PlanType;
  label: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    value: "topic",
    label: "Topics",
    description: "Explore Bible plans focused on important themes.",
    icon: BookOpen,
  },
  {
    value: "character",
    label: "Characters",
    description: "Study the lives and lessons of people in the Bible.",
    icon: UserRound,
  },
];

export const ReadingPlansPage = () => {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState<PlanType>("topic");
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);

  const { data: plans = [], isLoading, error } =
    useReadingPlans(selectedType);

  const startReadingPlan = useStartReadingPlan();

  const {
    data: activeReadingPlan,
    isLoading: isActivePlanLoading,
  } = useActiveReadingPlan();

  const activePlanId = activeReadingPlan?.plan_id ?? null;

  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(search.toLowerCase()),
  );

  const isSelectedPlanActive =
    !!selectedPlan && activePlanId === selectedPlan.id;

  const isAnotherPlanActive =
    !!selectedPlan &&
    !!activePlanId &&
    activePlanId !== selectedPlan.id;

  const handleStartPlan = () => {
    if (!selectedPlan) return;

    startReadingPlan.mutate(selectedPlan.id);
  };

  const handleContinuePlan = () => {
    setSelectedPlan(null);
    navigate("/dashboard");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-8">
        <p className="mb-2 text-sm font-medium text-(--primary)">
          Reading Plans
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Grow through focused Bible reading
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted-text) sm:text-base">
          Choose a Bible reading plan based on a topic or a Bible character.
          Your selected plan will work alongside your Daily Word reading.
        </p>
      </section>

      {/* Search */}
      <section className="mb-6">
        <label htmlFor="reading-plan-search" className="sr-only">
          Search reading plans
        </label>

        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-text)"
          />

          <input
            id="reading-plan-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reading plans..."
            className="w-full rounded-2xl border border-(--border) bg-(--card) py-3.5 pl-11 pr-11 text-sm outline-none transition focus:border-(--primary)"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-(--muted-text) transition hover:bg-(--background)"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </section>

      {/* Plan type selection */}
      <section className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {planTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-(--primary) bg-(--primary)/10"
                    : "border-(--border) bg-(--card) hover:border-(--primary)/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-(--primary) text-white"
                        : "bg-(--background) text-(--muted-text)"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">{type.label}</h2>

                    <p className="mt-1 text-sm leading-5 text-(--muted-text)">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active plan summary */}
      {activeReadingPlan?.reading_plan && (
        <section className="mb-8 rounded-2xl border border-(--primary)/30 bg-(--primary)/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--primary)">
                Currently following
              </p>

              <h2 className="mt-1 text-lg font-bold">
                {activeReadingPlan.reading_plan.title}
              </h2>

              <p className="mt-1 text-sm text-(--muted-text)">
                Continue this plan from your Dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Results */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {selectedType === "topic"
              ? "Topic-based plans"
              : "Character-based plans"}
          </h2>

          <p className="mt-1 text-sm text-(--muted-text)">
            {search
              ? `${filteredPlans.length} ${
                  filteredPlans.length === 1 ? "plan" : "plans"
                } found`
              : `${plans.length} ${
                  plans.length === 1 ? "plan" : "plans"
                } available`}
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-(--border) bg-(--card) px-6 py-12 text-center">
            <p className="text-sm text-(--muted-text)">
              Loading reading plans...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-(--card) px-6 py-12 text-center">
            <p className="font-medium">Unable to load reading plans.</p>

            <p className="mt-2 text-sm text-(--muted-text)">
              Please try again in a moment.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredPlans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-(--border) bg-(--card) px-6 py-12 text-center">
            <BookOpen
              size={32}
              className="mx-auto mb-3 text-(--muted-text)"
            />

            <h3 className="font-semibold">
              {search ? "No matching plans" : `No ${selectedType} plans yet`}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-text)">
              {search
                ? "Try a different search term."
                : "More reading plans will be added soon."}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredPlans.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              const anotherPlanIsActive =
                !!activePlanId && activePlanId !== plan.id;

              return (
                <article
                  key={plan.id}
                  className={`rounded-2xl border bg-(--card) p-5 transition ${
                    isActive
                      ? "border-(--primary)/50"
                      : "border-(--border) hover:border-(--primary)/50"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-(--primary)">
                        {plan.plan_type}
                      </span>

                      <h3 className="mt-1 text-lg font-bold">{plan.title}</h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-(--background) px-2.5 py-1.5 text-xs font-medium">
                      <Clock size={14} />
                      {plan.duration_days} days
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-(--muted-text)">
                    {plan.description || "No description available."}
                  </p>

                  {isActive && (
                    <div className="mt-4 rounded-xl bg-(--primary)/10 px-3 py-2.5 text-sm font-medium text-(--primary)">
                      You're currently following this plan.
                    </div>
                  )}

                  {anotherPlanIsActive && (
                    <div className="mt-4 rounded-xl bg-(--background) px-3 py-2.5 text-sm text-(--muted-text)">
                      You already have an active reading plan.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className="mt-5 w-full rounded-xl bg-(--primary) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {isActive ? "Continue Plan" : "View Plan"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reading-plan-title"
        >
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-(--card) p-6 sm:max-w-lg sm:rounded-3xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-(--primary)">
                  {selectedPlan.plan_type} reading plan
                </span>

                <h2
                  id="reading-plan-title"
                  className="mt-1 text-2xl font-bold"
                >
                  {selectedPlan.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                aria-label="Close plan details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--muted-text) transition hover:bg-(--background)"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm leading-6 text-(--muted-text)">
              {selectedPlan.description || "No description available."}
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-(--background) p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
                <Clock size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {selectedPlan.duration_days}-day journey
                </p>

                <p className="text-xs text-(--muted-text)">
                  A focused Bible reading experience
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-(--primary)"
                />

                <p className="text-sm text-(--muted-text)">
                  Read the assigned passages each day.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-(--primary)"
                />

                <p className="text-sm text-(--muted-text)">
                  Track your progress separately from Daily Word.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-(--primary)"
                />

                <p className="text-sm text-(--muted-text)">
                  Use your existing Bible translation settings.
                </p>
              </div>
            </div>

            {/* Enrollment state */}
            {isActivePlanLoading ? (
              <div className="mt-6 rounded-2xl bg-(--background) p-4 text-center">
                <p className="text-sm text-(--muted-text)">
                  Checking your current reading plan...
                </p>
              </div>
            ) : isSelectedPlanActive ? (
              <>
                <div className="mt-6 rounded-2xl border border-(--primary)/30 bg-(--primary)/10 p-4">
                  <p className="text-sm font-semibold">
                    You're currently following this plan.
                  </p>

                  <p className="mt-1 text-sm text-(--muted-text)">
                    Continue from your Dashboard to keep making progress.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleContinuePlan}
                  className="mt-6 w-full rounded-xl bg-(--primary) px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Continue Reading Plan
                </button>
              </>
            ) : isAnotherPlanActive ? (
              <>
                <div className="mt-6 rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="text-sm font-semibold">
                    You're already following another plan.
                  </p>

                  <p className="mt-1 text-sm leading-5 text-(--muted-text)">
                    Complete your current plan before starting a new one.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    navigate("/dashboard");
                  }}
                  className="mt-6 w-full rounded-xl bg-(--primary) px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Continue Current Plan
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartPlan}
                disabled={startReadingPlan.isPending}
                className="mt-8 w-full rounded-xl bg-(--primary) px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {startReadingPlan.isPending
                  ? "Starting plan..."
                  : "Start Plan"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              disabled={startReadingPlan.isPending}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-medium text-(--muted-text) transition hover:bg-(--background) disabled:cursor-not-allowed disabled:opacity-60"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </main>
  );
};