import { Activity, Search, Timer } from "lucide-react";
import { ForgeShell, Panel, SectionLabel } from "@/components/forge-shell";
import { getCurrentUser, getExercises } from "@/lib/supabase/forge-data";

export const instant = false;

export default async function ExercisesPage() {
	const { supabase } = await getCurrentUser();
	const exercises = await getExercises(supabase);
	return <ForgeShell title="Exercises" eyebrow="MOVEMENT LIBRARY" active="Exercises"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><SectionLabel>EXERCISE LIBRARY</SectionLabel><h2 className="mt-1 text-2xl font-bold">Build better movement.</h2></div><div className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#111317] px-3 text-sm text-zinc-500 sm:w-64"><Search size={16} />Search exercises</div></div><div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{exercises.length ? exercises.map((exercise) => <Panel key={exercise.id}><div className="flex items-center justify-between"><span className="rounded-full border border-white/10 px-2 py-1 text-[9px] text-[#d9ff52]">{exercise.category}</span><Activity size={16} className="text-zinc-600" /></div><h3 className="mt-5 text-base font-bold">{exercise.name}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{exercise.description ?? exercise.instructions ?? "A movement in your Forge library."}</p><div className="mt-6 flex items-center gap-2 text-[10px] text-zinc-600"><Timer size={14} />{exercise.equipment ?? "Bodyweight"}</div></Panel>) : <Panel><p className="text-sm text-zinc-500">Your exercise library is ready for its first movement.</p></Panel>}</div></ForgeShell>;
}