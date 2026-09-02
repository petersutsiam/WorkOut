import { createClient } from "@/lib/supabase/server";

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
  const { data } = await supabase
    .from("exercises")
    .select("id, name, category, description, difficulty, equipment, is_skill, xp_value, movement_pattern, muscle_group, instructions")
    .order("name");

  return data ?? [];
}

export async function getSkillProgress(supabase: ForgeClient, userId: string | null) {
  if (!userId) return [];

  const { data } = await supabase
    .from("exercise_progress")
    .select("exercise_id, mastery_percent, best_reps, best_hold_seconds, unlocked, exercises(name, category)")
    .eq("user_id", userId)
    .eq("unlocked", true)
    .order("mastery_percent", { ascending: false });

  return data ?? [];
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
  const today = new Date().toLocaleDateString("en-CA");

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

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("scheduled_workouts")
    .select("id, status, scheduled_date, workout_id, workouts(id, name, description, workout_type, workout_exercises(exercise_order, target_sets, target_reps, target_hold_seconds, target_distance, target_duration_minutes, rest_seconds, notes, exercises(name, category)))")
    .eq("user_id", userId)
    .eq("scheduled_date", today)
    .maybeSingle();

  return data;
}