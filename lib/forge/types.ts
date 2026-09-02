export type ForgeExercise = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  difficulty: number | null;
  description?: string | null;
  instructions?: string | null;
  form_cues?: string[] | null;
  is_foundation_test: boolean | null;
  foundation_test_name: string | null;
};

export type SkillProgress = {
  exercise_id: string;

  mastery_percent: number | null;

  best_reps: number | null;
  best_sets: number | null;
  best_hold_seconds: number | null;
  best_distance: number | null;
  best_duration_minutes: number | null;

  training_sessions_completed: number | null;
  training_requirement_met: boolean;
  final_gate_completed: boolean;
  unlocked: boolean;

  last_performed_at: string | null;

  exercises:
    | ForgeExercise
    | ForgeExercise[]
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

  next_exercise: ForgeExercise | null;
};


/* ============================================================
   SKILL TREE
   ============================================================ */

export type SkillNodeStatus =
  | "complete"
  | "current"
  | "locked";

export type SkillNode = {
  exercise: ForgeExercise;

  status: SkillNodeStatus;

  mastery_percent: number;

  best_reps: number | null;
  best_sets: number | null;
  best_hold_seconds: number | null;
  best_distance: number | null;
  best_duration_minutes: number | null;

  training_sessions_completed: number;

  training_requirement_met: boolean;
  final_gate_completed: boolean;
  unlocked: boolean;

  progression: SkillProgress["progression"];

  next_exercise: ForgeExercise | null;
};

export type SkillChain = {
  id: string;
  category: string;
  nodes: SkillNode[];
};