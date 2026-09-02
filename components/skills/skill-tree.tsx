import type { SkillProgress } from "@/lib/forge/types";

import { SkillCard } from "./skill-card";

type SkillTreeProps = {
  skills: SkillProgress[];
};

export function SkillTree({
  skills,
}: SkillTreeProps) {
  if (skills.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
        <p className="text-xs font-bold tracking-widest text-zinc-600">
          NO SKILLS UNLOCKED
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Complete your first progression to begin
          building your skill tree.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {skills.map((skill) => (
        <SkillCard
          key={skill.exercise_id}
          skill={skill}
        />
      ))}
    </div>
  );
}