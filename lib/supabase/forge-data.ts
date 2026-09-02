import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/forge/date";
import type {
  ForgeExercise,
  SkillProgress,
  SkillChain,
  SkillNode,
  SkillNodeStatus,
} from "@/lib/forge/types";

export type ForgeClient = Awaited<ReturnType<typeof createClient>>;

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : "Athlete";

  return { supabase, userId, email };
}

export async function getProfile(supabase: ForgeClient, userId: string | null) {
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name, current_level, total_xp, current_streak, longest_streak")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

export async function getExercises(supabase: ForgeClient) {
  const { data, error } = await supabase
    .from("exercises")
    .select(`
      id,
      name,
      category,
      subcategory,
      description,
      instructions,
      form_cues,
      difficulty,
      equipment,
      is_unilateral,
      is_foundation_test,
      foundation_test_name
    `)
    .order("name");

  if (error) {
    console.error("getExercises:", error);
    return [];
  }

  return data ?? [];
}

export async function getSkillProgress(
  supabase: ForgeClient,
  userId: string | null,
): Promise<SkillProgress[]> {
  if (!userId) return [];

  /*
   * Get all unlocked exercise progress for this user.
   *
   * We intentionally do not use exercises.is_skill because
   * that column does not exist in the current database schema.
   */
  const { data: progress, error: progressError } = await supabase
    .from("exercise_progress")
    .select(`
      exercise_id,
      mastery_percent,
      best_reps,
      best_sets,
      best_hold_seconds,
      best_distance,
      best_duration_minutes,
      training_sessions_completed,
      training_requirement_met,
      final_gate_completed,
      unlocked,
      last_performed_at,
      exercises (
        id,
        name,
        category,
        subcategory,
        difficulty,
        description,
        instructions,
        form_cues,
        is_foundation_test,
        foundation_test_name
      )
    `)
    .eq("user_id", userId)
    .eq("unlocked", true)
    .order("mastery_percent", {
      ascending: false,
      nullsFirst: false,
    });

  if (progressError) {
    console.error("getSkillProgress progress:", progressError);
    return [];
  }

  if (!progress || progress.length === 0) {
    return [];
  }

  /*
   * Only exercises that participate in an exercise progression
   * belong in the Skill Tree.
   */
  const exerciseIds = progress.map(
    (item) => item.exercise_id,
  );

  const { data: progressions, error: progressionError } =
    await supabase
      .from("exercise_progressions")
      .select(`
        current_exercise_id,
        next_exercise_id,
        required_sets,
        required_reps,
        required_hold_seconds,
        required_distance,
        required_duration_minutes,
        required_sessions,
        final_gate_required,
        final_gate_type,
        final_gate_value,
        final_gate_reps,
        final_gate_hold_seconds,
        final_gate_description
      `)
      .in("current_exercise_id", exerciseIds);

  if (progressionError) {
    console.error(
      "getSkillProgress progressions:",
      progressionError,
    );
    return [];
  }

  if (!progressions || progressions.length === 0) {
    return [];
  }

  /*
   * Get the exercises that are the next progression.
   */
  const nextExerciseIds = [
    ...new Set(
      progressions.map(
        (progression) => progression.next_exercise_id,
      ),
    ),
  ];

  const { data: nextExercises, error: nextExerciseError } =
    await supabase
      .from("exercises")
      .select(`
        id,
        name,
        category,
        subcategory,
        difficulty,
        description,
        instructions,
        form_cues
      `)
      .in("id", nextExerciseIds);

  if (nextExerciseError) {
    console.error(
      "getSkillProgress next exercises:",
      nextExerciseError,
    );
    return [];
  }

  /*
   * Build lookup maps so we don't repeatedly search arrays.
   */
  const progressionMap = new Map(
    progressions.map((progression) => [
      progression.current_exercise_id,
      progression,
    ]),
  );

  const nextExerciseMap = new Map(
    (nextExercises ?? []).map((exercise) => [
      exercise.id,
      exercise,
    ]),
  );

  /*
   * Only return exercises that actually participate in
   * a progression chain.
   */
  return progress
    .filter((item) =>
      progressionMap.has(item.exercise_id),
    )
    .map((item) => {
      const progression =
        progressionMap.get(item.exercise_id) ?? null;

      const nextExercise = progression
        ? nextExerciseMap.get(
            progression.next_exercise_id,
          ) ?? null
        : null;

      return {
        ...item,
        progression,
        next_exercise: nextExercise,
      } as SkillProgress;
    });
}

export async function getSkillTree(
  supabase: ForgeClient,
  userId: string | null,
): Promise<SkillChain[]> {
  if (!userId) {
    return [];
  }

  /*
   * ==========================================================
   * 1. LOAD ALL PROGRESSION RELATIONSHIPS
   *
   * The progression table is the source of truth for the
   * skill tree.
   * ==========================================================
   */

  const {
    data: progressions,
    error: progressionError,
  } = await supabase
    .from("exercise_progressions")
    .select(`
      current_exercise_id,
      next_exercise_id,
      progression_order,
      required_sets,
      required_reps,
      required_hold_seconds,
      required_distance,
      required_duration_minutes,
      required_sessions,
      final_gate_required,
      final_gate_type,
      final_gate_value,
      final_gate_reps,
      final_gate_hold_seconds,
      final_gate_description
    `)
    .order("progression_order", {
      ascending: true,
    });

  if (progressionError) {
    console.error(
      "getSkillTree progressions:",
      progressionError,
    );

    return [];
  }

  if (!progressions || progressions.length === 0) {
    return [];
  }

  /*
   * ==========================================================
   * 2. COLLECT EVERY EXERCISE IN THE TREE
   * ==========================================================
   */

  const exerciseIds = [
    ...new Set(
      progressions.flatMap((progression) => [
        progression.current_exercise_id,
        progression.next_exercise_id,
      ]),
    ),
  ];

  /*
   * ==========================================================
   * 3. LOAD EXERCISE INFORMATION
   * ==========================================================
   */

  const {
    data: exercises,
    error: exerciseError,
  } = await supabase
    .from("exercises")
    .select(`
      id,
      name,
      category,
      subcategory,
      difficulty,
      description,
      instructions,
      form_cues,
      is_foundation_test,
      foundation_test_name
    `)
    .in("id", exerciseIds);

  if (exerciseError) {
    console.error(
      "getSkillTree exercises:",
      exerciseError,
    );

    return [];
  }

  /*
   * ==========================================================
   * 4. LOAD USER PROGRESS
   *
   * Important:
   *
   * We DO NOT filter unlocked = true here.
   *
   * Locked exercises need to exist in the tree even if the
   * user has never trained them.
   * ==========================================================
   */

  const {
    data: userProgress,
    error: userProgressError,
  } = await supabase
    .from("exercise_progress")
    .select(`
      exercise_id,
      mastery_percent,
      best_reps,
      best_sets,
      best_hold_seconds,
      best_distance,
      best_duration_minutes,
      training_sessions_completed,
      training_requirement_met,
      final_gate_completed,
      unlocked,
      last_performed_at
    `)
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds);

  if (userProgressError) {
    console.error(
      "getSkillTree user progress:",
      userProgressError,
    );

    return [];
  }

  /*
   * ==========================================================
   * 5. CREATE LOOKUP MAPS
   * ==========================================================
   */

  const exerciseMap =
    new Map<string, ForgeExercise>();

  for (const exercise of exercises ?? []) {
    exerciseMap.set(
      exercise.id,
      exercise as ForgeExercise,
    );
  }

  const progressionMap =
  new Map<
    string,
    NonNullable<SkillProgress["progression"]>
  >();

  for (const progression of progressions) {
    progressionMap.set(
      progression.current_exercise_id,
      progression,
    );
  }

  const progressMap =
    new Map<
      string,
      NonNullable<typeof userProgress>[number]
    >();

  for (const progress of userProgress ?? []) {
    progressMap.set(
      progress.exercise_id,
      progress,
    );
  }

  /*
   * ==========================================================
   * 6. CREATE ALL SKILL NODES
   * ==========================================================
   */

  const nodeMap =
    new Map<string, SkillNode>();

  for (const exerciseId of exerciseIds) {
    const exercise =
      exerciseMap.get(exerciseId);

    if (!exercise) {
      continue;
    }

    const progress =
      progressMap.get(exerciseId);

    const progression =
      progressionMap.get(exerciseId) ?? null;

    const nextExercise = progression
      ? exerciseMap.get(
          progression.next_exercise_id,
        ) ?? null
      : null;

    const unlocked =
      progress?.unlocked === true;

    const finalGateCompleted =
      progress?.final_gate_completed === true;

    /*
     * Determine what the user sees.
     */

    let status: SkillNodeStatus;

    if (finalGateCompleted) {
      status = "complete";
    } else if (unlocked) {
      status = "current";
    } else {
      status = "locked";
    }

    nodeMap.set(exerciseId, {
      exercise,

      status,

      mastery_percent: Number(
        progress?.mastery_percent ?? 0,
      ),

      best_reps:
        progress?.best_reps ?? null,

      best_sets:
        progress?.best_sets ?? null,

      best_hold_seconds:
        progress?.best_hold_seconds ?? null,

      best_distance:
        progress?.best_distance ?? null,

      best_duration_minutes:
        progress?.best_duration_minutes ?? null,

      training_sessions_completed:
        progress?.training_sessions_completed ?? 0,

      training_requirement_met:
        progress?.training_requirement_met === true,

      final_gate_completed:
        finalGateCompleted,

      unlocked,

      progression,

      next_exercise: nextExercise,
    });
  }

  /*
   * ==========================================================
   * 7. FIND ROOT NODES
   *
   * Example:
   *
   * Wall Push-up
   *      ↓
   * Incline Push-up
   *      ↓
   * Knee Push-up
   *
   * Wall Push-up is the root.
   * ==========================================================
   */

  const nextExerciseIds =
    new Set(
      progressions.map(
        (progression) =>
          progression.next_exercise_id,
      ),
    );

  const rootIds = [
    ...new Set(
      progressions
        .map(
          (progression) =>
            progression.current_exercise_id,
        )
        .filter(
          (id) =>
            !nextExerciseIds.has(id),
        ),
    ),
  ];

  /*
   * ==========================================================
   * 8. WALK EACH PROGRESSION CHAIN
   * ==========================================================
   */

  const chains: SkillChain[] = [];

  for (const rootId of rootIds) {
    const nodes: SkillNode[] = [];

    const visited =
      new Set<string>();

    let currentId:
      string | null = rootId;

    while (
      currentId &&
      !visited.has(currentId)
    ) {
      visited.add(currentId);

      const node =
        nodeMap.get(currentId);

      if (!node) {
        break;
      }

      nodes.push(node);

      const progression =
        progressionMap.get(
          currentId,
        );

      currentId =
        progression?.next_exercise_id ??
        null;
    }

    if (nodes.length === 0) {
      continue;
    }

    chains.push({
      id: rootId,

      category:
        nodes[0].exercise.category ||
        "Movement",

      nodes,
    });
  }

  /*
   * ==========================================================
   * 9. HANDLE ORPHANED NODES
   *
   * This prevents progression data from disappearing if the
   * database contains a branch or incomplete chain.
   * ==========================================================
   */

  const includedIds =
    new Set(
      chains.flatMap((chain) =>
        chain.nodes.map(
          (node) =>
            node.exercise.id,
        ),
      ),
    );

  for (const node of nodeMap.values()) {
    if (includedIds.has(node.exercise.id)) {
      continue;
    }

    chains.push({
      id: node.exercise.id,

      category:
        node.exercise.category ||
        "Movement",

      nodes: [node],
    });
  }

  /*
   * ==========================================================
   * 10. SORT ACTIVE CHAINS FIRST
   * ==========================================================
   */

  chains.sort((a, b) => {
    const aActive =
      a.nodes.some(
        (node) =>
          node.status === "current" ||
          node.status === "complete",
      );

    const bActive =
      b.nodes.some(
        (node) =>
          node.status === "current" ||
          node.status === "complete",
      );

    if (aActive !== bActive) {
      return aActive ? -1 : 1;
    }

    return a.category.localeCompare(
      b.category,
    );
  });

  return chains;
}

export async function getFoundationProgress(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) {
    return {
      completed: 0,
      total: 0,
      percent: 0,
      foundation_completed: false,
    };
  }

  /*
   * Load the active foundation standards.
   */
  const { data: standards, error: standardsError } =
    await supabase
      .from("foundation_standards")
      .select(`
        id,
        test_order,
        name,
        exercise_id,
        requirement_type,
        required_value,
        required_reps,
        required_hold_seconds
      `)
      .eq("active", true)
      .order("test_order", {
        ascending: true,
      });

  if (standardsError) {
    console.error(
      "getFoundationProgress standards:",
      standardsError,
    );

    return {
      completed: 0,
      total: 0,
      percent: 0,
      foundation_completed: false,
    };
  }

  if (!standards || standards.length === 0) {
    return {
      completed: 0,
      total: 0,
      percent: 0,
      foundation_completed: false,
    };
  }

  /*
   * Load the user's foundation results.
   *
   * We intentionally use the latest result for each
   * foundation standard.
   */
  const { data: tests, error: testsError } =
    await supabase
      .from("user_foundation_tests")
      .select(`
        id,
        foundation_standard_id,
        passed,
        result_value
      `)
      .eq("user_id", userId);

  if (testsError) {
    console.error(
      "getFoundationProgress tests:",
      testsError,
    );

    return {
      completed: 0,
      total: standards.length,
      percent: 0,
      foundation_completed: false,
    };
  }

  /*
   * Find the latest test result for each standard.
   *
   * user_foundation_tests contains historical attempts,
   * so the highest id is treated as the latest attempt.
   */
  const latestTests = new Map<
    string,
    NonNullable<typeof tests>[number]
  >();

  for (const test of tests ?? []) {
    const existing =
      latestTests.get(
        test.foundation_standard_id,
      );

    if (
      !existing ||
      test.id > existing.id
    ) {
      latestTests.set(
        test.foundation_standard_id,
        test,
      );
    }
  }

  const completed = standards.filter(
    (standard) =>
      latestTests.get(standard.id)?.passed === true,
  ).length;

  const total = standards.length;

  const percent =
    total > 0
      ? Math.round(
          (completed / total) * 100,
        )
      : 0;

  /*
   * Profile is the authoritative completion flag
   * once the entire foundation has been completed.
   */
  const { data: profile } =
    await supabase
      .from("profiles")
      .select("foundation_completed")
      .eq("id", userId)
      .maybeSingle();

  return {
    completed,
    total,
    percent,
    foundation_completed:
      profile?.foundation_completed === true,
  };
}

export async function getSessionCount(
  clientOrUserId: ForgeClient | string | null,
  userId?: string | null,
) {
  const supabase = typeof clientOrUserId === "string" || clientOrUserId === null
    ? await createClient()
    : clientOrUserId;
  const resolvedUserId = typeof clientOrUserId === "string" ? clientOrUserId : userId ?? null;
  if (!resolvedUserId) return 0;

  const { count } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", resolvedUserId)
    .eq("status", "completed");

  return count ?? 0;
}

export async function getTodayCheckin(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return null;

  // Use the same local calendar date approach as the check-in component.
  const today = getLocalDateString();

  const { data, error } = await supabase
    .from("daily_checkins")
    .select(
      "id, checkin_date, energy, soreness, sleep_hours, stress, readiness, notes",
    )
    .eq("user_id", userId)
    .eq("checkin_date", today)
    .maybeSingle();

  if (error) {
    console.error("getTodayCheckin:", error);
    return null;
  }

  return data;
}

export function calculateRecoveryScore(checkin: {
  energy: number | null;
  soreness: number | null;
  sleep_hours: number | null;
  stress: number | null;
  readiness: number | null;
} | null) {
  if (!checkin) return null;

  const {
    energy,
    soreness,
    sleep_hours,
    stress,
    readiness,
  } = checkin;

  // Need enough information to produce a meaningful score.
  const values: number[] = [];

  if (energy != null) {
    values.push(energy / 5);
  }

  if (soreness != null) {
    values.push((6 - soreness) / 5);
  }

  if (sleep_hours != null) {
    // 8 hours = ideal, capped at 100%.
    values.push(Math.min(sleep_hours / 8, 1));
  }

  if (stress != null) {
    values.push((6 - stress) / 5);
  }

  if (readiness != null) {
    values.push(readiness / 5);
  }

  if (values.length === 0) return null;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 100,
  );
}

export async function getUnlockedSkillCount(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return 0;

  const { count } = await supabase
    .from("exercise_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("unlocked", true);

  return count ?? 0;
}

export async function getActivityMiles(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return 0;

  const { data } = await supabase
    .from("device_activities")
    .select("distance")
    .eq("user_id", userId);

  return (data ?? []).reduce(
    (total, activity) => total + Number(activity.distance ?? 0),
    0,
  );
}

export async function getTodayWorkout(supabase: ForgeClient, userId: string | null) {
  if (!userId) return null;

  const today = getLocalDateString();
  const { data } = await supabase
    .from("scheduled_workouts")
    .select("id, status, scheduled_date, workout_id, workouts(id, name, description, workout_type, workout_exercises(exercise_order, target_sets, target_reps, target_hold_seconds, target_distance, target_duration_minutes, rest_seconds, notes, exercises(name, category)))")
    .eq("user_id", userId)
    .eq("scheduled_date", today)
    .maybeSingle();

  return data;
}

export async function getCurrentProgramWeek(
  supabase: ForgeClient,
  userId: string | null,
) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("scheduled_workouts")
    .select(`
      scheduled_date,
      workout_id,
      workouts (
        id,
        name,
        program_week_id,
        program_weeks (
          id,
          week_number,
          name,
          focus,
          description,
          program_id,
          programs (
            id,
            name,
            total_weeks
          )
        )
      )
    `)
    .eq("user_id", userId)
    .eq("scheduled_date", getLocalDateString())
    .maybeSingle();

  if (error) {
    console.error("getCurrentProgramWeek:", error);
    return null;
  }

  return data;
}