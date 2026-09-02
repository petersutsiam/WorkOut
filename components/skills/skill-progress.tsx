type SkillProgressProps = {
  mastery: number;
  sessions: number;
  requiredSessions: number | null;
  trainingComplete: boolean;
};

export function SkillProgress({
  mastery,
  sessions,
  requiredSessions,
  trainingComplete,
}: SkillProgressProps) {
  const safeMastery = Math.min(
    Math.max(mastery, 0),
    100,
  );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-600">
          MASTERY
        </span>

        <span className="text-xs font-black text-[#d9ff52]">
          {Math.round(safeMastery)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-[#d9ff52] transition-all duration-500"
          style={{
            width: `${safeMastery}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          TRAINING
        </span>

        <span
          className={
            trainingComplete
              ? "text-[10px] font-bold text-[#d9ff52]"
              : "text-[10px] font-bold text-zinc-400"
          }
        >
          {requiredSessions != null
            ? `${sessions} / ${requiredSessions} sessions`
            : `${sessions} sessions`}
        </span>
      </div>
    </div>
  );
}