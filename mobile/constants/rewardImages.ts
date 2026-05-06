export const rewardImages = {
  toy: require("../assets/rewards/toy.png"),
  screen_time: require("../assets/rewards/tv.png"),
  sweet_treat: require("../assets/rewards/candy.png"),
  parents_choice: require("../assets/rewards/mystery.png"),
  family: require("../assets/rewards/family.png"),
  social: require("../assets/rewards/social.png"),
  default: require("../assets/rewards/default.png"),
} as const;

export type RewardType = keyof typeof rewardImages;

const REWARD_TYPE_ALIASES: Record<string, RewardType> = {
  family_time: "family",
  family_activity: "family",
  family_day: "family",
  parent_choice: "parents_choice",
  parentschoice: "parents_choice",
  screentime: "screen_time",
  sweettreat: "sweet_treat",
};

export const normalizeRewardType = (value: string | undefined | null): RewardType => {
  if (!value) {
    return "default";
  }

  const sanitized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (sanitized in rewardImages) {
    return sanitized as RewardType;
  }

  return REWARD_TYPE_ALIASES[sanitized] ?? "default";
};

export const getRewardImage = (value: string | undefined | null) =>
  rewardImages[normalizeRewardType(value)];
