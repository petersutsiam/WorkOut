import {
  Activity,
  BarChart3,
  Dumbbell,
  Flame,
  Home as HomeIcon,
  Play,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";

import DailyCheckin from "@/components/daily-checkin";

import {
  calculateRecoveryScore,
  getActivityMiles,
  getCurrentUser,
  getProfile,
  getSessionCount,
  getTodayCheckin,
  getTodayWorkout,
  getUnlockedSkillCount,
} from "@/lib/supabase/forge-data";

export const instant = false;

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

export default async function Home() {
  const { supabase, userId, email } = await getCurrentUser();

  const [
    profile,
    sessionCount,
    skillCount,
    activityMiles,
    todayCheckin,
    todayWorkout,
  ] = await Promise.all([
    getProfile(supabase, userId),
    getSessionCount(supabase, userId),
    getUnlockedSkillCount(supabase, userId),
    getActivityMiles(supabase, userId),
    getTodayCheckin(supabase, userId),
    getTodayWorkout(supabase, userId),
  ]);

  /* ------------------------------------------------------------------------ */
  /* Dashboard values                                                         */
  /* ------------------------------------------------------------------------ */

  const currentStreak = profile?.current_streak ?? 0;

  const recoveryScore = calculateRecoveryScore(todayCheckin);

  const workoutExercises =
    todayWorkout?.workouts?.workout_exercises ?? [];

  const sortedWorkoutExercises = [...workoutExercises].sort(
    (a, b) => a.exercise_order - b.exercise_order,
  );

  const today = new Date();

  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const dashboardStats = [
    {
      label: "STREAK",
      value: String(currentStreak),
      icon: Flame,
    },
    {
      label: "SESSIONS",
      value: `${sessionCount}/5`,
      icon: Dumbbell,
    },
    {
      label: "MILES",
      value: activityMiles
        ? activityMiles.toFixed(1)
        : "0.0",
      icon: Activity,
    },
    {
      label: "SKILLS",
      value: String(skillCount),
      icon: Trophy,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Recovery status                                                          */
  /* ------------------------------------------------------------------------ */

  const recoveryStatus =
    recoveryScore == null
      ? "CHECK IN TO SCORE"
      : recoveryScore >= 80
        ? "READY TO TRAIN"
        : recoveryScore >= 60
          ? "TRAIN WITH CAUTION"
          : "RECOVERY RECOMMENDED";

  return (
    <main className="min-h-screen bg-[#090a0c] pb-20 text-white md:pb-0">
      <div className="flex min-h-screen">

        {/* ------------------------------------------------------------------ */}
        {/* Desktop Sidebar                                                   */}
        {/* ------------------------------------------------------------------ */}

        <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#0b0c0f] p-5 md:block">
          <div className="flex h-full flex-col">

            <Logo />

            <nav className="mt-10 space-y-2">
              <SideItem
                href="/"
                icon={<BarChart3 size={18} />}
                active
              >
                Dashboard
              </SideItem>

              <SideItem
                href="/workout"
                icon={<Dumbbell size={18} />}
              >
                Workout
              </SideItem>

              <SideItem
                href="/skills"
                icon={<Zap size={18} />}
              >
                Skills
              </SideItem>

              <SideItem
                href="/exercises"
                icon={<Activity size={18} />}
              >
                Exercises
              </SideItem>

              <SideItem
                href="/progress"
                icon={<Trophy size={18} />}
              >
                Progress
              </SideItem>
            </nav>

            {/* Current Phase */}
            <div className="mt-auto rounded-xl border border-white/10 bg-[#111317] p-4">
              <div className="text-[9px] tracking-widest text-zinc-500">
                CURRENT PHASE
              </div>

              <div className="mt-2 text-xs font-semibold">
                Foundation -&gt; Athletic
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[42%] rounded-full bg-[#d9ff52]" />
              </div>

              <div className="mt-2 text-[10px] text-zinc-500">
                Week 5 of 12
              </div>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* Main Content                                                       */}
        {/* ------------------------------------------------------------------ */}

        <div className="min-w-0 flex-1 md:pl-64">

          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090a0c]/95 px-4 backdrop-blur md:px-10">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">

              <div>
                <p className="text-[9px] tracking-[0.18em] text-zinc-500">
                  {formattedDate}
                </p>

                <h1 className="text-lg font-bold md:text-xl">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">

                {/* Streak */}
                <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                  <Flame
                    size={15}
                    className="text-[#d9ff52]"
                  />

                  <strong className="text-white">
                    {currentStreak}
                  </strong>

                  day streak
                </div>

                {/* Profile */}
                <Link
                  href="/profile"
                  aria-label={`Open profile for ${email}`}
                  title={email}
                  className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 text-xs font-bold md:grid"
                >
                  {email.slice(0, 1).toUpperCase()}
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-10 md:py-10">

            {/* ---------------------------------------------------------------- */}
            {/* Hero                                                             */}
            {/* ---------------------------------------------------------------- */}

            <section className="grid gap-4 lg:grid-cols-[1.7fr_.75fr]">

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#11140e] p-6 sm:p-8 md:p-10">

                <div className="relative z-10">

                  <span className="rounded-full border border-[#3c4820] bg-[#1a1e12] px-3 py-1.5 text-[8px] tracking-wider text-[#d9ff52]">
                    WEEK 5 - FOUNDATION
                  </span>

                  <h2 className="mt-6 text-[38px] font-extrabold leading-[.95] tracking-[-0.055em] sm:text-5xl">
                    Build the base.
                    <br />
                    <span className="text-[#d9ff52]">
                      Earn the skills.
                    </span>
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-400">
                    Strength, mobility and running work together.
                    {todayWorkout?.workouts?.name
                      ? ` Today is ${todayWorkout.workouts.name}.`
                      : " No workout is scheduled today."}
                  </p>

                  <Link
                    href="/workout"
                    className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff52] px-5 text-sm font-bold text-black transition hover:bg-[#e5ff78] active:scale-[0.98] sm:w-auto"
                  >
                    <Play size={16} fill="currentColor" />
                    {todayWorkout
                      ? "Start today&apos;s workout"
                      : "View workout schedule"}
                  </Link>
                </div>

                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-[#394120] opacity-30" />
              </div>

              {/* Next Milestone */}
              <div className="rounded-2xl border border-white/10 bg-[#111317] p-6">

                <p className="text-[9px] tracking-[0.15em] text-zinc-500">
                  NEXT MILESTONE
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Strict Pull-up
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      5-8 clean reps
                    </p>
                  </div>

                  <div className="text-3xl text-[#d9ff52]">
                    ↑
                  </div>
                </div>

                <div className="mt-6 h-1.5 rounded-full bg-zinc-800">
                  <div className="h-full w-[82%] rounded-full bg-[#d9ff52]" />
                </div>

                <p className="mt-2 text-[10px] text-zinc-500">
                  82% ready - Chest-to-bar next
                </p>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Dashboard Stats                                                  */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {dashboardStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-[#101114] p-4"
                  >
                    <div className="flex items-center gap-3">

                      <Icon
                        size={16}
                        className="text-zinc-500"
                      />

                      <div>
                        <div className="text-base font-bold sm:text-lg">
                          {stat.value}
                        </div>

                        <div className="text-[8px] tracking-wider text-zinc-600">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Daily Check-in                                                   */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-4">
              <DailyCheckin />
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Today's Plan                                                     */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-8">

              <div className="mb-4">
                <p className="text-[9px] tracking-[0.15em] text-zinc-500">
                  TODAY&apos;S PLAN
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {todayWorkout?.workouts?.name ??
                    "Rest and recover."}
                </h2>

                <p className="mt-2 text-xs text-zinc-500">
                  {todayWorkout?.workouts?.description ??
                    "No training session is scheduled for today."}
                </p>
              </div>

              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">

                {sortedWorkoutExercises.length > 0 ? (
                  sortedWorkoutExercises.map((item, index) => {
                    const exercise = item.exercises;

                    if (!exercise) return null;

                    const target =
                      item.target_reps != null
                        ? `${item.target_sets ?? 1} × ${item.target_reps} reps`
                        : item.target_hold_seconds != null
                          ? `${item.target_sets ?? 1} × ${item.target_hold_seconds}s`
                          : item.target_distance != null
                            ? `${Number(item.target_distance).toFixed(1)} mi`
                            : item.target_duration_minutes != null
                              ? `${item.target_duration_minutes} min`
                              : "Technique";

                    const categoryIcon =
                      exercise.category === "strength"
                        ? "◆"
                        : exercise.category === "skill"
                          ? "◎"
                          : exercise.category === "running"
                            ? "↗"
                            : exercise.category === "mobility"
                              ? "◌"
                              : "⚡";

                    return (
                      <div
                        key={`${todayWorkout?.id ?? "today"}-${item.exercise_order}-${exercise.name}`}
                        className={`min-w-[180px] snap-start rounded-xl border p-5 sm:min-w-0 ${
                          index === 0
                            ? "border-[#3d4722] bg-[#151810]"
                            : "border-white/10 bg-[#101114]"
                        }`}
                      >

                        <div className="text-[10px] font-mono text-zinc-600">
                          {String(item.exercise_order).padStart(2, "0")}
                        </div>

                        <div className="my-6 text-xl text-[#d9ff52]">
                          {categoryIcon}
                        </div>

                        <h3 className="text-sm font-bold">
                          {exercise.name}
                        </h3>

                        <p className="mt-2 min-h-8 text-[10px] leading-4 text-zinc-500">
                          {exercise.description ??
                            "Today's training exercise"}
                        </p>

                        <div className="mt-5 text-[10px] text-zinc-600">
                          {target}
                        </div>

                        {item.rest_seconds != null && (
                          <div className="mt-1 text-[9px] text-zinc-700">
                            Rest {item.rest_seconds}s
                          </div>
                        )}

                        {item.notes && (
                          <div className="mt-2 text-[9px] leading-4 text-zinc-700">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-xl border border-white/10 bg-[#101114] p-6">

                    <div className="text-sm font-semibold">
                      No workout scheduled today
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      Your training schedule does not have a workout
                      assigned for today.
                    </p>

                    <Link
                      href="/workout"
                      className="mt-4 inline-flex text-xs font-semibold text-[#d9ff52] hover:underline"
                    >
                      View workout schedule →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Skill Tree + Recovery                                            */}
            {/* ---------------------------------------------------------------- */}

            <section className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">

              {/* Skill Tree */}
              <div className="rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6">

                <p className="text-[9px] tracking-[0.15em] text-zinc-500">
                  SKILL TREE
                </p>

                <h3 className="mt-1 text-base font-bold">
                  Active progressions
                </h3>

                <div className="mt-5 space-y-5">

                  {/* Temporary skill data.
                      We will replace this with exercise_progress +
                      exercise_progressions next. */}

                  <SkillRow
                    name="Pull-up"
                    level="Foundation"
                    progress={82}
                    next="Chest-to-bar"
                  />

                  <SkillRow
                    name="L-sit"
                    level="Foundation"
                    progress={64}
                    next="V-sit"
                  />

                  <SkillRow
                    name="Handstand"
                    level="Developing"
                    progress={48}
                    next="Freestanding"
                  />
                </div>
              </div>

              {/* Recovery */}
              <div className="rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6">

                <p className="text-[9px] tracking-[0.15em] text-zinc-500">
                  RECOVERY
                </p>

                <h3 className="mt-1 text-base font-bold">
                  {recoveryStatus}
                </h3>

                <div className="mt-5">
                  <span className="text-5xl font-extrabold">
                    {recoveryScore ?? "--"}
                  </span>

                  <span className="text-xs text-zinc-600">
                    {" "}
                    / 100
                  </span>
                </div>

                {/* Recovery indicators */}
                {todayCheckin ? (
                  <>
                    <div className="mt-6 flex gap-1">

                      <div
                        className={`h-2 flex-1 rounded ${
                          (todayCheckin.energy ?? 0) >= 4
                            ? "bg-[#d9ff52]"
                            : "bg-zinc-800"
                        }`}
                      />

                      <div
                        className={`h-2 flex-1 rounded ${
                          (todayCheckin.sleep_hours ?? 0) >= 7
                            ? "bg-[#d9ff52]"
                            : "bg-zinc-800"
                        }`}
                      />

                      <div
                        className={`h-2 flex-1 rounded ${
                          (todayCheckin.readiness ?? 0) >= 4
                            ? "bg-[#d9ff52]"
                            : "bg-zinc-800"
                        }`}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-[8px] text-zinc-600">
                      <span>
                        Energy {todayCheckin.energy ?? "--"}/5
                      </span>

                      <span>
                        Sleep {todayCheckin.sleep_hours ?? "--"}h
                      </span>

                      <span>
                        Readiness {todayCheckin.readiness ?? "--"}/5
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-6 flex gap-1">
                      <div className="h-2 flex-1 rounded bg-zinc-800" />
                      <div className="h-2 flex-1 rounded bg-zinc-800" />
                      <div className="h-2 flex-1 rounded bg-zinc-800" />
                    </div>

                    <div className="mt-2 text-[8px] text-zinc-600">
                      Complete today&apos;s check-in to calculate recovery.
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Mobile Navigation                                                    */}
      {/* -------------------------------------------------------------------- */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0c0f]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">

          <MobileNav
            href="/"
            icon={<HomeIcon size={20} />}
            label="Home"
            active
          />

          <MobileNav
            href="/workout"
            icon={<Dumbbell size={20} />}
            label="Workout"
          />

          <MobileNav
            href="/skills"
            icon={<Zap size={20} />}
            label="Skills"
          />

          <MobileNav
            href="/progress"
            icon={<Trophy size={20} />}
            label="Progress"
          />

          <MobileNav
            href="/profile"
            icon={<User size={20} />}
            label="Profile"
          />

        </div>
      </nav>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Skill Row                                                                  */
/* -------------------------------------------------------------------------- */

function SkillRow({
  name,
  level,
  progress,
  next,
}: {
  name: string;
  level: string;
  progress: number;
  next: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">

        <div>
          <span className="text-xs font-semibold">
            {name}
          </span>

          <span className="ml-2 text-[9px] text-zinc-600">
            {level}
          </span>
        </div>

        <span className="text-[10px] text-zinc-500">
          {progress}%
        </span>
      </div>

      <div className="h-1 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-[#d9ff52]"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-2 text-[9px] text-zinc-600">
        Next -&gt; {next}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Logo                                                                       */
/* -------------------------------------------------------------------------- */

function Logo() {
  return (
    <div className="flex items-center gap-3">

      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9ff52] text-black">
        <Flame size={19} fill="currentColor" />
      </div>

      <div>
        <div className="text-sm font-bold tracking-[0.2em]">
          FORGE
        </div>

        <div className="text-[9px] tracking-[0.15em] text-zinc-500">
          ATHLETIC SYSTEM
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop Navigation                                                         */
/* -------------------------------------------------------------------------- */

function SideItem({
  children,
  href,
  icon,
  active = false,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#17191d] text-white"
          : "text-zinc-500 hover:bg-[#15171a] hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Navigation                                                          */
/* -------------------------------------------------------------------------- */

function MobileNav({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[56px] flex-col items-center justify-center gap-1 ${
        active
          ? "text-[#d9ff52]"
          : "text-zinc-600"
      }`}
    >
      {icon}

      <span className="text-[9px] font-medium">
        {label}
      </span>
    </Link>
  );
}