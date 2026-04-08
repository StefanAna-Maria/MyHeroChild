export const rewardImages = {
  toy: require("../assets/rewards/toy.png"),
  screen_time: require("../assets/rewards/tv.png"),
  sweet_treat: require("../assets/rewards/candy.png"),
  parents_choice: require("../assets/rewards/mystery.png"),
  family: require("../assets/rewards/family.png"),
  social: require("../assets/rewards/social.png"),
  default: require("../assets/rewards/default.png")
} as const;

export type RewardType = keyof typeof rewardImages;