import { Activity, Flame, Trophy, Zap } from "lucide-react";

type DashboardStatsProps = {
  streak: number;
  sessions: number;
  miles: number;
  skills: number;
};

export function DashboardStats({
  streak,
  sessions,
  miles,
  skills,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "STREAK",
      value: streak,
      suffix: "DAYS",
      icon: Flame,
    },
    {
      label: "SESSIONS",
      value: sessions,
      suffix: "",
      icon: Trophy,
    },
    {
      label: "MILES",
      value: miles.toFixed(1),
      suffix: "",
      icon: Activity,
    },
    {
      label: "SKILLS",
      value: skills,
      suffix: "",
      icon: Zap,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500">
                {stat.label}
              </span>

              <Icon className="h-4 w-4 text-[#d9ff52]" />
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">
                {stat.value}
              </span>

              {stat.suffix && (
                <span className="text-[10px] font-bold text-zinc-500">
                  {stat.suffix}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}