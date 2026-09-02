type SkillProgress = {
  exercise_id: string;

  mastery_percent: number | null;

  best_reps: number | null;
  best_hold_seconds: number | null;
  best_distance: number | null;
  best_duration_minutes: number | null;

  training_sessions_completed: number | null;
  training_requirement_met: boolean;
  final_gate_completed: boolean;
  unlocked: boolean;

  exercises:
    | {
        id: string;
        name: string;
        category: string;
        subcategory: string | null;
        difficulty: number | null;
        is_foundation_test: boolean | null;
        foundation_test_name: string | null;
      }
    | {
        id: string;
        name: string;
        category: string;
        subcategory: string | null;
        difficulty: number | null;
        is_foundation_test: boolean | null;
        foundation_test_name: string | null;
      }[]
    | null;

  progression: {
    current_exercise_id: string;
    next_exercise_id: string;

    required_sets: number | null;
    required_reps: number | null;
    required_hold_seconds: number | null;
    required_distance: number | null;
    required_duration_minutes: number | null;
    required_sessions: number | null;

    final_gate_required: boolean;
    final_gate_type: string | null;
    final_gate_value: number | null;
    final_gate_reps: number | null;
    final_gate_hold_seconds: number | null;
    final_gate_description: string | null;
  } | null;

  next_exercise: {
    id: string;
    name: string;
    category: string;
    subcategory: string | null;
    difficulty: number | null;
  } | null;
};

type SkillTreeProps = {
  skills: SkillProgress[];
};

function getExercise(skill: SkillProgress) {
  if (!skill.exercises) return null;

  if (Array.isArray(skill.exercises)) {
    return skill.exercises[0] ?? null;
  }

  return skill.exercises;
}

function getGateText(skill: SkillProgress) {
  const progression = skill.progression;

  if (!progression) {
    return null;
  }

  if (progression.final_gate_description) {
    return progression.final_gate_description;
  }

  if (
    progression.final_gate_reps != null
  ) {
    return `${progression.final_gate_reps} reps`;
  }

  if (
    progression.final_gate_hold_seconds != null
  ) {
    return `${progression.final_gate_hold_seconds}s hold`;
  }

  if (
    progression.final_gate_value != null
  ) {
    return `${progression.final_gate_value}`;
  }

  return null;
}

function SkillRow({
  skill,
}: {
  skill: SkillProgress;
}) {
  const exercise = getExercise(skill);

  if (!exercise) {
    return null;
  }

  const mastery = Math.round(
    Number(skill.mastery_percent ?? 0),
  );

  const gateText = getGateText(skill);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
      {/* Current exercise */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-white">
              {exercise.name}
            </h3>

            {skill.final_gate_completed && (
              <span className="rounded-full bg-[#d9ff52]/10 px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#d9ff52]">
                GATE COMPLETE
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">
            {exercise.category}
          </p>
        </div>

        <span className="shrink-0 text-sm font-black text-[#d9ff52]">
          {mastery}%
        </span>
      </div>

      {/* Mastery bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-[#d9ff52] transition-all"
          style={{
            width: `${Math.min(mastery, 100)}%`,
          }}
        />
      </div>

      {/* Training information */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-600">
        <span>
          {skill.training_sessions_completed ?? 0} sessions
        </span>

        {skill.training_requirement_met && (
          <span className="text-zinc-400">
            Training complete
          </span>
        )}
      </div>

      {/* Progression */}
      {skill.next_exercise && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold tracking-widest text-zinc-600">
              NEXT
            </span>

            <span className="text-xs font-bold text-white">
              {skill.next_exercise.name}
            </span>
          </div>

          {gateText && (
            <p className="mt-2 text-[10px] leading-4 text-zinc-600">
              Gate: {gateText}
            </p>
          )}

          {skill.final_gate_completed ? (
            <div className="mt-2 text-[10px] font-bold text-[#d9ff52]">
              ✓ READY FOR NEXT PROGRESSION
            </div>
          ) : (
            <div className="mt-2 text-[10px] font-bold text-zinc-600">
              Complete the final gate to unlock
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SkillTree({
  skills,
}: SkillTreeProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#d9ff52]">
            PROGRESSION
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            Skill Tree
          </h2>
        </div>

        <span className="text-xs text-zinc-500">
          {skills.length} unlocked
        </span>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-500">
            No skills unlocked yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <SkillRow
              key={skill.exercise_id}
              skill={skill}
            />
          ))}
        </div>
      )}
    </section>
  );
}