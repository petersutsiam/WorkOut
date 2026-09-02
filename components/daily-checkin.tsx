"use client";

import { useEffect, useState } from "react";
import { Check, Flame, Loader2, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Checkin = {
  energy: number | null;
  soreness: number | null;
  sleep_hours: number | null;
  stress: number | null;
  readiness: number | null;
  notes: string;
};

export default function DailyCheckin() {
  const supabase = createClient();

  const [checkin, setCheckin] = useState<Checkin>({
    energy: null,
    soreness: null,
    sleep_hours: null,
    stress: null,
    readiness: null,
    notes: "",
  });

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    loadCheckin();
  }, []);

  async function loadCheckin() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in.");
        return;
      }

      /*
       * Get the real current streak.
       */
      const { data: streakData, error: streakError } =
        await supabase.rpc("get_current_streak", {
          p_user_id: user.id,
        });

      if (streakError) throw streakError;

      setCurrentStreak(streakData?.current_streak ?? 0);
      setLongestStreak(streakData?.longest_streak ?? 0);
      setCheckedInToday(
        streakData?.is_checked_in_today ?? false
      );

      /*
       * Use the user's local calendar date.
       */
      const today = new Date().toLocaleDateString("en-CA");

      /*
       * Load today's existing check-in.
       */
      const { data: existing, error: existingError } =
        await supabase
          .from("daily_checkins")
          .select(
            "energy, soreness, sleep_hours, stress, readiness, notes"
          )
          .eq("user_id", user.id)
          .eq("checkin_date", today)
          .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        setCheckin({
          energy: existing.energy,
          soreness: existing.soreness,
          sleep_hours: existing.sleep_hours,
          stress: existing.stress,
          readiness: existing.readiness,
          notes: existing.notes ?? "",
        });
      }
    } catch (error) {
      console.error("Daily check-in load error:", error);
      setMessage("Unable to load today's check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCheckin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setAchievementCount(0);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in.");
      }

      const today = new Date().toLocaleDateString("en-CA");

      const { data, error } = await supabase.rpc(
        "record_daily_checkin",
        {
          p_user_id: user.id,
          p_checkin_date: today,
          p_energy: checkin.energy,
          p_soreness: checkin.soreness,
          p_sleep_hours: checkin.sleep_hours,
          p_stress: checkin.stress,
          p_readiness: checkin.readiness,
          p_notes: checkin.notes || null,
        }
      );

      if (error) throw error;

      setCurrentStreak(data?.current_streak ?? 0);
      setLongestStreak(data?.longest_streak ?? 0);
      setCheckedInToday(true);

      const earned = data?.achievements_earned ?? 0;

      setAchievementCount(earned);

      if (earned > 0) {
        setMessage(
          `${earned} achievement${earned === 1 ? "" : "s"} unlocked`
        );
      } else {
        setMessage("Daily check-in saved");
      }
    } catch (error) {
      console.error("Daily check-in error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save check-in."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111317] p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Loader2 size={16} className="animate-spin" />
          Loading check-in...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] tracking-[0.15em] text-zinc-500">
            DAILY CHECK-IN
          </p>

          <h2 className="mt-1 text-xl font-bold">
            How are you today?
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Track readiness before you train.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-xl border border-white/10 bg-[#0d0e11] px-4 py-3">
            <div className="flex items-center gap-2">
              <Flame
                size={15}
                className="text-[#d9ff52]"
              />

              <span className="text-[9px] tracking-wider text-zinc-600">
                STREAK
              </span>
            </div>

            <div className="mt-1 text-xl font-bold">
              {currentStreak}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0e11] px-4 py-3">
            <div className="flex items-center gap-2">
              <Trophy
                size={15}
                className="text-zinc-500"
              />

              <span className="text-[9px] tracking-wider text-zinc-600">
                BEST
              </span>
            </div>

            <div className="mt-1 text-xl font-bold">
              {longestStreak}
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={submitCheckin}
        className="mt-6 space-y-5"
      >
        <Rating
          label="ENERGY"
          value={checkin.energy}
          onChange={(value) =>
            setCheckin({
              ...checkin,
              energy: value,
            })
          }
        />

        <Rating
          label="SORENESS"
          value={checkin.soreness}
          onChange={(value) =>
            setCheckin({
              ...checkin,
              soreness: value,
            })
          }
        />

        <Rating
          label="STRESS"
          value={checkin.stress}
          onChange={(value) =>
            setCheckin({
              ...checkin,
              stress: value,
            })
          }
        />

        <Rating
          label="READINESS"
          value={checkin.readiness}
          onChange={(value) =>
            setCheckin({
              ...checkin,
              readiness: value,
            })
          }
        />

        <div>
          <label className="text-[9px] tracking-[0.15em] text-zinc-500">
            SLEEP
          </label>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={checkin.sleep_hours ?? ""}
              onChange={(event) =>
                setCheckin({
                  ...checkin,
                  sleep_hours:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
              className="w-28 rounded-lg border border-white/10 bg-[#0d0e11] px-3 py-2 text-sm text-white outline-none focus:border-[#d9ff52]/50"
            />

            <span className="text-xs text-zinc-600">
              hours
            </span>
          </div>
        </div>

        <div>
          <label className="text-[9px] tracking-[0.15em] text-zinc-500">
            NOTES
          </label>

          <textarea
            value={checkin.notes}
            onChange={(event) =>
              setCheckin({
                ...checkin,
                notes: event.target.value,
              })
            }
            placeholder="Anything worth noting today?"
            className="mt-2 min-h-20 w-full resize-none rounded-lg border border-white/10 bg-[#0d0e11] px-3 py-2 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-[#d9ff52]/50"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff52] px-5 text-sm font-bold text-black transition hover:bg-[#e5ff78] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />
              Saving...
            </>
          ) : checkedInToday ? (
            <>
              <Check size={16} />
              Update Check-in
            </>
          ) : (
            "Complete Check-in"
          )}
        </button>

        {message && (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0d0e11] px-4 py-3 text-xs">
            <span className="text-zinc-400">
              {message}
            </span>

            {achievementCount > 0 && (
              <span className="font-semibold text-[#d9ff52]">
                🏆 +{achievementCount}
              </span>
            )}
          </div>
        )}
      </form>
    </section>
  );
}

function Rating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[9px] tracking-[0.15em] text-zinc-500">
          {label}
        </label>

        {value !== null && (
          <span className="text-[9px] text-[#d9ff52]">
            {value}/5
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`h-9 rounded-lg border text-xs font-semibold transition ${
              value === number
                ? "border-[#d9ff52] bg-[#d9ff52] text-black"
                : "border-white/10 bg-[#0d0e11] text-zinc-600 hover:border-white/20 hover:text-white"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}