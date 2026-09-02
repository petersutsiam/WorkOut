import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/forge/date";
import type { SkillProgress } from "@/lib/forge/types";

export type ForgeClient = Awaited<ReturnType<typeof createClient>>;

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : "Athlete";

  return { supabase, userId, email };
}

export async function getProfile(supabase: ForgeClient, userId: string | null) {
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name, current_level, total_xp, current_streak, longest_streak")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

export async function getExercises(supabase: ForgeClient) {
  const { data, error } = await supabase
    .from("exercises")
    .select(`
      id,
      name,
      category,
      subcategory,
      description,
      instructions,
      form_cues,
      difficulty,
      equipment,
      is_unilateral,
      is_foundation_test,
      foundation_test_name
    `)
    .order("name");

  if (error) {
    console.error("getExercises:", error);
    return [];
  }

  return data ?? [];
}

export async function getSkillProgress(
  supabase: ForgeClient,
  userId: string | null,
): Promise<SkillProgress[]> {
  if (!userId) return [];

  /*
   * Get all unlocked exercise progress for this user.
   *
   * We intentionally do not use exercises.is_skill because
   * that column does not exist in the current database schema.
   */
  const { data: progress, error: progressError } = await supabase
    .from("exercise_progress")
    .select(`
      exercise_id,
      mastery_percent,
      best_reps,
      best_sets,
      best_hold_seconds,
      best_distance,
      best_duration_minutes,
      training_sessions_completed,
      training_requirement_met,
      final_gate_completed,
      unlocked,
      last_performed_at,
      exercises (
        id,
        name,
        category,
        subcategory,
        difficulty,
        description,
        instructions,
        form_cues,
        is_foundation_test,
        foundation_test_name
      )
    `)
    .eq("user_id", userId)
    .eq("unlocked", true)
    .order("mastery_percent", {
      ascending: false,
      nullsFirst: false,
    });

  if (progressError) {
    console.error("getSkillProgress progress:", progressError);
    return [];
  }

  if (!progress || progress.length === 0) {
    return [];
  }

  /*
   * Only exercises that participate in an exercise progression
   * belong in the Skill Tree.
   */
  const exerciseIds = progress.map(
    (item) => item.exercise_id,
  );

  const { data: progressions, error: progressionError } =
    await supabase
      .from("exercise_progressions")
      .select(`
        current_exercise_id,
        next_exercise_id,
        required_sets,
        required_reps,
        required_hold_seconds,
        required_distance,
        required_duration_minutes,
        required_sessions,
        final_gate_required,
        final_gate_type,
        final_gate_value,
        final_gate_reps,
        final_gate_hold_seconds,
        final_gate_description
      `)
      .in("current_exercise_id", exerciseIds);

  if (progressionError) {
    console.error(
      "getSkillProgress progressions:",
      progressionError,
    );
    return [];
  }

  if (!progressions || progressions.length === 0) {
    return [];
  }

  /*
   * Get the exercises that are the next progression.
   */
  const nextExerciseIds = [
    ...new Set(
      progressions.map(
        (progression) => progression.next_exercise_id,
      ),
    ),
  ];

  const { data: nextExercises, error: nextExerciseError } =
    await supabase
      .from("exercises")
      .select(`
        id,
        name,
        category,
        subcategory,
        difficulty,
        description,
        instructions,
        form_cues
      `)
      .in("id", nextExerciseIds);

  if (nextExerciseError) {
    console.error(
      "getSkillProgress next exercises:",
      nextExerciseError,
    );
    return [];
  }

  /*
   * Build lookup maps so we don't repeatedly search arrays.
   */
  const progressionMap = new Map(
    progressions.map((progression) => [
      progression.current_exercise_id,
      progression,
    ]),
  );

  const nextExerciseMap = new Map(
    (nextExercises ?? []).map((exercise) => [
      exercise.id,
      exercise,
    ]),
  );

  /*
   * Only return exercises that actually participate in
   * a progression chain.
   */
  return progress
    .filter((item) =>
      progressionMap.has(item.exercise_id),
    )
    .map((item) => {
      const progression =
        progressionMap.get(item.exercise_id) ?? null;

      const nextExercise = progression
        ? nextExerciseMap.get(
            progression.next_exercise_id,
          ) ?? null
        : null;

      return {
        ...item,
        progression,
        next_exercise: nextExercise,
      } as SkillProgress;
    });
}

export async function getSessionCount(
  clientOrUserId: ForgeClient | string | null,
  userId?: string | null,
) {
  const supabase = typeof clientOrUserId === "string" || clientOrUserId === null
    ? await createClient()
    : clientOrUserId;
  const resolvedUserId = typeof clientOrUserId === "string" ? clientOrUserId : userId ?? null;
  if (!resolvedUserId) return 0;

  const { count } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", resolvedUserId)
    .eq("status", "completed");

  return count ?? 0;
}

export async function getTodayCheckin(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return null;

  // Use the same local calendar date approach as the check-in component.
  const today = getLocalDateString();

  const { data, error } = await supabase
    .from("daily_checkins")
    .select(
      "id, checkin_date, energy, soreness, sleep_hours, stress, readiness, notes",
    )
    .eq("user_id", userId)
    .eq("checkin_date", today)
    .maybeSingle();

  if (error) {
    console.error("getTodayCheckin:", error);
    return null;
  }

  return data;
}

export function calculateRecoveryScore(checkin: {
  energy: number | null;
  soreness: number | null;
  sleep_hours: number | null;
  stress: number | null;
  readiness: number | null;
} | null) {
  if (!checkin) return null;

  const {
    energy,
    soreness,
    sleep_hours,
    stress,
    readiness,
  } = checkin;

  // Need enough information to produce a meaningful score.
  const values: number[] = [];

  if (energy != null) {
    values.push(energy / 5);
  }

  if (soreness != null) {
    values.push((6 - soreness) / 5);
  }

  if (sleep_hours != null) {
    // 8 hours = ideal, capped at 100%.
    values.push(Math.min(sleep_hours / 8, 1));
  }

  if (stress != null) {
    values.push((6 - stress) / 5);
  }

  if (readiness != null) {
    values.push(readiness / 5);
  }

  if (values.length === 0) return null;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 100,
  );
}

export async function getUnlockedSkillCount(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return 0;

  const { count } = await supabase
    .from("exercise_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("unlocked", true);

  return count ?? 0;
}

export async function getActivityMiles(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return 0;

  const { data } = await supabase
    .from("device_activities")
    .select("distance")
    .eq("user_id", userId);

  return (data ?? []).reduce(
    (total, activity) => total + Number(activity.distance ?? 0),
    0,
  );
}

export async function getTodayWorkout(supabase: ForgeClient, userId: string | null) {
  if (!userId) return null;

  const today = getLocalDateString();
  const { data } = await supabase
    .from("scheduled_workouts")
    .select("id, status, scheduled_date, workout_id, workouts(id, name, description, workout_type, workout_exercises(exercise_order, target_sets, target_reps, target_hold_seconds, target_distance, target_duration_minutes, rest_seconds, notes, exercises(name, category)))")
    .eq("user_id", userId)
    .eq("scheduled_date", today)
    .maybeSingle();

  return data;
}

export async function getCurrentProgramWeek(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select(`
      scheduled_date,
      workout_id,
      workouts (
        id,
        name,
        program_week_id,
        program_weeks (
          id,
          week_number,
          name,
          focus,
          description,
          program_id,
          programs (
            id,
            name,
            total_weeks
          )
        )
      )
    `)
    .eq("user_id", userId)
    .eq("scheduled_date", getLocalDateString())
    .maybeSingle();

  if (error) {
    console.error("getCurrentProgramWeek:", error);
    return null;
  }

  return data;
}