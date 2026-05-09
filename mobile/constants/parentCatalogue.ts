import { ImageSourcePropType } from "react-native";

export type TaskItem = {
  id: number;
  title: string;
  xp: number;
  rewardPoints: number;
  type: string;
};

export type RewardItem = {
  id: number;
  title: string;
  price: number;
  type: string;
};

export type PackageItem = {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  tasks: TaskItem[];
  rewards: RewardItem[];
};

export type AgeCategory = {
  key: "3-6" | "7-9" | "10-12" | "13-15" | "16-18";
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

export const AGE_CATEGORIES: AgeCategory[] = [
  {
    key: "3-6",
    title: "Ages 3-6",
    subtitle: "Playful routines and first responsibilities",
    image: require("../assets/age_group_imgs/age3_6.png"),
  },
  {
    key: "7-9",
    title: "Ages 7-9",
    subtitle: "Confidence-building daily habits",
    image: require("../assets/age_group_imgs/age7_9.png"),
  },
  {
    key: "10-12",
    title: "Ages 10-12",
    subtitle: "Growing independence with structure",
    image: require("../assets/age_group_imgs/age10_12.png"),
  },
  {
    key: "13-15",
    title: "Ages 13-15",
    subtitle: "Responsibility with stronger ownership",
    image: require("../assets/age_group_imgs/age13_15.png"),
  },
  {
    key: "16-18",
    title: "Ages 16-18",
    subtitle: "Preparation for adult routines",
    image: require("../assets/age_group_imgs/age16_18.png"),
  },
];

export const OTHER_GROUP = "Other";

export const parseAgeRange = (value: string | undefined | null) => {
  if (!value) return null;

  const match = value.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;

  const min = Number(match[1]);
  const max = Number(match[2]);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return null;
  }

  return { min, max };
};

export const resolveAgeGroup = (value: string | undefined | null) => {
  const parsedPackageRange = parseAgeRange(value);

  if (!parsedPackageRange) {
    return OTHER_GROUP;
  }

  for (const category of AGE_CATEGORIES) {
    const parsedGroupRange = parseAgeRange(category.key);

    if (!parsedGroupRange) {
      continue;
    }

    if (
      parsedPackageRange.min >= parsedGroupRange.min &&
      parsedPackageRange.max <= parsedGroupRange.max
    ) {
      return category.key;
    }
  }

  return OTHER_GROUP;
};

export const getCategoryByKey = (key: string | undefined) =>
  AGE_CATEGORIES.find((category) => category.key === key);
