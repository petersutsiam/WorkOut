import {
  ForgeShell,
  SectionLabel,
} from "@/components/forge-shell";

import { SkillTree } from "@/components/skills";

import {
  getCurrentUser,
  getSkillTree,
  getFoundationProgress,
} from "@/lib/supabase/forge-data";

export const instant = false;

export default async function SkillsPage() {
  const { supabase, userId } = await getCurrentUser();

  const [chains, foundation] =
  await Promise.all([
    getSkillTree(
      supabase,
      userId,
    ),
    getFoundationProgress(
      supabase,
      userId,
    ),
  ]);

  const totalNodes = chains.reduce(
    (total, chain) =>
      total + chain.nodes.length,
    0,
  );

  const completedNodes = chains.reduce(
    (total, chain) =>
      total +
      chain.nodes.filter(
        (node) =>
          node.status === "complete",
      ).length,
    0,
  );

  const currentNodes = chains.reduce(
    (total, chain) =>
      total +
      chain.nodes.filter(
        (node) =>
          node.status === "current",
      ).length,
    0,
  );

  const unlockedNodes = chains.reduce(
    (total, chain) =>
      total +
      chain.nodes.filter(
        (node) =>
          node.status !== "locked",
      ).length,
    0,
  );

  const masteryPercent =
    totalNodes > 0
      ? Math.round(
          chains.reduce(
            (total, chain) =>
              total +
              chain.nodes.reduce(
                (chainTotal, node) =>
                  chainTotal +
                  Math.min(
                    Math.max(
                      node.mastery_percent ?? 0,
                      0,
                    ),
                    100,
                  ),
                0,
              ),
            0,
          ) / totalNodes,
        )
      : 0;

  return (
    <ForgeShell
      title="Skills"
      eyebrow="SKILL DEVELOPMENT"
      active="Skills"
    >
      {/* Hero */}
      <div className="mb-8">
        <SectionLabel>
          PROGRESSION SYSTEM
        </SectionLabel>

        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Earn your next level.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Build real movement capacity one
              progression at a time. Train,
              master the movement, pass the gate,
              and unlock what comes next.
            </p>
          </div>

          {/* Current */}
          <div className="shrink-0 rounded-2xl border border-[#d9ff52]/10 bg-[#d9ff52]/[0.03] px-5 py-4 sm:min-w-[130px] sm:text-right">
            <p className="text-2xl font-black text-[#d9ff52]">
              {currentNodes}
            </p>

            <p className="mt-1 text-[8px] font-bold tracking-[0.2em] text-zinc-600">
              CURRENT
            </p>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-900/70 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold tracking-[0.22em] text-zinc-600">
              OVERALL MASTERY
            </p>

            <p className="mt-1 text-2xl font-black text-white">
              {masteryPercent}%
            </p>
          </div>

          <p className="text-xs font-bold text-zinc-500">
            {completedNodes} / {totalNodes} complete
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-[#d9ff52] transition-all"
            style={{
              width: `${masteryPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-zinc-900 p-4">
          <p className="text-xl font-black text-white">
            {chains.length}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-[0.18em] text-zinc-600">
            CHAINS
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900 p-4">
          <p className="text-xl font-black text-white">
            {unlockedNodes}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-[0.18em] text-zinc-600">
            UNLOCKED
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900 p-4">
          <p className="text-xl font-black text-green-400">
            {completedNodes}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-[0.18em] text-zinc-600">
            COMPLETE
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900 p-4">
          <p className="text-xl font-black text-zinc-500">
            {totalNodes - unlockedNodes}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-[0.18em] text-zinc-600">
            LOCKED
          </p>
        </div>
      </div>

      {/* Foundation banner */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-[#d9ff52]/10 bg-[#d9ff52]/[0.025]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-bold tracking-[0.25em] text-[#d9ff52]/60">
                THE ULTIMATE TEST
              </p>

              <h2 className="mt-1 text-lg font-black uppercase text-white">
                True Foundation
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-600">
                Five standards. One foundation.
                Build the strength to own your
                bodyweight.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#d9ff52]"
                  style={{
                    width: "0%",
                  }}
                />
              </div>

              <span className="text-xs font-black text-white">
                0 / 5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div>
        <div className="mb-5">
          <SectionLabel>
            SKILL CHAINS
          </SectionLabel>

          <p className="mt-2 text-xs text-zinc-600">
            Complete each progression to unlock
            the next movement.
          </p>
        </div>

        <SkillTree chains={chains} />
      </div>
    </ForgeShell>
  );
}