export const TASK_TYPE_OPTIONS = [
  "default",
  "school_work",
  "reading",
  "hygiene",
  "neat_tidy",
  "chores",
  "family_help",
  "responsibility",
  "respect_kindness",
  "health",
  "life_skills",
  "self_improvement",
  "digital_balance",
  "social_skills",
  "creativity",
] as const;

export const REWARD_TYPE_OPTIONS = [
  "default",
  "toy",
  "screen_time",
  "sweet_treat",
  "parents_choice",
  "family",
  "social",
  "allowance",
  "shopping",
  "freedom",
  "gaming",
  "education",
] as const;

export type TaskTypeOption = (typeof TASK_TYPE_OPTIONS)[number];
export type RewardTypeOption = (typeof REWARD_TYPE_OPTIONS)[number];

export const formatItemTypeLabel = (value: string | undefined | null) => {
  if (!value) {
    return "Default";
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
