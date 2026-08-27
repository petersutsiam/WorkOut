import { ArrowUpRight, LockKeyhole, Zap } from "lucide-react";
import { ForgeShell, Panel, ProgressBar, SectionLabel } from "@/components/forge-shell";
import { getCurrentUser, getSkillProgress } from "@/lib/supabase/forge-data";

export const instant = false;

const skills = [{ name: "Strict Pull-up", category: "Pull", progress: 82, next: "Chest-to-bar", detail: "5-8 clean reps" }, { name: "L-sit", category: "Core", progress: 64, next: "V-sit", detail: "20 sec hold" }, { name: "Handstand", category: "Push", progress: 48, next: "Freestanding", detail: "30 sec balance" }, { name: "Pistol Squat", category: "Legs", progress: 31, next: "Weighted pistol", detail: "5 each side" }];

export default async function SkillsPage() {
	const { supabase, userId } = await getCurrentUser();
	const progress = await getSkillProgress(supabase, userId);
	const visibleSkills = progress.length ? progress.map((item, index) => ({ name: item.exercises?.[0]?.name ?? `Skill ${index + 1}`, category: item.exercises?.[0]?.category ?? "Movement", progress: Number(item.mastery_percent ?? 0), next: "Next progression", detail: item.best_reps ? `${item.best_reps} best reps` : "Keep practicing" })) : skills;
	return <ForgeShell title="Skills" eyebrow="SKILL DEVELOPMENT" active="Skills"><div className="flex items-end justify-between"><div><SectionLabel>SKILL TREE</SectionLabel><h2 className="mt-1 text-2xl font-bold">Earn your next level.</h2></div><Zap className="text-[#d9ff52]" /></div><div className="mt-6 grid gap-3 md:grid-cols-2">{visibleSkills.map((skill, index) => <Panel key={skill.name} className="relative overflow-hidden"><div className="flex items-start justify-between"><div><span className="text-[9px] tracking-widest text-zinc-600">{skill.category}</span><h3 className="mt-2 text-lg font-bold">{skill.name}</h3><p className="mt-1 text-xs text-zinc-500">{skill.detail}</p></div><span className="text-2xl font-extrabold text-[#d9ff52]">{skill.progress}%</span></div><div className="mt-6"><ProgressBar value={skill.progress} /></div><div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500"><span>Next: {skill.next}</span><ArrowUpRight size={15} className="text-[#d9ff52]" /></div>{index === 3 && <div className="absolute right-4 top-4 text-zinc-700"><LockKeyhole size={14} /></div>}</Panel>)}</div></ForgeShell>;
}