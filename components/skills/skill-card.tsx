import type { SkillProgress } from "@/lib/forge/types";

import { SkillGate } from "./skill-gate";
import { SkillProgress as SkillProgressBar } from "./skill-progress";

type SkillCardProps = {
  skill: SkillProgress;
};

function getExercise(
  skill: SkillProgress,
) {
  if (!skill.exercises) {
    return null;
  }

  if (Array.isArray(skill.exercises)) {
    return skill.exercises[0] ?? null;
  }

  return skill.exercises;
}

function getBestMetric(
  skill: SkillProgress,
) {
  if (skill.best_reps != null) {
    return `${skill.best_reps} reps`;
  }

  if (skill.best_hold_seconds != null) {
    return `${skill.best_hold_seconds}s`;
  }

  if (skill.best_distance != null) {
    return `${skill.best_distance} mi`;
  }

  if (skill.best_duration_minutes != null) {
    return `${skill.best_duration_minutes} min`;
  }

  return null;
}

export function SkillCard({
  skill,
}: SkillCardProps) {
  const exercise = getExercise(skill);

  if (!exercise) {
    return null;
  }

  const mastery = Math.round(
    Number(skill.mastery_percent ?? 0),
  );

  const sessions =
    skill.training_sessions_completed ?? 0;

  const requiredSessions =
    skill.progression?.required_sessions ?? null;

  const bestMetric = getBestMetric(skill);

  const nextExercise =
    skill.next_exercise;

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#d9ff52]">
            {exercise.category.toUpperCase()}
          </p>

          <h3 className="mt-1 text-lg font-black text-white">
            {exercise.name}
          </h3>

          {exercise.subcategory && (
            <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">
              {exercise.subcategory}
            </p>
          )}
        </div>

        {skill.final_gate_completed && (
          <span className="shrink-0 rounded-full bg-[#d9ff52]/10 px-2 py-1 text-[8px] font-black tracking-widest text-[#d9ff52]">
            GATE COMPLETE
          </span>
        )}
      </div>

      {/* Mastery */}
      <SkillProgressBar
        mastery={mastery}
        sessions={sessions}
        requiredSessions={requiredSessions}
        trainingComplete={
          skill.training_requirement_met
        }
      />

      {/* Best */}
      {bestMetric && (
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-600">
            PERSONAL BEST
          </span>

          <span className="text-xs font-black text-white">
            {bestMetric}
          </span>
        </div>
      )}

      {/* Gate */}
      <SkillGate skill={skill} />

      {/* Next progression */}
      {nextExercise && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <p className="text-[9px] font-bold tracking-[0.2em] text-zinc-600">
            NEXT PROGRESSION
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-white">
              {nextExercise.name}
            </span>

            {skill.final_gate_completed ? (
              <span className="text-[9px] font-black tracking-widest text-[#d9ff52]">
                ✓ READY
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-widest text-zinc-600">
                🔒 LOCKED
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}