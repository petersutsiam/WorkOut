type TodayCheckin = {
  energy: number | null;
  soreness: number | null;
  sleep_hours: number | null;
  stress: number | null;
  readiness: number | null;
};

type RecoveryCardProps = {
  recoveryScore: number | null;
  checkin: TodayCheckin | null;
};

export function RecoveryCard({
  recoveryScore,
  checkin,
}: RecoveryCardProps) {
  let status = "CHECK IN TO SCORE";

  if (recoveryScore != null) {
    if (recoveryScore >= 80) {
      status = "READY TO TRAIN";
    } else if (recoveryScore >= 60) {
      status = "TRAIN WITH CAUTION";
    } else {
      status = "RECOVERY RECOMMENDED";
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#d9ff52]">
            RECOVERY
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            {status}
          </h2>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-white">
            {recoveryScore ?? "--"}
          </div>

          <div className="text-[10px] font-bold tracking-wider text-zinc-500">
            SCORE
          </div>
        </div>
      </div>

      {checkin ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="ENERGY"
            value={checkin.energy}
          />

          <Metric
            label="SORENESS"
            value={checkin.soreness}
          />

          <Metric
            label="SLEEP"
            value={
              checkin.sleep_hours != null
                ? `${checkin.sleep_hours}h`
                : null
            }
          />

          <Metric
            label="READINESS"
            value={checkin.readiness}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Complete your daily check-in to calculate your recovery score.
        </p>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string | null;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="text-[9px] font-bold tracking-widest text-zinc-600">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-white">
        {value ?? "--"}
      </div>
    </div>
  );
}