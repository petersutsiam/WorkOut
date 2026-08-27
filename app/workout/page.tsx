import { Check, Clock3, Dumbbell } from "lucide-react";
import { ForgeShell, Panel, SectionLabel } from "@/components/forge-shell";
import { getCurrentUser, getTodayWorkout } from "@/lib/supabase/forge-data";
import { StartWorkoutButton } from "@/components/start-workout-button";

export const instant = false;

const blocks = [
  ["01", "Warm-up", "Wrist, shoulder, hip + ankle mobility", "10 min"],
  ["02", "Skill Block", "Pull-up + L-sit technique", "20 min"],
  ["03", "Strength", "Pull, push, legs and core", "35 min"],
  ["04", "Run", "2.0 mi easy aerobic", "25 min"],
  ["05", "Mobility", "Full-body cooldown", "15 min"],
];

export default async function WorkoutPage() {
  const { supabase, userId } = await getCurrentUser();
  const scheduledWorkout = await getTodayWorkout(supabase, userId);
  const workoutDetails = scheduledWorkout?.workouts?.[0];
  const scheduledExercises = workoutDetails?.workout_exercises ?? [];
  const workoutName = workoutDetails?.name ?? "Skill and strength";
  const workoutDescription = workoutDetails?.description ?? "A focused session built around quality reps, clean positions and an easy aerobic finish.";

  const sessionBlocks = scheduledExercises.length ? scheduledExercises.map((item, index) => [String(index + 1).padStart(2, "0"), item.exercises?.[0]?.name ?? "Exercise", item.notes ?? `${item.target_sets ?? "-"} sets x ${item.target_reps ?? item.target_hold_seconds ?? "-"}`, item.target_duration_minutes ? `${item.target_duration_minutes} min` : "Quality reps"]) : blocks;

  return <ForgeShell title="Workout" eyebrow="THURSDAY - AUG 27" active="Workout"><div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><Panel className="bg-[#11140e] p-6 md:p-8"><SectionLabel>TODAY&apos;S SESSION</SectionLabel><h2 className="mt-2 text-3xl font-extrabold tracking-tight">{workoutName}.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">{workoutDescription}</p><div className="mt-7"><StartWorkoutButton workoutId={workoutDetails?.id} scheduledWorkoutId={scheduledWorkout?.id} /></div></Panel><Panel><SectionLabel>SESSION DETAILS</SectionLabel><div className="mt-5 grid grid-cols-2 gap-4"><div><Clock3 size={17} className="text-[#d9ff52]" /><strong className="mt-2 block text-xl">105</strong><span className="text-xs text-zinc-500">minutes</span></div><div><Dumbbell size={17} className="text-[#d9ff52]" /><strong className="mt-2 block text-xl">{scheduledWorkout?.status ?? "Planned"}</strong><span className="text-xs text-zinc-500">status</span></div></div></Panel></div><div className="mt-8"><SectionLabel>SESSION FLOW</SectionLabel><h2 className="mt-1 text-xl font-bold">Train with intent.</h2><div className="mt-4 space-y-2">{sessionBlocks.map(([number, name, description, duration], index) => <Panel key={number} className={`flex items-center gap-4 ${index === 1 ? "border-[#3d4722] bg-[#151810]" : ""}`}><span className="font-mono text-xs text-zinc-600">{number}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{name}</h3><p className="mt-1 text-xs text-zinc-500">{description}</p></div><span className="whitespace-nowrap text-xs text-zinc-500">{duration}</span>{index === 0 && <Check size={17} className="text-[#d9ff52]" />}</Panel>)}</div></div></ForgeShell>;
}