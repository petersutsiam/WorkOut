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