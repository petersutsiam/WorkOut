"use client";

import { createClient } from "@/lib/supabase/client";
import { Play, Check, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function StartWorkoutButton({
  workoutId,
  scheduledWorkoutId,
}: {
  workoutId?: string;
  scheduledWorkoutId?: string;
}) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startWorkout() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setError("Please sign in to start a workout.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("workout_sessions").insert({
      user_id: userData.user.id,
      workout_id: workoutId ?? null,
      scheduled_workout_id: scheduledWorkoutId ?? null,
      started_at: new Date().toISOString(),
      status: "in_progress",
    });

    if (insertError) setError(insertError.message);
    else setStarted(true);
    setLoading(false);
  }

  if (started) {
    return <div className="flex min-h-12 items-center gap-2 text-sm font-semibold text-[#d9ff52]"><Check size={17} />Workout started</div>;
  }

  return <div><button type="button" onClick={startWorkout} disabled={loading} className="flex min-h-12 items-center gap-2 rounded-xl bg-[#d9ff52] px-5 text-sm font-bold text-black hover:bg-[#e5ff78] disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}Start workout</button>{error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}</div>;
}