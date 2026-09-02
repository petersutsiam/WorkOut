import {
  Activity,
  Dumbbell,
  Timer,
  Wind,
} from "lucide-react";

type WorkoutExercise = {
  exercise_order: number;
  target_sets: number | null;
  target_reps: number | null;
  target_hold_seconds: number | null;
  target_distance: number | null;
  target_duration_minutes: number | null;
  rest_seconds: number | null;
  notes: string | null;
  exercises:
    | {
        name: string;
        category: string;
      }
    | {
        name: string;
        category: string;
      }[]
    | null;
};

type TodaysPlanProps = {
  workoutExercises: WorkoutExercise[];
};

function getExerciseIcon(category: string) {
  switch (category) {
    case "running":
      return Activity;

    case "mobility":
      return Wind;

    case "recovery":
      return Wind;

    case "skill":
      return Timer;

    default:
      return Dumbbell;
  }
}

function getTarget(exercise: WorkoutExercise) {
  if (exercise.target_reps != null) {
    if (exercise.target_sets != null) {
      return `${exercise.target_sets} × ${exercise.target_reps}`;
    }

    return `${exercise.target_reps} reps`;
  }

  if (exercise.target_hold_seconds != null) {
    if (exercise.target_sets != null) {
      return `${exercise.target_sets} × ${exercise.target_hold_seconds}s`;
    }

    return `${exercise.target_hold_seconds}s`;
  }

  if (exercise.target_distance != null) {
    return `${exercise.target_distance} mi`;
  }

  if (exercise.target_duration_minutes != null) {
    return `${exercise.target_duration_minutes} min`;
  }

  return "Technique";
}

function getExerciseName(exercise: WorkoutExercise) {
  if (!exercise.exercises) return "Exercise";

  if (Array.isArray(exercise.exercises)) {
    return exercise.exercises[0]?.name ?? "Exercise";
  }

  return exercise.exercises.name;
}

function getExerciseCategory(exercise: WorkoutExercise) {
  if (!exercise.exercises) return "strength";

  if (Array.isArray(exercise.exercises)) {
    return exercise.exercises[0]?.category ?? "strength";
  }

  return exercise.exercises.category;
}

export function TodaysPlan({
  workoutExercises,
}: TodaysPlanProps) {
  const exercises = [...workoutExercises].sort(
    (a, b) => a.exercise_order - b.exercise_order,
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#d9ff52]">
            TODAY
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            Today&apos;s Plan
          </h2>
        </div>

        <span className="text-xs text-zinc-500">
          {exercises.length} exercises
        </span>
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-500">
            No workout scheduled today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => {
            const category = getExerciseCategory(exercise);
            const Icon = getExerciseIcon(category);

            return (
              <div
                key={exercise.exercise_order}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-[#d9ff52]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-white">
                    {getExerciseName(exercise)}
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>{getTarget(exercise)}</span>

                    {exercise.rest_seconds != null && (
                      <span>
                        Rest {exercise.rest_seconds}s
                      </span>
                    )}
                  </div>

                  {exercise.notes && (
                    <p className="mt-1 text-xs text-zinc-600">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}