import DailyCheckin from "@/components/daily-checkin";

import {
  DashboardHero,
  DashboardStats,
  RecoveryCard,
  SkillTree,
  TodaysPlan,
} from "@/components/dashboard";

import { MobileNav, Sidebar } from "@/components/navigation";

import {
  calculateRecoveryScore,
  getActivityMiles,
  getCurrentUser,
  getProfile,
  getSessionCount,
  getSkillProgress,
  getTodayCheckin,
  getTodayWorkout,
  getUnlockedSkillCount,
} from "@/lib/supabase/forge-data";

export const instant = false;

export default async function Home() {
  const { supabase, userId, email } = await getCurrentUser();

const [
  profile,
  todayWorkout,
  todayCheckin,
  sessions,
  miles,
  skills,
  skillProgress,
] = await Promise.all([
  getProfile(supabase, userId),
  getTodayWorkout(supabase, userId),
  getTodayCheckin(supabase, userId),
  getSessionCount(supabase, userId),
  getActivityMiles(supabase, userId),
  getUnlockedSkillCount(supabase, userId),
  getSkillProgress(supabase, userId),
]);

  const recoveryScore = calculateRecoveryScore(todayCheckin);

  const workout = todayWorkout?.workouts?.[0];
  const workoutExercises = workout?.workout_exercises ?? [];

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const workoutName = workout?.name ?? "Foundation Training";

  const workoutDescription =
    workout?.description ??
    "Build strength, control, mobility, and conditioning.";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-zinc-600">
                  {formattedDate.toUpperCase()}
                </p>

                <h2 className="mt-1 text-lg font-black text-white">
                  Welcome back,{" "}
                  {profile?.display_name || email || "Athlete"}
                </h2>
              </div>
            </header>

            {/* Hero */}
            <DashboardHero
              workoutName={workoutName}
              workoutDescription={workoutDescription}
              workoutId={workout?.id}
              scheduledWorkoutId={todayWorkout?.id}
            />

            {/* Stats */}
            <div className="mt-6">
              <DashboardStats
                streak={profile?.current_streak ?? 0}
                sessions={sessions}
                miles={miles}
                skills={skills}
              />
            </div>

            {/* Check-in */}
            <div className="mt-6">
              <DailyCheckin />
            </div>

            {/* Main dashboard */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <TodaysPlan
                  workoutExercises={workoutExercises}
                />

                <SkillTree skills={skillProgress} />
              </div>

              <div>
                <RecoveryCard
                  recoveryScore={recoveryScore}
                  checkin={todayCheckin}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}