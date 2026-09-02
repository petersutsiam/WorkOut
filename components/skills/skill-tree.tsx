import type { SkillChain, SkillNode } from "@/lib/forge/types";

type SkillTreeProps = {
  chains: SkillChain[];
};

function getStatusLabel(status: SkillNode["status"]) {
  if (status === "complete") return "COMPLETE";
  if (status === "current") return "CURRENT";
  return "LOCKED";
}

function getStatusIcon(status: SkillNode["status"]) {
  if (status === "complete") return "✓";
  if (status === "current") return "●";
  return "🔒";
}

function getTrainingRequirementText(node: SkillNode) {
  const progression = node.progression;

  if (!progression) {
    return null;
  }

  const parts: string[] = [];

  if (progression.required_sets != null) {
    parts.push(`${progression.required_sets} sets`);
  }

  if (progression.required_reps != null) {
    parts.push(`${progression.required_reps} reps`);
  }

  if (progression.required_hold_seconds != null) {
    parts.push(`${progression.required_hold_seconds}s hold`);
  }

  if (progression.required_distance != null) {
    parts.push(`${progression.required_distance} distance`);
  }

  if (progression.required_duration_minutes != null) {
    parts.push(`${progression.required_duration_minutes} min`);
  }

  if (progression.required_sessions != null) {
    parts.push(`${progression.required_sessions} sessions`);
  }

  return parts.length > 0 ? parts.join(" × ") : null;
}

function getFinalGateText(node: SkillNode) {
  const progression = node.progression;

  if (!progression?.final_gate_required) {
    return null;
  }

  if (progression.final_gate_description) {
    return progression.final_gate_description;
  }

  if (progression.final_gate_reps != null) {
    return `${progression.final_gate_reps} reps`;
  }

  if (progression.final_gate_hold_seconds != null) {
    return `${progression.final_gate_hold_seconds} second hold`;
  }

  if (progression.final_gate_value != null) {
    return `${progression.final_gate_value}`;
  }

  return "Final gate required";
}

function statusClasses(status: SkillNode["status"]) {
  switch (status) {
    case "complete":
      return "border-green-500/30 bg-green-500/[0.04]";

    case "current":
      return "border-[#d9ff52]/40 bg-[#d9ff52]/[0.04] shadow-[0_0_30px_rgba(217,255,82,0.04)]";

    case "locked":
      return "border-white/[0.05] bg-zinc-950/70 opacity-60";
  }
}

function statusBadgeClasses(status: SkillNode["status"]) {
  switch (status) {
    case "complete":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "current":
      return "border-[#d9ff52]/20 bg-[#d9ff52]/10 text-[#d9ff52]";

    case "locked":
      return "border-white/10 bg-white/[0.02] text-zinc-500";
  }
}

function formatPercent(value: number) {
  return Math.round(Math.min(Math.max(value ?? 0, 0), 100));
}

export function SkillTree({ chains }: SkillTreeProps) {
  if (chains.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-zinc-900/80 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xl">
          🔒
        </div>

        <p className="mt-4 text-sm font-bold text-white">
          No progressions available
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          Skill progressions will appear here once they are configured.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {chains.map((chain) => (
        <section key={chain.id}>
          {/* Chain header */}
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[0.25em] text-zinc-600">
                PROGRESSION CHAIN
              </p>

              <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
                {chain.category}
              </h2>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-700">
                LEVELS
              </p>

              <p className="mt-1 text-xs font-bold text-zinc-500">
                {chain.nodes.length}
              </p>
            </div>
          </div>

          {/* Nodes */}
          <div className="space-y-0">
            {chain.nodes.map((node, index) => {
              const trainingRequirementText = getTrainingRequirementText(node);
              const finalGateText = getFinalGateText(node);
              const mastery = formatPercent(node.mastery_percent);

              const isComplete = node.status === "complete";
              const isCurrent = node.status === "current";
              const isLocked = node.status === "locked";

              return (
                <div key={node.exercise.id}>
                  <article
                    className={`relative overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${statusClasses(
                      node.status,
                    )}`}
                  >
                    {/* Current indicator */}
                    {isCurrent && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-[#d9ff52]" />
                    )}

                    {/* Completed indicator */}
                    {isComplete && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-green-500/60" />
                    )}

                    {/* Header */}
                    <div className="flex items-start gap-3">
                      {/* Level number */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${
                          isComplete
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : isCurrent
                              ? "border-[#d9ff52]/20 bg-[#d9ff52]/10 text-[#d9ff52]"
                              : "border-white/10 bg-black/20 text-zinc-600"
                        }`}
                      >
                        {isComplete ? "✓" : index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-600">
                          LEVEL {index + 1}
                        </p>

                        <h3 className="mt-1 truncate text-base font-black text-white sm:text-lg">
                          {node.exercise.name}
                        </h3>
                      </div>

                      {/* Status */}
                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-bold tracking-[0.12em] ${statusBadgeClasses(
                          node.status,
                        )}`}
                      >
                        <span>{getStatusIcon(node.status)}</span>
                        <span className="hidden sm:inline">
                          {getStatusLabel(node.status)}
                        </span>
                      </span>
                    </div>

                    {/* Mastery */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[8px] font-bold tracking-[0.2em] text-zinc-600">
                          MASTERY
                        </span>

                        <span className="text-xs font-black text-white">
                          {mastery}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete
                              ? "bg-green-500"
                              : "bg-[#d9ff52]"
                          }`}
                          style={{
                            width: `${mastery}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Performance stats */}
                    {!isLocked && (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <p className="text-sm font-black text-white">
                            {node.training_sessions_completed}
                          </p>

                          <p className="mt-1 text-[7px] font-bold tracking-[0.15em] text-zinc-600">
                            SESSIONS
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <p className="text-sm font-black text-white">
                            {node.best_sets ?? "—"}
                          </p>

                          <p className="mt-1 text-[7px] font-bold tracking-[0.15em] text-zinc-600">
                            BEST SETS
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <p className="text-sm font-black text-white">
                            {node.best_reps ?? "—"}
                          </p>

                          <p className="mt-1 text-[7px] font-bold tracking-[0.15em] text-zinc-600">
                            BEST REPS
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <p
                            className={`text-sm font-black ${
                              node.training_requirement_met
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {node.training_requirement_met ? "✓" : "—"}
                          </p>

                          <p className="mt-1 text-[7px] font-bold tracking-[0.15em] text-zinc-600">
                            TRAINING GATE
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Locked explanation */}
                    {isLocked && node.next_exercise && (
                      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3">
                        <p className="text-[8px] font-bold tracking-[0.18em] text-zinc-600">
                          REQUIREMENT
                        </p>

                        <p className="mt-1 text-xs font-bold text-zinc-500">
                          Complete the previous progression to unlock.
                        </p>
                      </div>
                    )}

                    {/* Training requirement */}
                    {trainingRequirementText  && !isLocked && (
                      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-600">
                            TRAINING REQUIREMENT
                          </p>

                          {node.training_requirement_met && (
                            <span className="text-[8px] font-bold tracking-widest text-green-400">
                              ✓ MET
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm font-bold text-white">
                          {trainingRequirementText }
                        </p>
                      </div>
                    )}

                    {/* Final gate */}
                    {finalGateText && !isLocked && (
                      <div className="mt-3 rounded-xl border border-[#d9ff52]/10 bg-[#d9ff52]/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[8px] font-bold tracking-[0.2em] text-[#d9ff52]/60">
                            FINAL GATE
                          </p>

                          <span
                            className={`text-[8px] font-bold tracking-widest ${
                              node.final_gate_completed
                                ? "text-green-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {node.final_gate_completed
                              ? "✓ COMPLETE"
                              : "INCOMPLETE"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-bold text-white">
                          {finalGateText}
                        </p>
                      </div>
                    )}

                    {/* Next progression */}
                    {node.next_exercise && (
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="min-w-0">
                          <p className="text-[8px] font-bold tracking-[0.18em] text-zinc-600">
                            NEXT PROGRESSION
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-white">
                            {node.next_exercise.name}
                          </p>
                        </div>

                        <div
                          className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                            node.status === "complete"
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : "border-white/10 bg-black/20 text-zinc-600"
                          }`}
                        >
                          →
                        </div>
                      </div>
                    )}
                  </article>

                  {/* Progression connector */}
                  {index < chain.nodes.length - 1 && (
                    <div className="flex h-8 justify-center">
                      <div
                        className={`w-px ${
                          isComplete
                            ? "bg-green-500/30"
                            : "bg-white/10"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}