import { StartWorkoutButton } from "@/components/start-workout-button";

type DashboardHeroProps = {
  workoutName: string;
  workoutDescription?: string | null;
  workoutId?: string;
  scheduledWorkoutId?: string;
};

export function DashboardHero({
  workoutName,
  workoutDescription,
  workoutId,
  scheduledWorkoutId,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8">
      <div className="relative z-10 max-w-2xl">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#d9ff52]/20 bg-[#d9ff52]/10 px-3 py-1 text-xs font-bold tracking-wider text-[#d9ff52]">
          WEEK 5 · FOUNDATION
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          {workoutName}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
          {workoutDescription ||
            "Build strength, control, mobility, and conditioning."}
        </p>

        <div className="mt-6">
          <StartWorkoutButton
            workoutId={workoutId}
            scheduledWorkoutId={scheduledWorkoutId}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d9ff52]/5 blur-3xl" />
    </section>
  );
}