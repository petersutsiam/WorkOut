import {
  ForgeShell,
  SectionLabel,
} from "@/components/forge-shell";

import { SkillTree } from "@/components/skills";

import {
  getCurrentUser,
  getSkillTree,
} from "@/lib/supabase/forge-data";

export const instant = false;

export default async function SkillsPage() {
  const {
    supabase,
    userId,
  } = await getCurrentUser();

  const chains =
    await getSkillTree(
      supabase,
      userId,
    );

  const totalNodes =
    chains.reduce(
      (total, chain) =>
        total + chain.nodes.length,
      0,
    );

  const completedNodes =
    chains.reduce(
      (total, chain) =>
        total +
        chain.nodes.filter(
          (node) =>
            node.status === "complete",
        ).length,
      0,
    );

  const currentNodes =
    chains.reduce(
      (total, chain) =>
        total +
        chain.nodes.filter(
          (node) =>
            node.status === "current",
        ).length,
      0,
    );

  return (
    <ForgeShell
      title="Skills"
      eyebrow="SKILL DEVELOPMENT"
      active="Skills"
    >
      <div className="mb-8">
        <SectionLabel>
          PROGRESSION TREE
        </SectionLabel>

        <div className="mt-2 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Earn your next level.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Build movement capacity one
              progression at a time. Train
              the current movement, satisfy
              its requirements, complete the
              final gate, and unlock what comes
              next.
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-2xl font-black text-[#d9ff52]">
              {currentNodes}
            </p>

            <p className="text-[9px] font-bold tracking-widest text-zinc-600">
              CURRENT
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/5 bg-zinc-900 p-3">
          <p className="text-lg font-black text-white">
            {chains.length}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-widest text-zinc-600">
            CHAINS
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900 p-3">
          <p className="text-lg font-black text-white">
            {completedNodes}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-widest text-zinc-600">
            COMPLETE
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900 p-3">
          <p className="text-lg font-black text-white">
            {totalNodes}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-widest text-zinc-600">
            TOTAL NODES
          </p>
        </div>
      </div>

      <SkillTree
        chains={chains}
      />
    </ForgeShell>
  );
}