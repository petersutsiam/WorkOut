import type { SkillProgress } from "@/lib/forge/types";

type SkillGateProps = {
  skill: SkillProgress;
};

function getGateText(skill: SkillProgress) {
  const progression = skill.progression;

  if (!progression) {
    return null;
  }

  if (progression.final_gate_description) {
    return progression.final_gate_description;
  }

  if (progression.final_gate_reps != null) {
    return `${progression.final_gate_reps} perfect reps`;
  }

  if (progression.final_gate_hold_seconds != null) {
    return `${progression.final_gate_hold_seconds}-second hold`;
  }

  if (progression.final_gate_value != null) {
    return `${progression.final_gate_value}`;
  }

  return null;
}

export function SkillGate({
  skill,
}: SkillGateProps) {
  const progression = skill.progression;

  if (!progression) {
    return null;
  }

  const gateText = getGateText(skill);

  const gateComplete =
    skill.final_gate_completed;

  return (
    <div className="mt-5 border-t border-white/5 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-600">
          FINAL GATE
        </span>

        {gateComplete ? (
          <span className="text-[9px] font-black tracking-widest text-[#d9ff52]">
            COMPLETE
          </span>
        ) : (
          <span className="text-[9px] font-bold tracking-widest text-zinc-600">
            LOCKED
          </span>
        )}
      </div>

      {gateText && (
        <p className="mt-2 text-sm font-bold text-white">
          {gateText}
        </p>
      )}

      {gateComplete ? (
        <div className="mt-3 rounded-xl border border-[#d9ff52]/20 bg-[#d9ff52]/5 px-3 py-2">
          <p className="text-[10px] font-black tracking-widest text-[#d9ff52]">
            ✓ FINAL GATE COMPLETE
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
          <p className="text-[10px] text-zinc-600">
            Complete the final gate to unlock the next progression.
          </p>
        </div>
      )}
    </div>
  );
}