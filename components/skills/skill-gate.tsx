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

  const trainingComplete =
    skill.training_requirement_met;

  const sessions =
    skill.training_sessions_completed ?? 0;

  const requiredSessions =
    progression.required_sessions ?? null;

  return (
    <div className="mt-5 border-t border-white/5 pt-4">
      {/* Training Requirement */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-600">
            TRAINING REQUIREMENT
          </span>

          {trainingComplete ? (
            <span className="text-[9px] font-black tracking-widest text-[#d9ff52]">
              COMPLETE
            </span>
          ) : (
            <span className="text-[9px] font-bold tracking-widest text-zinc-600">
              IN PROGRESS
            </span>
          )}
        </div>

        {requiredSessions != null && (
          <>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-bold text-white">
                {sessions} / {requiredSessions} sessions
              </p>

              <span className="text-[10px] font-bold text-zinc-600">
                {Math.min(
                  Math.round(
                    (sessions / requiredSessions) * 100,
                  ),
                  100,
                )}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[#d9ff52] transition-all"
                style={{
                  width: `${Math.min(
                    (sessions / requiredSessions) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Final Gate */}
      {progression.final_gate_required && (
        <div className="mt-5">
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
          ) : !trainingComplete ? (
            <div className="mt-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
              <p className="text-[10px] text-zinc-600">
                Complete the training requirement first.
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
              <p className="text-[10px] text-zinc-600">
                Training requirement complete.
                Pass the final gate to unlock
                the next progression.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Automatic progression */}
      {!progression.final_gate_required &&
        trainingComplete && (
          <div className="mt-5 rounded-xl border border-[#d9ff52]/20 bg-[#d9ff52]/5 px-3 py-2">
            <p className="text-[10px] font-black tracking-widest text-[#d9ff52]">
              ✓ TRAINING COMPLETE — READY TO PROGRESS
            </p>
          </div>
        )}
    </div>
  );
}