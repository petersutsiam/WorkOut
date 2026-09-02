import {
  ForgeShell,
  SectionLabel,
} from "@/components/forge-shell";

import { SkillTree } from "@/components/skills";

import {
  getCurrentUser,
  getSkillProgress,
} from "@/lib/supabase/forge-data";

export const instant = false;

export default async function SkillsPage() {
  const {
    supabase,
    userId,
  } = await getCurrentUser();

  const skills = await getSkillProgress(
    supabase,
    userId,
  );

  return (
    <ForgeShell
      title="Skills"
      eyebrow="SKILL DEVELOPMENT"
      active="Skills"
    >
      <div className="mb-8">
        <SectionLabel>
          PROGRESSION
        </SectionLabel>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Earn your next level.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Train the movement, satisfy the requirements,
              complete the final gate, and unlock the next
              progression.
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-2xl font-black text-[#d9ff52]">
              {skills.length}
            </p>

            <p className="text-[9px] font-bold tracking-widest text-zinc-600">
              ACTIVE SKILLS
            </p>
          </div>
        </div>
      </div>

      <SkillTree skills={skills} />
    </ForgeShell>
  );
}