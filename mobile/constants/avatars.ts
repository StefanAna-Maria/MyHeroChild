export const avatars = {
  robot: require("../assets/avatars/robot.png"),
  dragon: require("../assets/avatars/dragon.png"),
  cat: require("../assets/avatars/clownCat.png"),
  panda: require("../assets/avatars/panda.png"),
  fox: require("../assets/avatars/fox.png"),
  unicorn: require("../assets/avatars/unicorn.png"),
  capybara: require("../assets/avatars/capybara.png"),
  goldenDog: require("../assets/avatars/goldenDog.png"),
  animeLlama: require("../assets/avatars/animeLlama.png"),
  blackDog: require("../assets/avatars/blackDog.png"),
  clownCat: require("../assets/avatars/clownCat.png"),
  crazyChicken: require("../assets/avatars/crazyChicken.png"),
  cuteBunny: require("../assets/avatars/cuteBunny.png"),
  heartEyedCat: require("../assets/avatars/heartEyedCat.png"),
} as const;

export type AvatarType = keyof typeof avatars;

export const getAvatarSource = (avatar?: string) =>
  avatars[(avatar as AvatarType) ?? "robot"] ?? avatars.robot;
