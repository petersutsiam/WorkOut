import type {
  SkillChain,
  SkillNode,
} from "@/lib/forge/types";

type SkillTreeProps = {
  chains: SkillChain[];
};

function NodeIcon({
  status,
}: {
  status: SkillNode["status"];
}) {
  if (status === "complete") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9ff52] text-black">
        <span className="text-sm font-black">
          ✓
        </span>
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#d9ff52] bg-[#d9ff52]/10">
        <div className="h-3 w-3 rounded-full bg-[#d9ff52]" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-950">
      <span className="text-xs text-zinc-700">
        🔒
      </span>
    </div>
  );
}

function StatusLabel({
  status,
}: {
  status: SkillNode["status"];
}) {
  if (status === "complete") {
    return (
      <span className="text-[9px] font-black tracking-widest text-[#d9ff52]">
        COMPLETE
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="text-[9px] font-black tracking-widest text-[#d9ff52]">
        CURRENT
      </span>
    );
  }

  return (
    <span className="text-[9px] font-bold tracking-widest text-zinc-700">
      LOCKED
    </span>
  );
}

function SkillNodeCard({
  node,
}: {
  node: SkillNode;
}) {
  const locked =
    node.status === "locked";

  const mastery = Math.min(
    100,
    Math.max(
      0,
      node.mastery_percent,
    ),
  );

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        locked
          ? "border-white/5 bg-zinc-950/60 opacity-60"
          : "border-white/10 bg-zinc-900"
      }`}
    >
      <div className="flex gap-4">
        <NodeIcon
          status={node.status}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-white">
                {node.exercise.name}
              </h3>

              {node.exercise.subcategory && (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  {node.exercise.subcategory}
                </p>
              )}
            </div>

            <StatusLabel
              status={node.status}
            />
          </div>

          {locked ? (
            <div className="mt-4">
              <p className="text-[10px] leading-5 text-zinc-700">
                Complete the previous
                progression to unlock
                this movement.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest text-zinc-600">
                  MASTERY
                </span>

                <span className="text-xs font-black text-[#d9ff52]">
                  {Math.round(mastery)}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#d9ff52] transition-all duration-500"
                  style={{
                    width: `${mastery}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest text-zinc-600">
                  TRAINING
                </span>

                <span className="text-[10px] font-bold text-zinc-400">
                  {
                    node.training_sessions_completed
                  }{" "}
                  sessions
                </span>
              </div>

              {node.final_gate_completed && (
                <div className="mt-3 rounded-lg border border-[#d9ff52]/20 bg-[#d9ff52]/5 px-3 py-2">
                  <p className="text-[9px] font-black tracking-widest text-[#d9ff52]">
                    ✓ FINAL GATE COMPLETE
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillChainView({
  chain,
}: {
  chain: SkillChain;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />

        <div className="text-center">
          <p className="text-[9px] font-black tracking-[0.25em] text-[#d9ff52]">
            {chain.category.toUpperCase()}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-widest text-zinc-700">
            {chain.nodes.length} NODES
          </p>
        </div>

        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div>
        {chain.nodes.map(
          (node, index) => (
            <div
              key={node.exercise.id}
            >
              <SkillNodeCard
                node={node}
              />

              {index <
                chain.nodes.length - 1 && (
                <div className="flex h-8 justify-center">
                  <div className="w-px bg-white/10" />
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

export function SkillTree({
  chains,
}: SkillTreeProps) {
  if (chains.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
        <p className="text-xs font-black tracking-widest text-zinc-600">
          NO PROGRESSION DATA
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Your progression tree will
          appear here once progression
          data is available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {chains.map((chain) => (
        <SkillChainView
          key={chain.id}
          chain={chain}
        />
      ))}
    </div>
  );
}